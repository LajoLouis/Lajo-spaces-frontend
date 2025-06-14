# LajoSpaces API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.lajospaces.com/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### POST `/auth/register`
Register a new user account
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/auth/login`
Authenticate user and return JWT token
```json
{
  "identifier": "user@example.com", // email or phone
  "password": "securePassword123"
}
```

#### POST `/auth/verify-email`
Verify email address with verification code
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

#### POST `/auth/verify-phone`
Verify phone number with SMS code
```json
{
  "phone": "+1234567890",
  "verificationCode": "123456"
}
```

#### POST `/auth/forgot-password`
Request password reset
```json
{
  "identifier": "user@example.com"
}
```

#### POST `/auth/reset-password`
Reset password with reset token
```json
{
  "resetToken": "abc123",
  "newPassword": "newSecurePassword123"
}
```

### 2. User Management (`/api/users`)

#### GET `/users/profile`
Get current user's profile (Protected)

#### PUT `/users/profile`
Update user profile (Protected)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Looking for a clean and quiet roommate",
  "occupation": "Software Engineer",
  "age": 25,
  "gender": "male"
}
```

#### POST `/users/upload-photo`
Upload profile photo (Protected)
- Multipart form data with image file

#### DELETE `/users/photo/:photoId`
Delete a profile photo (Protected)

#### GET `/users/:userId`
Get public profile of another user (Protected)

### 3. Roommate Matching (`/api/roommates`)

#### GET `/roommates/discover`
Get recommended roommate profiles (Protected)
Query parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `minAge`: Minimum age filter
- `maxAge`: Maximum age filter
- `gender`: Gender preference
- `location`: Location filter

#### POST `/roommates/like`
Like a roommate profile (Protected)
```json
{
  "targetUserId": "user123",
  "isSuper": false
}
```

#### POST `/roommates/pass`
Pass on a roommate profile (Protected)
```json
{
  "targetUserId": "user123"
}
```

#### GET `/roommates/matches`
Get all current matches (Protected)

#### DELETE `/roommates/unmatch/:matchId`
Unmatch with a user (Protected)

### 4. Preferences (`/api/preferences`)

#### GET `/preferences`
Get user's roommate preferences (Protected)

#### PUT `/preferences`
Update roommate preferences (Protected)
```json
{
  "location": {
    "city": "New York",
    "state": "NY",
    "radius": 10
  },
  "budget": {
    "min": 800,
    "max": 1500
  },
  "lifestyle": {
    "sleepSchedule": "early",
    "cleanliness": "very_clean",
    "socialLevel": "moderate",
    "petsAllowed": true,
    "smokingAllowed": false
  },
  "demographics": {
    "ageRange": { "min": 22, "max": 30 },
    "genderPreference": "any"
  }
}
```

### 5. Spaces Management (`/api/spaces`)

#### GET `/spaces`
Get available roommate spaces (Protected)
Query parameters:
- `city`: City filter
- `minRent`: Minimum rent
- `maxRent`: Maximum rent
- `bedrooms`: Number of bedrooms
- `amenities`: Comma-separated amenities

#### POST `/spaces`
Create a new roommate space (Protected)
```json
{
  "title": "Spacious 2BR Apartment",
  "description": "Looking for a clean roommate",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "rent": 1200,
  "utilities": 150,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["gym", "parking", "laundry"],
  "availableDate": "2024-02-01",
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### GET `/spaces/:spaceId`
Get detailed space information (Protected)

#### PUT `/spaces/:spaceId`
Update space information (Protected, owner only)

#### DELETE `/spaces/:spaceId`
Delete a space (Protected, owner only)

#### POST `/spaces/:spaceId/apply`
Apply to join a space (Protected)
```json
{
  "message": "I'm interested in this space!"
}
```

### 6. Messaging (`/api/messages`)

#### GET `/messages/conversations`
Get all user conversations (Protected)

#### GET `/messages/conversations/:conversationId`
Get messages in a conversation (Protected)
Query parameters:
- `page`: Page number
- `limit`: Messages per page

#### POST `/messages/conversations/:conversationId`
Send a message (Protected)
```json
{
  "content": "Hello! I'm interested in being roommates.",
  "type": "text"
}
```

#### POST `/messages/conversations`
Start a new conversation (Protected)
```json
{
  "participantId": "user123",
  "initialMessage": "Hi there!"
}
```

#### PUT `/messages/:messageId/read`
Mark message as read (Protected)

### 7. Wishlist (`/api/wishlist`)

#### GET `/wishlist`
Get user's wishlist items (Protected)

#### POST `/wishlist`
Add item to wishlist (Protected)
```json
{
  "type": "profile", // or "space"
  "itemId": "user123"
}
```

#### DELETE `/wishlist/:itemId`
Remove item from wishlist (Protected)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

## WebSocket Events (Real-time Features)
- `new_message` - New chat message received
- `new_match` - New roommate match
- `user_online` - User came online
- `user_offline` - User went offline
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
