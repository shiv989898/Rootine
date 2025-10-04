# Firebase Security Rules for Rootine

## Firestore Rules

These rules ensure that users can only access and modify their own data, while allowing read access to public information.

### Copy and paste these rules into Firebase Console > Firestore Database > Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone signed in can read user profiles
      allow read: if isSignedIn();
      // Users can only write to their own profile
      allow create, update: if isOwner(userId);
      // Users can't delete their profile (optional, can be changed)
      allow delete: if false;
    }
    
    // Habits collection
    match /habits/{habitId} {
      // Users can read their own habits
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can create habits for themselves
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Users can update their own habits
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can delete their own habits
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Posts collection (social feed)
    match /posts/{postId} {
      // Anyone signed in can read posts
      allow read: if isSignedIn();
      // Users can create posts for themselves
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own posts
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      // Anyone signed in can read challenges
      allow read: if isSignedIn();
      // Users can create challenges
      allow create: if isSignedIn() && request.resource.data.creatorId == request.auth.uid;
      // Challenge creators can update their challenges
      allow update: if isSignedIn() && resource.data.creatorId == request.auth.uid;
      // Challenge creators can delete their challenges
      allow delete: if isSignedIn() && resource.data.creatorId == request.auth.uid;
    }
    
    // Challenge progress
    match /challengeProgress/{progressId} {
      // Users can read their own progress and friends' progress
      allow read: if isSignedIn();
      // Users can create/update their own progress
      allow create, update: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Users can delete their own progress
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Diet plans
    match /dietPlans/{planId} {
      // Users can read their own diet plans
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can create diet plans for themselves
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Users can update their own diet plans
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can delete their own diet plans
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Shopping lists
    match /shoppingLists/{listId} {
      // Users can read their own shopping lists
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can create shopping lists for themselves
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Users can update their own shopping lists
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can delete their own shopping lists
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      // System can create notifications
      allow create: if isSignedIn();
      // Users can mark notifications as read
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      // Users can delete their own notifications
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Storage Rules

These rules control access to uploaded files (photos, avatars, etc.).

### Copy and paste these rules into Firebase Console > Storage > Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isUnder5MB() {
      return request.resource.size < 5 * 1024 * 1024;
    }
    
    // User-specific storage (avatars, habit photos, post images)
    match /users/{userId}/{allPaths=**} {
      // Anyone can read (for public profiles and posts)
      allow read: if isSignedIn();
      // Users can only write to their own folder
      allow write: if isSignedIn() 
                   && isOwner(userId) 
                   && isImage() 
                   && isUnder5MB();
      // Users can delete their own files
      allow delete: if isSignedIn() && isOwner(userId);
    }
    
    // Public storage (community resources, etc.)
    match /public/{allPaths=**} {
      // Anyone can read public files
      allow read: if true;
      // Only admins can write to public storage
      allow write: if false; // Set to admin check if needed
    }
  }
}
```

## Security Best Practices

1. **Never expose API keys in client code** - Use environment variables
2. **Validate data on the server side** - Use Cloud Functions for complex validation
3. **Rate limit API calls** - Implement App Check for additional security
4. **Sanitize user input** - Prevent XSS attacks
5. **Use HTTPS only** - Firebase enforces this by default
6. **Monitor usage** - Set up alerts for unusual activity
7. **Review rules regularly** - Update as features are added
8. **Test your rules** - Use Firebase Rules Playground

## Testing Rules

Use the Firebase Console's Rules Playground to test your rules:

1. Go to Firestore Database > Rules
2. Click on "Rules Playground"
3. Select operation type (read, write, etc.)
4. Enter document path
5. Simulate authentication
6. Run simulation

## Notes

- Guest users (local only) won't be able to access Firestore
- Consider implementing Cloud Functions for:
  - User creation triggers
  - Data validation
  - Automated notifications
  - Complex queries
  - Background jobs

## Additional Security with App Check

For production, enable Firebase App Check:

1. Go to Firebase Console > App Check
2. Enable for your app
3. Configure reCAPTCHA for web
4. Configure DeviceCheck/SafetyNet for mobile
5. Enforce in your rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null 
                        && request.app != null; // App Check verification
    }
  }
}
```

This adds an extra layer of protection against abuse and automated attacks.
