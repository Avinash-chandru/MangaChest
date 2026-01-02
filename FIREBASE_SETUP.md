# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore Database for the MangaChest application.

## Prerequisites

- Node.js and npm installed
- A Google account
- Firebase CLI installed globally: `npm install -g firebase-tools`

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `mangachest` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" under Sign-in method
4. Enable "Email/Password" toggle
5. Click "Save"

## Step 3: Create Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location closest to your users
5. Click "Enable"

## Step 4: Enable Firebase Storage (Optional)

1. In your Firebase project, go to "Storage" in the left sidebar
2. Click "Get started"
3. Review the security rules
4. Choose a location
5. Click "Done"

## Step 5: Get Firebase Configuration

1. In your Firebase project, click on the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon `</>` to add a web app
5. Register your app with a nickname: `MangaChest Web`
6. Copy the Firebase configuration object

## Step 6: Update Firebase Configuration

The Firebase configuration is already set up in `src/config/firebase.js`. Your current config is:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAx5T2j_J_yNlsUpPmN2N2EDuLLvlJxsoY",
  authDomain: "mangachest-c2eef.firebaseapp.com",
  projectId: "mangachest-c2eef",
  storageBucket: "mangachest-c2eef.firebasestorage.app",
  messagingSenderId: "449425680308",
  appId: "1:449425680308:web:cd7ac151c147649d6474e1",
  measurementId: "G-P0X1KE79Z3"
};
```

If you want to use your own Firebase project, replace these values with your own configuration.

## Step 7: Deploy Security Rules

### Deploy Firestore Rules

```bash
firebase login
firebase init firestore
# Select your Firebase project
# Use the existing firestore.rules file
# Use the existing firestore.indexes.json file
firebase deploy --only firestore:rules
```

### Deploy Storage Rules (if using Storage)

```bash
firebase deploy --only storage
```

## Step 8: Set Up Admin User

The admin credentials are set in the code:
- Email: `narishkamal88@gmail.com`
- Password: `admin123`

To create the admin user:
1. Register this email through the app's register page
2. Or manually create it in Firebase Console > Authentication > Users

## Step 9: Test the Application

1. Start the development server: `npm run dev`
2. Register a new user
3. Try logging in
4. Test admin login with the admin credentials

## Firebase Features Implemented

### Authentication
- Email/Password authentication
- User registration with display name and avatar
- Login with automatic session management
- Logout functionality
- Admin user detection
- Protected routes

### Firestore Database
- Manga collection with CRUD operations
- User data storage
- Reading history tracking
- Favorites management
- Real-time data synchronization

### Security Rules
- Authenticated users can read all manga
- Only admins can create/update/delete manga
- Users can manage their own data
- Admin has full access to all collections

## Firebase CLI Commands

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

### Test with Emulators (Local Development)

```bash
firebase emulators:start
```

Then update `src/config/firebase.js` to connect to emulators:

```javascript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// After initializing auth and db
if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
- Make sure you've enabled Email/Password authentication in Firebase Console

### Issue: "Missing or insufficient permissions"
- Deploy your Firestore security rules: `firebase deploy --only firestore:rules`

### Issue: Users can't register
- Check that Email/Password is enabled in Authentication
- Check browser console for specific error messages

### Issue: Data not showing in Firestore
- Check that you've created the Firestore database
- Verify security rules are deployed correctly
- Check the browser console for permission errors

## Next Steps

1. Customize the admin email in `src/context/AuthProvider.jsx`
2. Add more manga data to Firestore
3. Implement user profiles in Firestore
4. Add Firebase Storage for manga images
5. Set up Firebase Cloud Functions for advanced features

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
