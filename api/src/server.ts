import "dotenv/config";
import express from "express";
import passport from "passport";
import cors from "cors";
import usersRouter from "./routes/users.js";
import accountsRouter from "./routes/accounts.js";

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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/users", usersRouter);
app.use("/api/auth", accountsRouter);

app.listen(8000, () => {
  console.log(`🚀 Server running on port 8000`);
});
