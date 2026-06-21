import { Resolver } from 'dns'
import type { Mongoose } from 'mongoose'
import type { MongoClient, Db } from 'mongodb'

interface ConnectionCache {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

let cached: ConnectionCache = (global as any).mongooseCache

if (!cached) {
  cached = (global as any).mongooseCache = { conn: null, promise: null }
}

async function resolveSrvAndTxt(host: string): Promise<{ srv: any[]; txt: string[][] }> {
  const resolvers = [
    { name: 'Default', resolver: new Resolver() },
    { name: 'Google', resolver: (() => { const r = new Resolver(); r.setServers(['8.8.8.8', '8.8.4.4']); return r; })() },
    { name: 'Cloudflare', resolver: (() => { const r = new Resolver(); r.setServers(['1.1.1.1', '1.0.0.1']); return r; })() }
  ]

  for (const r of resolvers) {
    try {
      const srvRecords = await new Promise<any[]>((resolve, reject) => {
        r.resolver.resolveSrv(`_mongodb._tcp.${host}`, (err, records) => {
          if (err) reject(err)
          else resolve(records || [])
        })
      })

      if (srvRecords && srvRecords.length > 0) {
        const txtRecords = await new Promise<string[][]>((resolve) => {
          r.resolver.resolveTxt(host, (err, records) => {
            resolve(err ? [] : (records || []))
          })
        })
        return { srv: srvRecords, txt: txtRecords }
      }
    } catch (e: any) {
      // Continue to next resolver
    }
  }

  throw new Error(`Failed to resolve MongoDB SRV records for host: ${host}`)
}

async function convertSrvToDirectUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri
  }

  const regex = /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/?([^?]*)(?:\?(.*))?$/
  const match = uri.match(regex)
  if (!match) {
    return uri
  }

  const [, username, password, host, database, queryStr] = match

  try {
    const { srv, txt } = await resolveSrvAndTxt(host)
    const hostsList = srv.map(record => `${record.name}:${record.port}`).join(',')
    const options = new URLSearchParams()

    if (txt && txt.length > 0) {
      for (const record of txt) {
        const joined = record.join('')
        const params = new URLSearchParams(joined)
        for (const [key, val] of params.entries()) {
          options.set(key, val)
        }
      }
    }

    if (queryStr) {
      const originalParams = new URLSearchParams(queryStr)
      for (const [key, val] of originalParams.entries()) {
        options.set(key, val)
      }
    }

    if (!options.has('ssl') && !options.has('tls')) {
      options.set('ssl', 'true')
    }

    const optionsStr = options.toString()
    return `mongodb://${username}:${password}@${hostsList}/${database}${optionsStr ? '?' + optionsStr : ''}`
  } catch (err: any) {
    console.warn('Failed to resolve SRV records dynamically, using original URI:', err.message)
    return uri
  }
}

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }

  // Dynamically import mongoose to guarantee it loads AFTER resolver setup is complete
  const mongooseModule = await import('mongoose')
  const mongooseInstanceDefault = mongooseModule.default || mongooseModule

  if (cached.conn) {
    const db = cached.conn.connection.db as unknown as Db
    const client = cached.conn.connection.getClient() as unknown as MongoClient
    if (!db || !client) {
      throw new Error('Mongoose connection.db or client is undefined')
    }
    return { client, db }
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      console.log('Database connecting... Resolving DNS SRV records dynamically...')
      const finalUri = await convertSrvToDirectUri(uri)
      
      const safeUri = finalUri.replace(/:([^@]+)@/, ':****@')
      console.log(`Connecting to MongoDB via: ${safeUri}`)
      
      return mongooseInstanceDefault.connect(finalUri)
    })().then((mongooseInstance) => {
      console.log(`MongoDb connected at host ${mongooseInstance.connection.host}`)
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  const db = cached.conn.connection.db as unknown as Db
  const client = cached.conn.connection.getClient() as unknown as MongoClient
  if (!db || !client) {
    throw new Error('Mongoose connection.db or client is undefined')
  }

  return { client, db }
}

export default connectToDatabase
