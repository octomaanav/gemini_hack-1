import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const accountsRouter = Router();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Profile ID:", profile.id);
          console.log("Display Name:", profile.displayName);
          console.log("Email:", profile.emails?.[0]?.value);
          console.log("Photo:", profile.photos?.[0]?.value);
          console.log("Full Profile:", JSON.stringify(profile, null, 2));
          console.log("Access Token:", accessToken);
          console.log("Refresh Token:", refreshToken);

          return done(null, profile);
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

accountsRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

accountsRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.json({
      message: "Google OAuth successful",
      user: req.user,
    });
  }
);

export default accountsRouter;
