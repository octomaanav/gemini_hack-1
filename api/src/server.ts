import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import usersRouter from "./routes/users.js";
import accountsRouter from "./routes/accounts.js";
import parseSourceRouter from "./routes/parse_source.js";
import brailleRouter from "./routes/braille.js";
import { lessonsRouter } from "./routes/lessons.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

app.listen(8000, () => {
  console.log(`🚀 Server running on port 8000`);
});
