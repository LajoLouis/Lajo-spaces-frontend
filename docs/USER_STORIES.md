# LajoSpaces - User Stories

## Epic 1: User Authentication & Onboarding

### Story 1.1: User Registration
**As a** new user  
**I want to** create an account using my email or phone number  
**So that** I can access the roommate matching platform  

**Acceptance Criteria:**
- User can register with email address
- User can register with phone number
- Password must meet security requirements
- Verification email/SMS is sent upon registration
- User cannot access the platform until verified

### Story 1.2: Account Verification
**As a** registered user  
**I want to** verify my email/phone number  
**So that** I can activate my account and ensure security  

**Acceptance Criteria:**
- User receives verification code via email/SMS
- User can enter verification code to activate account
- Verification code expires after reasonable time
- User can request new verification code if needed

### Story 1.3: User Login
**As a** registered user  
**I want to** log into my account  
**So that** I can access my profile and find roommates  

**Acceptance Criteria:**
- User can login with email/phone and password
- System remembers user session
- User can reset password if forgotten
- Account locks after multiple failed attempts

## Epic 2: Profile Management

### Story 2.1: Profile Creation
**As a** new user  
**I want to** create a detailed profile  
**So that** potential roommates can learn about me  

**Acceptance Criteria:**
- User can add personal information (name, age, occupation)
- User can upload multiple profile photos
- User can write a bio/description
- User can set lifestyle preferences
- Profile is saved and can be edited later

### Story 2.2: Profile Editing
**As a** registered user  
**I want to** update my profile information  
**So that** I can keep my information current and accurate  

**Acceptance Criteria:**
- User can edit all profile fields
- User can add/remove photos
- User can update preferences
- Changes are saved immediately
- User can preview how profile appears to others

### Story 2.3: Privacy Settings
**As a** user  
**I want to** control who can see my profile information  
**So that** I can maintain my privacy and safety  

**Acceptance Criteria:**
- User can set profile visibility (public/private)
- User can control which information is visible
- User can block specific users
- User can report inappropriate behavior

## Epic 3: Roommate Discovery

### Story 3.1: Browse Potential Roommates
**As a** user  
**I want to** browse profiles of potential roommates  
**So that** I can find compatible living partners  

**Acceptance Criteria:**
- User sees recommended profiles based on preferences
- User can view detailed profiles with photos
- User can like or pass on profiles
- User can see compatibility scores
- System learns from user preferences

### Story 3.2: Search and Filter
**As a** user  
**I want to** search for roommates using specific criteria  
**So that** I can find people who match my requirements  

**Acceptance Criteria:**
- User can filter by location/distance
- User can filter by age range
- User can filter by lifestyle preferences
- User can filter by budget range
- User can save search preferences

### Story 3.3: Matching System
**As a** user  
**I want to** be matched with compatible roommates  
**So that** I can connect with people who share similar preferences  

**Acceptance Criteria:**
- System suggests compatible profiles
- Mutual likes create matches
- User receives notifications for new matches
- User can see all current matches
- User can unmatch if needed

## Epic 4: Communication

### Story 4.1: Messaging
**As a** matched user  
**I want to** chat with potential roommates  
**So that** I can get to know them better before meeting  

**Acceptance Criteria:**
- User can send text messages to matches
- User can see message history
- User receives real-time notifications
- User can see when messages are read
- User can share photos in chat

### Story 4.2: Conversation Management
**As a** user  
**I want to** manage my conversations  
**So that** I can stay organized and focused on serious prospects  

**Acceptance Criteria:**
- User can see all active conversations
- User can search conversation history
- User can delete conversations
- User can report inappropriate messages
- User can block users from messaging

## Epic 5: Space Management

### Story 5.1: Create Roommate Space
**As a** user with available housing  
**I want to** create a listing for my space  
**So that** I can find roommates to share costs  

**Acceptance Criteria:**
- User can add property details (location, rent, amenities)
- User can upload photos of the space
- User can set availability dates
- User can specify roommate requirements
- Listing appears in search results

### Story 5.2: Browse Available Spaces
**As a** user looking for housing  
**I want to** browse available roommate spaces  
**So that** I can find suitable living arrangements  

**Acceptance Criteria:**
- User can view all available spaces
- User can filter by location and price
- User can see detailed space information
- User can view photo galleries
- User can contact space owners

### Story 5.3: Apply to Spaces
**As a** user  
**I want to** apply to join existing roommate spaces  
**So that** I can secure housing with compatible roommates  

**Acceptance Criteria:**
- User can express interest in spaces
- User can send application messages
- Space owners can review applications
- User receives notifications about application status
- User can schedule property viewings

## Epic 6: User Experience

### Story 6.1: Dashboard
**As a** user  
**I want to** see an overview of my activity  
**So that** I can quickly access important information  

**Acceptance Criteria:**
- User sees recent matches and messages
- User sees recommended profiles
- User can access all main features
- User sees notifications and alerts
- Dashboard updates in real-time

### Story 6.2: Wishlist
**As a** user  
**I want to** save interesting profiles and spaces  
**So that** I can review them later  

**Acceptance Criteria:**
- User can add profiles to wishlist
- User can add spaces to wishlist
- User can organize wishlist items
- User can remove items from wishlist
- User receives updates about wishlist items

### Story 6.3: Mobile Experience
**As a** mobile user  
**I want to** access all features on my phone  
**So that** I can use the app anywhere  

**Acceptance Criteria:**
- All features work on mobile devices
- Interface is touch-friendly
- App loads quickly on mobile
- Images are optimized for mobile
- Offline functionality for basic features

## Epic 7: Safety & Security

### Story 7.1: User Verification
**As a** user  
**I want to** verify other users' identities  
**So that** I can feel safe when meeting potential roommates  

**Acceptance Criteria:**
- Users can verify their identity
- Verified users have badges
- User can see verification status
- System encourages verification
- Multiple verification methods available

### Story 7.2: Reporting System
**As a** user  
**I want to** report inappropriate behavior  
**So that** the platform remains safe for everyone  

**Acceptance Criteria:**
- User can report profiles or messages
- User can block other users
- Reports are reviewed by moderators
- Appropriate actions are taken
- User receives feedback on reports

## Epic 8: Notifications

### Story 8.1: Real-time Notifications
**As a** user  
**I want to** receive notifications about important events  
**So that** I don't miss opportunities or messages  

**Acceptance Criteria:**
- User receives notifications for new matches
- User receives notifications for new messages
- User receives notifications for profile views
- User can customize notification preferences
- Notifications work across devices
