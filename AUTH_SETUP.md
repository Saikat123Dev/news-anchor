# News Anchor - Google Authentication Setup

This guide will help you set up Google OAuth authentication for your News Anchor application.

## Prerequisites

1. **Google Cloud Console Account**: You need a Google account to access the Google Cloud Console
2. **Database**: PostgreSQL database (already configured via Neon)
3. **Node.js**: Ensure you have Node.js installed

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project (if needed)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter "News Anchor" as the project name
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - If prompted, configure the OAuth consent screen:
     - Choose "External" user type
     - Fill in the required fields:
       - App name: "News Anchor"
       - User support email: your email
       - Developer contact email: your email
     - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
     - Add test users (your email) if in development

5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "News Anchor Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/auth/google/callback` (backend callback)
   - Click "Create"

6. **Save Credentials**
   - Copy the Client ID and Client Secret
   - You'll need these for your environment variables

## Step 2: Environment Configuration

1. **Backend Environment**
   - Copy `/backend/.env.example` to `/backend/.env`
   - Update the following variables:
     ```bash
     GOOGLE_CLIENT_ID=your_actual_client_id_here
     GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
     JWT_SECRET=generate_a_32_character_random_string
     SESSION_SECRET=generate_another_32_character_random_string
     ```

2. **Frontend Environment**
   - Copy `/frontend/.env.local.example` to `/frontend/.env.local`
   - Update the following variables:
     ```bash
     GOOGLE_CLIENT_ID=your_actual_client_id_here (same as backend)
     GOOGLE_CLIENT_SECRET=your_actual_client_secret_here (same as backend)
     NEXTAUTH_SECRET=generate_a_32_character_random_string
     ```

## Step 3: Generate Secure Secrets

You can generate secure random strings using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command three times to generate secrets for:
- JWT_SECRET (backend)
- SESSION_SECRET (backend) 
- NEXTAUTH_SECRET (frontend)

## Step 4: Database Migration

The database schema has already been updated. If you need to run migrations:

```bash
cd backend
npx prisma migrate dev
```

## Step 5: Start the Applications

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## Step 6: Test Authentication

1. Open `http://localhost:3000` in your browser
2. Click "Sign in with Google"
3. You should be redirected to Google's OAuth consent screen
4. After granting permissions, you should be redirected back to your app
5. You should see your profile information displayed

## API Endpoints

The backend provides the following authentication endpoints:

- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user (requires authentication)
- `POST /auth/logout` - Logout user
- `GET /auth/verify` - Verify JWT token

## Frontend Components

- `AuthProvider` - Wraps the app with NextAuth session provider
- `UserProfile` - Displays user profile with dropdown menu
- `ProtectedRoute` - Wrapper component for protected routes
- Sign-in page at `/auth/signin`

## Troubleshooting

1. **"Error 400: redirect_uri_mismatch"**
   - Make sure your redirect URIs in Google Cloud Console exactly match your app URLs
   - Check for trailing slashes and http vs https

2. **"Access blocked" error**
   - Make sure your app is in "Testing" mode in the OAuth consent screen
   - Add your email as a test user

3. **Environment variables not loading**
   - Restart your development servers after changing .env files
   - Make sure .env files are in the correct directories

4. **Database connection issues**
   - Ensure your DATABASE_URL is correctly formatted
   - Check that your Neon database is accessible

## Production Deployment

When deploying to production:

1. Update your Google OAuth settings with production URLs
2. Set `NODE_ENV=production` in your backend environment
3. Use HTTPS URLs for all OAuth redirect URIs
4. Generate new, secure secrets for production
5. Ensure your database connection string is for your production database

## Security Notes

- Never commit actual credentials to version control
- Use different secrets for development and production
- Regularly rotate your secrets
- Monitor your Google Cloud Console for unusual activity
- Enable 2FA on your Google Cloud Console account
