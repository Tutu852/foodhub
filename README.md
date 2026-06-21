# FoodHub - Online Food Delivery Platform

A modern, full-stack food delivery application built with Next.js 16, MongoDB, and Tailwind CSS. Features user authentication, food catalog browsing, favorites management, and order tracking.

## Features

- **User Authentication**: Secure signup/login with email and password using bcryptjs and JWT tokens stored in HttpOnly cookies
- **Food Catalog**: Browse and search foods by category with real-time filtering
- **Favorites System**: Save your favorite meals for quick access
- **Order Management**: Create and track orders with delivery address and status updates
- **User Profiles**: Manage your account information and view order history
- **Responsive Design**: Mobile-first design with Tailwind CSS and smooth animations using Framer Motion
- **Modern UI**: Glassmorphism effects, gradient backgrounds, and smooth transitions

## Tech Stack

- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT + HttpOnly Cookies
- **Password Hashing**: bcryptjs
- **Animations**: Framer Motion
- **Validation**: Zod

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints (signup, login, logout, profile)
│   │   ├── foods/         # Food catalog endpoints
│   │   ├── orders/        # Order management endpoints
│   │   └── favorites/     # Favorites management
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── home/              # Food catalog page
│   ├── food/[id]/         # Food details page
│   ├── profile/           # User profile page
│   ├── favorites/         # Favorites page
│   ├── orders/            # Orders page
│   └── layout.tsx         # Root layout
├── components/
│   ├── navbar.tsx         # Navigation component
│   ├── auth-form.tsx      # Reusable auth form
│   ├── food-card.tsx      # Food item card
│   └── loading-spinner.tsx # Loading indicator
├── lib/
│   ├── db.ts              # MongoDB connection
│   ├── auth.ts            # Authentication utilities
│   └── auth-context.tsx   # Auth context provider
├── public/
│   └── foods/             # Food images
├── scripts/
│   └── seed.ts            # Database seeding script
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- MongoDB running locally or MongoDB Atlas connection string

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/foodhub
   JWT_SECRET=your_secure_jwt_secret_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Seed the database** (optional):
   ```bash
   pnpm exec ts-node scripts/seed.ts
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Foods
- `GET /api/foods` - Get all foods (supports `category` and `search` query params)
- `GET /api/foods/[id]` - Get food details

### Orders
- `GET /api/orders` - Get user's orders (requires auth)
- `POST /api/orders` - Create new order (requires auth)

### Favorites
- `GET /api/favorites` - Get user's favorites (requires auth)
- `POST /api/favorites` - Toggle favorite status (requires auth)

## Sample Data

The application comes with 8 sample food items across 4 categories:
- **Pizza**: Margherita, Pepperoni
- **Burgers**: Chicken, Classic Cheeseburger
- **Salads**: Caesar, Cobb
- **Desserts**: Chocolate Cake, Strawberry Cheesecake

Run the seed script to populate the database.

## Key Features Implementation

### Authentication Flow
- Users can sign up with email and password
- Passwords are hashed using bcryptjs
- JWT tokens are generated and stored in HttpOnly cookies for security
- Authentication is required for user-specific endpoints

### Food Catalog
- Browse all foods or filter by category
- Real-time search functionality
- View detailed information for each food item
- Add/remove favorites from food cards

### Order Management
- Create orders with delivery address
- Track order status (pending, processing, delivered)
- View order history and details

### User Profile
- View and edit user information
- See total favorites and orders count
- Manage account settings

## Development

### Adding New Pages
1. Create a new directory under `app/`
2. Add `page.tsx` for the route
3. Use the `Navbar` component for consistency

### Adding New API Routes
1. Create a directory under `app/api/`
2. Create `route.ts` with your handler functions
3. Use authentication utilities from `lib/auth.ts` for protected routes

### Styling
- Uses Tailwind CSS v4 with custom design tokens
- Design tokens are defined in `app/globals.css`
- Components use semantic design tokens (primary, secondary, accent, etc.)

## Deployment

1. **Push to GitHub** (if using GitHub):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy to Vercel**:
   - Import the repository on Vercel
   - Set environment variables in project settings
   - Deploy!

## Future Enhancements

- Payment integration (Stripe)
- Real-time order tracking with WebSockets
- Restaurant management dashboard
- Reviews and ratings system
- Promo codes and discounts
- Push notifications for order updates
- Admin panel for food management

## License

MIT License - feel free to use this for any purpose.

## Support

For issues or questions, please open an issue on GitHub or contact support.
