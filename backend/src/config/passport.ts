import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../lib/db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await db.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await db.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        if (user) {
          // Link Google account to existing user
          user = await db.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
            },
          });
          return done(null, user);
        }

        // Create new user
        user = await db.user.create({
          data: {
            email: profile.emails![0].value,
            name: profile.displayName,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || null,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
