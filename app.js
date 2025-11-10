// app.js
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/db.js";

// Routes
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import realisationsRouter from "./routes/realisations.js";

dotenv.config();
connectDB();

// reconstituer __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// logger + parsers
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ====== CORS CONFIG ======
const allowedOrigins = [
  "http://localhost:3001",
  "https://cmc-cuisine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // autoriser Thunder / Postman (pas d'origin)
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        console.warn("❌ CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// si tu veux vraiment gérer les preflight manuels, fais plutôt :
// app.options("/api/*", cors());

// ====== STATIC ======
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== ROUTES ======
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/realisations", realisationsRouter);

// petit ping
app.get("/ping", (req, res) => {
  res.json({ message: "pong 🟢" });
});

export default app;
