import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

const sampleFoods = [
  {
    name: 'Margherita Pizza',
    description: 'Fresh basil, mozzarella cheese, and tomato sauce on a thin crust',
    price: 12.99,
    category: 'Pizza',
    image: '/foods/margherita-pizza.png',
    rating: 4.8,
    reviews: [],
    inStock: true,
    preparationTime: 20,
    createdAt: new Date(),
  },
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
    price: 10.99,
    category: 'Burgers',
    image: '/foods/classic-burger.png',
    rating: 4.7,
    reviews: [],
    inStock: true,
    preparationTime: 15,
    createdAt: new Date(),
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan shavings, croutons, and caesar dressing',
    price: 8.99,
    category: 'Salads',
    image: '/foods/caesar-salad.png',
    rating: 4.6,
    reviews: [],
    inStock: true,
    preparationTime: 5,
    createdAt: new Date(),
  },
  {
    name: 'Sushi Platter',
    description: 'Assorted nigiri and rolls with fresh salmon, tuna, cucumber, and avocado',
    price: 18.99,
    category: 'Asian',
    image: '/foods/sushi-platter.png',
    rating: 4.9,
    reviews: [],
    inStock: true,
    preparationTime: 25,
    createdAt: new Date(),
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with crispy bacon, parmesan cheese, and fresh parsley',
    price: 13.99,
    category: 'Pasta',
    image: '/foods/pasta-carbonara.png',
    rating: 4.8,
    reviews: [],
    inStock: true,
    preparationTime: 18,
    createdAt: new Date(),
  },
  {
    name: 'Street Tacos',
    description: 'Seasoned beef tacos with onions, cilantro, lime, and fresh salsa',
    price: 9.99,
    category: 'Mexican',
    image: '/foods/tacos.png',
    rating: 4.7,
    reviews: [],
    inStock: true,
    preparationTime: 12,
    createdAt: new Date(),
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with layers of moist sponge and creamy frosting',
    price: 7.99,
    category: 'Desserts',
    image: '/foods/chocolate-cake.png',
    rating: 4.9,
    reviews: [],
    inStock: true,
    preparationTime: 3,
    createdAt: new Date(),
  },
  {
    name: 'Grilled Chicken Sandwich',
    description: 'Perfectly grilled chicken breast with fresh vegetables and mayo',
    price: 11.99,
    category: 'Sandwiches',
    image: '/foods/margherita-pizza.png',
    rating: 4.6,
    reviews: [],
    inStock: true,
    preparationTime: 14,
    createdAt: new Date(),
  },
]

async function seedDatabase() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db('foodhub')
    const foodsCollection = db.collection('foods')

    // Clear existing foods
    await foodsCollection.deleteMany({})
    console.log('Cleared existing foods')

    // Insert sample foods
    const result = await foodsCollection.insertMany(sampleFoods)
    console.log(`Successfully inserted ${result.insertedCount} foods`)

    // Create indexes
    await foodsCollection.createIndex({ name: 'text', description: 'text' })
    await foodsCollection.createIndex({ category: 1 })
    console.log('Created indexes')

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

seedDatabase()
