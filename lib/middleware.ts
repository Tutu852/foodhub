import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export type AuthenticatedRequest = NextRequest & {
  user?: {
    userId: string
    email: string
    name: string
    accountType?: 'Admin' | 'Customer'
  }
}

export function auth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    const token = req.cookies.get('auth_token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token Missing' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token is invalid' }, { status: 401 })
    }

    const authReq = req as AuthenticatedRequest
    authReq.user = decoded as any
    return handler(authReq, ...args)
  }
}

export function isAdmin(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return auth(async (req, ...args) => {
    if (req.user?.accountType !== 'Admin') {
      return NextResponse.json({ success: false, message: 'This is a Protected Route for Admin' }, { status: 401 })
    }
    return handler(req, ...args)
  })
}

export function isCustomer(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return auth(async (req, ...args) => {
    if (req.user?.accountType !== 'Customer') {
      return NextResponse.json({ success: false, message: 'This is a Protected Route for Customer' }, { status: 401 })
    }
    return handler(req, ...args)
  })
}
