import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import dns from 'dns'

dns.setServers(['8.8.8.8', '8.8.4.4'])

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rajeshkumarb393_db_user:Tutu852@cluster0.j106qtm.mongodb.net/foodhub'

const sampleFoods = [
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce',
    price: 12.99,
    category: 'Pizza',
    image: '/foods/pizza-margherita.png',
    rating: 4.8,
    reviews: 324,
    prepTime: 20,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with pepperoni and melted cheese',
    price: 14.99,
    category: 'Pizza',
    image: '/foods/pizza-pepperoni.png',
    rating: 4.7,
    reviews: 512,
    prepTime: 20,
  },
  {
    name: 'Grilled Chicken Burger',
    description: 'Juicy grilled chicken breast with lettuce, tomato, and special sauce',
    price: 10.99,
    category: 'Burgers',
    image: '/foods/burger-chicken.png',
    rating: 4.6,
    reviews: 287,
    prepTime: 15,
  },
  {
    name: 'Classic Cheeseburger',
    description: 'Beef patty with cheddar cheese, pickles, and onions',
    price: 9.99,
    category: 'Burgers',
    image: '/foods/burger-classic.png',
    rating: 4.5,
    reviews: 456,
    prepTime: 15,
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan, croutons, and Caesar dressing',
    price: 8.99,
    category: 'Salads',
    image: '/foods/salad-caesar.png',
    rating: 4.4,
    reviews: 198,
    prepTime: 10,
  },
  {
    name: 'Cobb Salad',
    description: 'Mixed greens with chicken, bacon, avocado, and blue cheese',
    price: 11.99,
    category: 'Salads',
    image: '/foods/salad-cobb.png',
    rating: 4.7,
    reviews: 234,
    prepTime: 12,
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich and moist chocolate cake with chocolate frosting',
    price: 5.99,
    category: 'Desserts',
    image: '/foods/dessert-chocolate.png',
    rating: 4.9,
    reviews: 678,
    prepTime: 5,
  },
  {
    name: 'Strawberry Cheesecake',
    description: 'Creamy cheesecake with fresh strawberry topping',
    price: 6.99,
    category: 'Desserts',
    image: '/foods/dessert-cheesecake.png',
    rating: 4.8,
    reviews: 543,
    prepTime: 5,
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('foodhub')

    // Clear existing foods
    await db.collection('foods').deleteMany({})
    console.log('Cleared existing foods')

    // Insert sample foods
    const result = await db.collection('foods').insertMany(sampleFoods)
    console.log(`Inserted ${result.insertedCount} foods`)

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seedDatabase()
