import { Router } from 'express';
import passport from '../config/passport';
import { db } from '../lib/db';
import { generateToken } from '../lib/jwt';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();


router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  res.json({
    user: req.user,
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Verify token
router.get('/verify', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// Sync user from NextAuth (for frontend authentication)
router.post('/google/sync', async (req, res) => {
  try {
    const { googleId, email, name, avatar, accessToken } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing required fields: googleId and email' });
    }

    // Check if user already exists with this Google ID
    let user = await db.user.findUnique({
      where: { googleId },
    });

    if (user) {
      // Update existing user with latest info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name,
          avatar,
          email, // Update email in case it changed
        },
      });
      
      return res.json(user);
    }

    // Check if user exists with the same email
    user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      // Link Google account to existing user
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: avatar || user.avatar,
          name: name || user.name,
        },
      });
      
      return res.json(user);
    }

    // Create new user
    user = await db.user.create({
      data: {
        email,
        name,
        googleId,
        avatar,
      },
    });

    console.log('New user created:', { id: user.id, email: user.email, name: user.name });
    res.json(user);
    
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

export default router;
