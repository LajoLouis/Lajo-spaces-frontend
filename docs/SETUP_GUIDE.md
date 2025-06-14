# LajoSpaces Setup Guide

## ✅ Current Status
Your frontend application is successfully running at http://localhost:8080

## 🚀 Next Steps: Backend Setup

### 1. Create Backend Structure
```bash
mkdir backend
cd backend
npm init -y
```

### 2. Install Backend Dependencies
```bash
# Core dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install express-validator multer helmet express-rate-limit
npm install socket.io nodemailer twilio

# Development dependencies
npm install -D nodemon @types/node typescript ts-node
npm install -D @types/express @types/bcryptjs @types/jsonwebtoken
```

### 3. Environment Variables
Create `.env` file in backend directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lajospaces
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (SendGrid/Nodemailer)
EMAIL_FROM=noreply@lajospaces.com
SENDGRID_API_KEY=your-sendgrid-api-key

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### 4. Backend Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── roommate.controller.js
│   │   ├── space.controller.js
│   │   └── message.controller.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Match.js
│   │   ├── Space.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── roommate.routes.js
│   │   ├── space.routes.js
│   │   └── message.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── upload.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── matching.service.js
│   │   ├── notification.service.js
│   │   └── email.service.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   ├── encryption.utils.js
│   │   └── validation.utils.js
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── socket.js
│   └── app.js
├── package.json
└── server.js
```

### 5. Database Setup (MongoDB)

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/lajospaces`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at https://cloud.mongodb.com
2. Create new cluster
3. Get connection string
4. Update MONGODB_URI in .env

### 6. Key Backend Features to Implement

#### Authentication System
- User registration with email/phone verification
- JWT-based authentication
- Password reset functionality
- Session management

#### Profile Management
- User profile CRUD operations
- Photo upload with Cloudinary
- Preference management
- Privacy settings

#### Roommate Matching
- Compatibility algorithm
- Location-based matching
- Filtering and search
- Like/pass functionality

#### Real-time Messaging
- Socket.io for real-time chat
- Message history
- Conversation management
- Online status tracking

#### Space Management
- Create/edit roommate spaces
- Photo uploads for spaces
- Search and filter spaces
- Application management

### 7. Frontend API Integration

Update frontend to connect to backend:

1. Create API service layer in `src/services/`
2. Add environment variables for API URL
3. Implement authentication context
4. Add error handling and loading states

### 8. Development Workflow

#### Start Backend:
```bash
cd backend
npm run dev
```

#### Start Frontend:
```bash
npm run dev
```

#### Both running:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

### 9. Testing Strategy

#### Backend Testing:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Authentication flow testing

#### Frontend Testing:
- Component testing with React Testing Library
- E2E testing with Cypress
- User flow testing

### 10. Deployment Options

#### Frontend:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

#### Backend:
- Railway (recommended)
- Heroku
- AWS EC2/ECS
- DigitalOcean

#### Database:
- MongoDB Atlas (recommended)
- AWS DocumentDB

## 🔧 Quick Start Commands

```bash
# 1. Setup backend
mkdir backend && cd backend
npm init -y

# 2. Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken express-validator multer helmet express-rate-limit socket.io

# 3. Install dev dependencies
npm install -D nodemon typescript ts-node @types/node @types/express

# 4. Create basic server structure
mkdir -p src/{controllers,models,routes,middleware,services,utils,config}

# 5. Start development
npm run dev
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Documentation](https://jwt.io/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 🎯 Current Application Features

Your frontend already includes:
- ✅ Beautiful landing page
- ✅ User authentication forms
- ✅ Dashboard with mock data
- ✅ Roommate discovery interface
- ✅ Responsive design
- ✅ Modern UI components

Ready to connect to your backend API!
