import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

interface BackendUser {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  googleId?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // When user signs in for the first time
      if (account && user && profile) {
        try {
          // Send user data to your backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleId: profile.sub,
              email: user.email,
              name: user.name,
              avatar: user.image,
              accessToken: account.access_token,
            }),
          });

          if (response.ok) {
            const backendUser: BackendUser = await response.json();
            token.backendUserId = backendUser.id;
            token.backendUser = backendUser;
          } else {
            console.error('Failed to sync user with backend:', await response.text());
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add backend user info to session
      if (token.backendUser) {
        session.user.id = token.backendUserId as string;
        session.backendUser = token.backendUser as BackendUser;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
