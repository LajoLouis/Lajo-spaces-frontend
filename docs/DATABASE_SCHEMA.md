# LajoSpaces - Database Schema Documentation

## Overview
This document outlines the MongoDB database schema for the LajoSpaces roommate matching application. The schema is designed to support user authentication, profile management, roommate matching, messaging, and space management features.

## Collections Overview

### 1. Users Collection
Primary user authentication and basic information.

```javascript
{
  _id: ObjectId,
  email: String, // unique, required
  phone: String, // unique, optional
  password: String, // hashed with bcrypt
  firstName: String, // required
  lastName: String, // required
  isEmailVerified: Boolean, // default: false
  isPhoneVerified: Boolean, // default: false
  emailVerificationToken: String, // temporary
  phoneVerificationCode: String, // temporary
  passwordResetToken: String, // temporary
  passwordResetExpires: Date, // temporary
  lastLogin: Date,
  isActive: Boolean, // default: true
  role: String, // 'user', 'admin', default: 'user'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email: 1` (unique)
- `phone: 1` (unique, sparse)
- `emailVerificationToken: 1`
- `passwordResetToken: 1`

### 2. Profiles Collection
Detailed user profiles for roommate matching.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users, unique
  bio: String, // max 500 characters
  age: Number, // required, min: 18, max: 100
  gender: String, // 'male', 'female', 'non-binary', 'prefer-not-to-say'
  occupation: String,
  education: String,
  photos: [{
    url: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID
    isPrimary: Boolean, // default: false
    uploadedAt: Date
  }],
  location: {
    city: String, // required
    state: String, // required
    country: String, // default: 'US'
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String // optional, for spaces
  },
  preferences: {
    budget: {
      min: Number, // required
      max: Number, // required
      currency: String // default: 'USD'
    },
    location: {
      preferredCities: [String],
      maxDistance: Number, // in miles, default: 25
      neighborhoods: [String]
    },
    lifestyle: {
      sleepSchedule: String, // 'early', 'normal', 'late', 'flexible'
      cleanliness: String, // 'very_clean', 'clean', 'moderate', 'relaxed'
      socialLevel: String, // 'very_social', 'social', 'moderate', 'quiet'
      smokingAllowed: Boolean, // default: false
      drinkingAllowed: Boolean, // default: true
      petsAllowed: Boolean, // default: false
      guestsAllowed: Boolean, // default: true
      musicAllowed: Boolean, // default: true
      workFromHome: Boolean, // default: false
    },
    demographics: {
      ageRange: {
        min: Number, // default: 18
        max: Number, // default: 65
      },
      genderPreference: String, // 'male', 'female', 'any', default: 'any'
      occupationPreferences: [String],
      educationPreferences: [String]
    },
    housing: {
      housingType: [String], // 'apartment', 'house', 'condo', 'studio'
      furnished: String, // 'furnished', 'unfurnished', 'either'
      leaseDuration: String, // 'short', 'long', 'flexible'
      moveInDate: Date,
      moveOutDate: Date // optional
    }
  },
  interests: [String], // hobbies, activities
  languages: [String],
  verification: {
    isPhotoVerified: Boolean, // default: false
    isIdentityVerified: Boolean, // default: false
    backgroundCheckStatus: String, // 'none', 'pending', 'approved', 'rejected'
    verificationDate: Date
  },
  privacy: {
    profileVisibility: String, // 'public', 'matches_only', 'private'
    showAge: Boolean, // default: true
    showLocation: Boolean, // default: true
    showOccupation: Boolean, // default: true
    allowMessages: String, // 'everyone', 'matches_only', 'none'
  },
  stats: {
    profileViews: Number, // default: 0
    likesReceived: Number, // default: 0
    likesSent: Number, // default: 0
    matchesCount: Number, // default: 0
  },
  isActive: Boolean, // default: true
  isComplete: Boolean, // default: false
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId: 1` (unique)
- `location.city: 1, location.state: 1`
- `location.coordinates: '2dsphere'`
- `age: 1`
- `preferences.budget.min: 1, preferences.budget.max: 1`
- `isActive: 1, isComplete: 1`

### 3. Matches Collection
Tracks user interactions and matches.

```javascript
{
  _id: ObjectId,
  user1Id: ObjectId, // ref: Users
  user2Id: ObjectId, // ref: Users
  status: String, // 'pending', 'matched', 'unmatched', 'blocked'
  initiatedBy: ObjectId, // ref: Users (who liked first)
  action: String, // 'like', 'super_like', 'pass'
  compatibilityScore: Number, // 0-100
  matchedAt: Date, // when both users liked each other
  unmatchedAt: Date, // if unmatched
  unmatchedBy: ObjectId, // ref: Users
  unmatchReason: String,
  isActive: Boolean, // default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user1Id: 1, user2Id: 1` (compound, unique)
- `user1Id: 1, status: 1`
- `user2Id: 1, status: 1`
- `status: 1, matchedAt: -1`

### 4. Spaces Collection
Roommate spaces and housing listings.

```javascript
{
  _id: ObjectId,
  ownerId: ObjectId, // ref: Users
  title: String, // required, max 100 characters
  description: String, // max 1000 characters
  address: {
    street: String, // required
    city: String, // required
    state: String, // required
    zipCode: String, // required
    country: String, // default: 'US'
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  housing: {
    type: String, // 'apartment', 'house', 'condo', 'studio'
    bedrooms: Number, // required
    bathrooms: Number, // required
    totalRooms: Number,
    squareFootage: Number,
    furnished: String, // 'furnished', 'unfurnished', 'partial'
    parking: Boolean, // default: false
    petFriendly: Boolean, // default: false
  },
  financial: {
    rent: Number, // required
    utilities: Number, // estimated monthly utilities
    deposit: Number,
    currency: String, // default: 'USD'
    utilitiesIncluded: [String], // 'electricity', 'water', 'gas', 'internet', etc.
  },
  availability: {
    availableDate: Date, // required
    leaseDuration: String, // 'month-to-month', '6-months', '1-year', 'flexible'
    maxOccupants: Number,
    currentOccupants: Number, // default: 1 (owner)
    spotsAvailable: Number
  },
  amenities: [String], // 'gym', 'pool', 'laundry', 'parking', 'balcony', etc.
  rules: {
    smokingAllowed: Boolean, // default: false
    petsAllowed: Boolean, // default: false
    guestsAllowed: Boolean, // default: true
    partiesAllowed: Boolean, // default: false
    quietHours: {
      start: String, // '22:00'
      end: String // '08:00'
    }
  },
  images: [{
    url: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID
    caption: String,
    isPrimary: Boolean, // default: false
    uploadedAt: Date
  }],
  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    genderPreference: String, // 'male', 'female', 'any'
    occupationPreferences: [String],
    lifestylePreferences: {
      cleanliness: String,
      socialLevel: String,
      sleepSchedule: String
    }
  },
  applications: [{
    applicantId: ObjectId, // ref: Users
    message: String,
    status: String, // 'pending', 'approved', 'rejected'
    appliedAt: Date,
    respondedAt: Date
  }],
  stats: {
    views: Number, // default: 0
    applications: Number, // default: 0
    favorites: Number // default: 0
  },
  isActive: Boolean, // default: true
  isFeatured: Boolean, // default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `ownerId: 1`
- `address.city: 1, address.state: 1`
- `address.coordinates: '2dsphere'`
- `financial.rent: 1`
- `availability.availableDate: 1`
- `isActive: 1, isFeatured: -1`

### 5. Conversations Collection
Chat conversations between users.

```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // ref: Users, exactly 2 participants
  matchId: ObjectId, // ref: Matches, optional
  spaceId: ObjectId, // ref: Spaces, optional (if conversation is about a space)
  type: String, // 'match', 'space_inquiry', 'general'
  lastMessage: {
    content: String,
    senderId: ObjectId,
    sentAt: Date,
    type: String // 'text', 'image', 'file'
  },
  unreadCount: {
    [userId]: Number // unread count for each participant
  },
  isActive: Boolean, // default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `participants: 1`
- `matchId: 1`
- `spaceId: 1`
- `updatedAt: -1`

### 6. Messages Collection
Individual messages within conversations.

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId, // ref: Conversations
  senderId: ObjectId, // ref: Users
  content: String, // required for text messages
  type: String, // 'text', 'image', 'file', 'system'
  media: {
    url: String, // Cloudinary URL for images/files
    publicId: String, // Cloudinary public ID
    filename: String,
    fileSize: Number,
    mimeType: String
  },
  readBy: [{
    userId: ObjectId, // ref: Users
    readAt: Date
  }],
  isEdited: Boolean, // default: false
  editedAt: Date,
  isDeleted: Boolean, // default: false
  deletedAt: Date,
  sentAt: Date,
  createdAt: Date
}
```

**Indexes:**
- `conversationId: 1, sentAt: -1`
- `senderId: 1`
- `sentAt: -1`

### 7. Wishlists Collection
User saved profiles and spaces.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  itemType: String, // 'profile', 'space'
  itemId: ObjectId, // ref: Profiles or Spaces
  notes: String, // optional user notes
  tags: [String], // user-defined tags
  createdAt: Date
}
```

**Indexes:**
- `userId: 1, itemType: 1`
- `userId: 1, itemId: 1` (unique)
- `createdAt: -1`

### 8. Notifications Collection
User notifications and alerts.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  type: String, // 'new_match', 'new_message', 'profile_view', 'space_application'
  title: String,
  message: String,
  data: {
    // Additional data based on notification type
    matchId: ObjectId,
    messageId: ObjectId,
    spaceId: ObjectId,
    fromUserId: ObjectId
  },
  isRead: Boolean, // default: false
  readAt: Date,
  createdAt: Date
}
```

**Indexes:**
- `userId: 1, isRead: 1, createdAt: -1`
- `createdAt: -1`

## Relationships

### User → Profile (1:1)
- Each user has exactly one profile
- Profile.userId references Users._id

### User → Matches (1:Many)
- Users can have multiple matches
- Matches reference both user1Id and user2Id

### User → Spaces (1:Many)
- Users can own multiple spaces
- Spaces.ownerId references Users._id

### Match → Conversations (1:1)
- Each match can have one conversation
- Conversations.matchId references Matches._id

### Conversation → Messages (1:Many)
- Each conversation can have multiple messages
- Messages.conversationId references Conversations._id

### User → Wishlists (1:Many)
- Users can have multiple wishlist items
- Wishlists.userId references Users._id

## Data Validation Rules

### Users
- Email must be unique and valid format
- Phone must be unique if provided
- Password must be at least 8 characters

### Profiles
- Age must be between 18-100
- Budget min must be less than max
- At least one photo required for active profiles

### Spaces
- Rent must be positive number
- Available date cannot be in the past
- At least one image required

### Messages
- Content required for text messages
- Media required for image/file messages
- Sender must be participant in conversation

## Performance Considerations

### Indexing Strategy
- Geospatial indexes for location-based queries
- Compound indexes for common query patterns
- Text indexes for search functionality

### Data Archiving
- Soft delete for user data (isActive: false)
- Archive old messages after 2 years
- Remove unverified users after 30 days

### Caching Strategy
- Cache user profiles for 15 minutes
- Cache space listings for 5 minutes
- Cache match recommendations for 1 hour
