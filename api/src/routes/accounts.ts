import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { uuid } from "uuidv4";
import type { User } from "../types/user.js";

const accountsRouter = Router();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const userId = uuid();
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error("Email is required"), undefined);
          }

          if (!name) {
            return done(new Error("Name is required"), undefined);
          }
          const userInfo = {
            user_id: userId,
            name: name,
            email: email,
          };

          let user = await db.select().from(users).where(eq(users.email, userInfo.email));
          if (user.length === 0) {
            const [newUser] = await db.insert(users).values(userInfo).returning();
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            return done(null, newUser);
          }
          req.session.accessToken = accessToken;
          req.session.refreshToken = refreshToken;
          return done(null, user[0]);
        } catch (error) {
          console.error("Error in Google OAuth callback:", error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials not found. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env");
}

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

accountsRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

accountsRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.redirect("http://localhost:5173/login");
    }

    // Fetch the user from DB
    const [userEntry] = await db.select().from(users).where(eq(users.email, user.email));

    if (!userEntry) {
      // Safety check: should rarely happen
      return res.redirect("http://localhost:5173/login");
    }

    // Check if user needs to complete setup
    if (!userEntry.isProfileComplete) {
      return res.redirect("http://localhost:5173/setup");
    }

    // User already has profile, redirect to dashboard
    return res.redirect("http://localhost:5173/dashboard");
  }
);


accountsRouter.get("/me", async (req, res) => {
  const user = req.user as User;
  if (!user) {
    return res.redirect("http://localhost:5173/login");
  }
  const userEntry = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
  res.json({ user: userEntry[0] })
});

accountsRouter.put("/me", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { disabilities, grade, curriculum, subjects } = req.body;
    const user = req.user as User;

    // Validate required fields
    if (!Array.isArray(disabilities) || disabilities.length === 0) {
      return res.status(400).json({ error: "At least one disability is required" });
    }
    if (!grade) {
      return res.status(400).json({ error: "Grade is required" });
    }
    if (!curriculum) {
      return res.status(400).json({ error: "Curriculum is required" });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "At least one subject is required" });
    }

    // Update user in DB
    const [updatedUser] = await db
      .update(users)
      .set({
        disabilities,
        grade,
        curriculum,
        subjects,
        isProfileComplete: true
      })
      .where(eq(users.email, user.email))
      .returning();

    console.log('Updated user:', updatedUser);
    
    // Update session with new user data
    req.user = updatedUser as any;
    
    // Save session to ensure persistence
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

accountsRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
});

export default accountsRouter;
