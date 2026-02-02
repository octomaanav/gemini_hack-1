import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db/index.js";
import { users, userChapters } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { User } from "../../types/index.js";

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
          const userId = uuidv4();
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
    const { profile, curriculumId, classId } = req.body;
    const user = req.user as User;

    // Validate required fields for new profile structure
    if (!profile) {
      return res.status(400).json({ error: "Profile data is required" });
    }
    if (!profile.curriculumId) {
      return res.status(400).json({ error: "Curriculum is required" });
    }
    if (!profile.classId) {
      return res.status(400).json({ error: "Class is required" });
    }
    if (!Array.isArray(profile.chapterIds) || profile.chapterIds.length === 0) {
      return res.status(400).json({ error: "At least one chapter is required" });
    }

    // Get user ID from email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user in DB with new schema
    const [updatedUser] = await db
      .update(users)
      .set({
        profile: profile,
        curriculumId: curriculumId || profile.curriculumId,
        classId: classId || profile.classId,
        isProfileComplete: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, user.email))
      .returning();

    // Update user chapters (delete old, insert new)
    await db.delete(userChapters).where(eq(userChapters.userId, existingUser.id));
    
    if (profile.chapterIds.length > 0) {
      await db.insert(userChapters).values(
        profile.chapterIds.map((chapterId: string) => ({
          userId: existingUser.id,
          chapterId,
        }))
      );
    }

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

accountsRouter.put("/preferences", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { language, accessibility } = req.body as {
      language?: string;
      accessibility?: Record<string, unknown>;
    };
    const user = req.user as User;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const mergedProfile = {
      ...(existingUser.profile || {}),
      ...(accessibility ? { accessibility } : {}),
      ...(language ? { language } : {}),
    };

    const [updatedUser] = await db
      .update(users)
      .set({
        profile: mergedProfile,
        updatedAt: new Date(),
      })
      .where(eq(users.email, user.email))
      .returning();

    req.user = updatedUser as any;
    req.session.save(() => {});

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({ error: "Failed to update preferences" });
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
