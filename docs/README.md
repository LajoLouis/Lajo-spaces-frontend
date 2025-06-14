# LajoSpaces - Roommate Matching Application

## Overview
LajoSpaces is a comprehensive roommate matching platform that helps users find compatible roommates based on location preferences, lifestyle choices, and personal compatibility. The application provides a seamless experience from user registration to successful roommate connections.

## Tech Stack

### Frontend
- **React** - Modern UI library for building interactive user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **ShadCN UI** - High-quality, accessible component library
- **React Query** - Server state management and caching
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB** - NoSQL database for flexible data storage
- **Socket.io** - Real-time bidirectional event-based communication
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Image and video management

## Core Features

### 1. Authentication System
- **Multi-method Registration**: Users can sign up using email or phone number
- **Secure Login**: Email/phone verification with secure authentication
- **Profile Management**: Complete user profile creation and editing

### 2. Roommate Discovery
- **Smart Matching**: Algorithm-based roommate suggestions
- **Location-based Search**: Find roommates in specific areas
- **Preference Filtering**: Filter by lifestyle, budget, and compatibility factors

### 3. Profile Management
- **Comprehensive Profiles**: Detailed user profiles with photos and preferences
- **Profile Editing**: Update personal information and preferences
- **Photo Upload**: Multiple image support for better representation

### 4. Communication Features
- **In-app Messaging**: Direct chat with potential roommates
- **Connection Management**: View and manage roommate connections
- **Wishlist**: Save interesting profiles for later review

### 5. Space Management
- **Roommate Space Creation**: Create shared living spaces
- **Space Details**: Add location, images, and amenities information
- **Space Discovery**: Browse available roommate spaces

## Application Flow

### User Journey
1. **Registration/Login**: Users start by creating an account or logging in
2. **Profile Setup**: Complete profile with personal details and preferences
3. **Roommate Search**: Browse and search for compatible roommates
4. **Connection**: Chat and connect with potential matches
5. **Space Management**: Create or join roommate spaces

### Key User Paths
- **New User Path**: Registration → Profile Creation → Roommate Discovery
- **Returning User Path**: Login → Dashboard → Continue Conversations/Search
- **Space Creator Path**: Profile → Create Space → Manage Connections
- **Space Seeker Path**: Search → Filter → Connect → Chat

## Project Structure
```
lajospaces/
├── src/                     # React TypeScript application
│   ├── components/          # Reusable UI components
│   │   └── ui/             # ShadCN UI components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── lib/                # Library configurations
├── public/                 # Static assets
├── docs/                   # Documentation files
│   ├── README.md           # Main documentation
│   ├── FEATURES.md         # Detailed features specification
│   ├── API_DOCUMENTATION.md # API endpoints documentation
│   ├── ARCHITECTURE.md     # Technical architecture
│   ├── USER_STORIES.md     # User stories and acceptance criteria
│   └── SETUP_GUIDE.md      # Setup and installation guide
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm run dev`

### Current Status
- ✅ Frontend application running on http://localhost:8080
- ✅ Complete UI components and pages
- ✅ Authentication forms and dashboard
- ✅ Roommate discovery interface
- ✅ Responsive design for all devices

## Environment Variables
```env
# Frontend (Vite)
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001

# Backend (when implemented)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lajospaces
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## API Endpoints (Planned)
- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/profiles` - Profile operations
- `/api/roommates` - Roommate matching
- `/api/spaces` - Space management
- `/api/messages` - Messaging system

## Documentation

### 📋 [FEATURES.md](./FEATURES.md)
Comprehensive breakdown of all application features including:
- Authentication & user management
- Profile management
- Roommate discovery & matching
- Communication system
- Space management
- Safety & security features

### 🔌 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
Complete API reference including:
- Authentication endpoints
- User management APIs
- Roommate matching endpoints
- Real-time messaging APIs
- File upload endpoints

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
Technical architecture documentation covering:
- System overview and diagrams
- Frontend architecture (React/TypeScript)
- Backend architecture (Node.js/Express)
- Database design (MongoDB schemas)
- Security implementation
- Deployment architecture

### 📖 [USER_STORIES.md](./USER_STORIES.md)
User stories and acceptance criteria for:
- 8 major epics covering all functionality
- Detailed acceptance criteria
- Complete user journey mapping

### ⚙️ [SETUP_GUIDE.md](./SETUP_GUIDE.md)
Step-by-step setup instructions for:
- Backend development setup
- Database configuration
- Environment setup
- Development workflow
- Deployment options

## Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For questions or support, please refer to the documentation files in this folder or create an issue in the repository.
