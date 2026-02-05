import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import usersRouter from "./routes/users.js";
import accountsRouter from "./routes/accounts.js";
import parseSourceRouter from "./routes/parse_source.js";
import brailleRouter from "./routes/braille.js";
import lessonsRouter from "./routes/lessons.js";
import curriculumRouter from "./routes/curriculum.js";
import adminRouter from "./routes/admin.js";
import uploadRouter from "./routes/upload.js";
import storyRouter from "./routes/story.js";
import contentRouter from "./routes/content.js";
import storyV2Router from "./routes/story_v2.js";
import brailleV2Router from "./routes/braille_v2.js";
import artifactsRouter from "./routes/artifacts.js";
import voiceRouter from "./routes/voice.js";
import { storageConfig } from "./utils/storage.js";
import fixturesRouter from "./routes/fixtures.js";

export const createApp = () => {
  const app = express();
  app.set("etag", false);

  app.use((req, res, next) => {
    const start = Date.now();
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const ms = Date.now() - start;
      console.log(`[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`, body);
      return originalJson(body);
    };
    res.on("finish", () => {
      if (res.headersSent && res.statusCode !== 200) {
        console.log(`[api] ${req.method} ${req.originalUrl} ${res.statusCode}`);
      }
    });
    next();
  });

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  if (storageConfig.provider === "local") {
    app.use("/media", express.static(storageConfig.localRoot));
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "learnlens-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/users", usersRouter);
  app.use("/api/auth", accountsRouter);
  app.use("/api/parse", parseSourceRouter);
  app.use("/api/braille", brailleRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/curriculum", curriculumRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/story", storyRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/story_v2", storyV2Router);
  app.use("/api/braille_v2", brailleV2Router);
  app.use("/api/artifacts", artifactsRouter);
  app.use("/api/voice", voiceRouter);
  if (process.env.NODE_ENV === "test") {
    app.use("/api/test", fixturesRouter);
  }

  return app;
};
