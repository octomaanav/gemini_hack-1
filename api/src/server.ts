import "dotenv/config";
import express from "express";
import usersRouter from "./routes/users.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", usersRouter);

app.listen(8000, () => {
  console.log(`🚀 Server running on port 8000`);
});
