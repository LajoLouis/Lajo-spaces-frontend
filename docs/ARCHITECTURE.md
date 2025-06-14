# LajoSpaces - Technical Architecture

## System Overview
LajoSpaces is built as a modern full-stack web application using a microservices-inspired architecture with clear separation between frontend and backend concerns.

## Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React TS)    │◄──►│  (Node.js/      │◄──►│   (MongoDB)     │
│                 │    │   Express)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   File Storage  │    │   Redis Cache   │
│   Assets        │    │   (AWS S3)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture (React + TypeScript + Tailwind)

### Component Structure
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Layout/
│   ├── auth/            # Authentication components
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── VerificationForm/
│   ├── profile/         # Profile management
│   │   ├── ProfileCard/
│   │   ├── ProfileEditor/
│   │   └── PhotoUpload/
│   ├── roommates/       # Roommate discovery
│   │   ├── RoommateCard/
│   │   ├── MatchList/
│   │   └── SearchFilters/
│   ├── messaging/       # Chat components
│   │   ├── ChatWindow/
│   │   ├── MessageList/
│   │   └── ConversationList/
│   └── spaces/          # Space management
│       ├── SpaceCard/
│       ├── SpaceForm/
│       └── SpaceGallery/
├── pages/               # Route components
│   ├── Home/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── Profile/
│   ├── Discover/
│   ├── Messages/
│   └── Spaces/
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useWebSocket.ts
│   └── useLocalStorage.ts
├── services/            # API service layer
│   ├── api.ts
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── roommate.service.ts
│   └── messaging.service.ts
├── types/               # TypeScript definitions
│   ├── user.types.ts
│   ├── roommate.types.ts
│   ├── space.types.ts
│   └── api.types.ts
├── utils/               # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
└── store/               # State management (Context/Zustand)
    ├── authStore.ts
    ├── userStore.ts
    └── appStore.ts
```

### State Management
- **React Context** for global app state (authentication, user data)
- **Local Component State** for UI-specific state
- **Custom Hooks** for shared stateful logic
- **React Query/SWR** for server state management and caching

### Routing
- **React Router v6** for client-side routing
- **Protected Routes** for authenticated pages
- **Lazy Loading** for code splitting and performance

## Backend Architecture (Node.js + Express + MongoDB)

### Project Structure
```
src/
├── controllers/         # Route handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── roommate.controller.js
│   ├── space.controller.js
│   └── message.controller.js
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Profile.js
│   ├── Match.js
│   ├── Space.js
│   ├── Message.js
│   └── Conversation.js
├── routes/              # Express routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── roommate.routes.js
│   ├── space.routes.js
│   └── message.routes.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── upload.middleware.js
│   └── rateLimit.middleware.js
├── services/            # Business logic
│   ├── auth.service.js
│   ├── matching.service.js
│   ├── notification.service.js
│   └── email.service.js
├── utils/               # Utility functions
│   ├── jwt.utils.js
│   ├── encryption.utils.js
│   ├── validation.utils.js
│   └── logger.js
├── config/              # Configuration
│   ├── database.js
│   ├── cloudinary.js
│   └── redis.js
└── app.js               # Express app setup
```

### API Design Principles
- **RESTful Architecture** with clear resource-based URLs
- **JSON API** standard for consistent response format
- **JWT Authentication** for stateless authentication
- **Input Validation** using Joi or express-validator
- **Error Handling** with centralized error middleware

### Database Design (MongoDB)

#### Core Collections
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  phone: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Profiles Collection
{
  _id: ObjectId,
  userId: ObjectId,
  bio: String,
  age: Number,
  gender: String,
  occupation: String,
  photos: [String],
  preferences: {
    location: { city: String, state: String, radius: Number },
    budget: { min: Number, max: Number },
    lifestyle: { ... },
    demographics: { ... }
  },
  isActive: Boolean,
  lastActive: Date
}

// Matches Collection
{
  _id: ObjectId,
  user1Id: ObjectId,
  user2Id: ObjectId,
  status: String, // 'pending', 'matched', 'unmatched'
  initiatedBy: ObjectId,
  matchedAt: Date,
  createdAt: Date
}

// Spaces Collection
{
  _id: ObjectId,
  ownerId: ObjectId,
  title: String,
  description: String,
  address: { ... },
  rent: Number,
  utilities: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  images: [String],
  availableDate: Date,
  isActive: Boolean
}

// Messages Collection
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: String,
  type: String, // 'text', 'image', 'file'
  isRead: Boolean,
  sentAt: Date
}
```

### Security Implementation
- **Password Hashing** using bcrypt
- **JWT Tokens** with expiration and refresh mechanism
- **Input Sanitization** to prevent XSS attacks
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers

### Performance Optimization
- **Database Indexing** on frequently queried fields
- **Redis Caching** for session data and frequent queries
- **Image Optimization** and CDN for media files
- **API Response Caching** for static data
- **Database Connection Pooling**

## Real-time Features (WebSocket)
- **Socket.io** for real-time messaging
- **Room-based Communication** for private conversations
- **Online Status Tracking**
- **Typing Indicators**
- **Push Notifications** for mobile devices

## Third-party Integrations
- **Cloudinary** for image storage and optimization
- **SendGrid/Nodemailer** for email services
- **Twilio** for SMS verification
- **Google Maps API** for location services
- **Stripe** for payment processing (future)

## Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (Cloudflare) │
│   (Nginx)       │    │                 │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Static Assets │
│   (Vercel/      │    │                 │
│    Netlify)     │    │                 │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Backend API   │    │   Database      │
│   (Railway/     │◄──►│   (MongoDB      │
│    Heroku)      │    │    Atlas)       │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Redis Cache   │
│   (Redis Cloud) │
└─────────────────┘
```

## Development Workflow
- **Git Flow** for version control
- **ESLint + Prettier** for code formatting
- **Jest + React Testing Library** for testing
- **GitHub Actions** for CI/CD
- **Environment-based Configuration**
- **Docker** for containerization (optional)
