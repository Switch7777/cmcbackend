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

// Configuration
dotenv.config();
connectDB();

// Reconstituer __dirname (car ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ====== LOGGER + JSON ======
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ====== CORS ======
const allowedOrigins = [
  "http://localhost:3000", // pour ton environnement local
  "https://cmc-cuisine.vercel.app", // ton front en production
];

app.use(
  cors({
    origin: function (origin, callback) {
      // autorise aussi les outils sans origin (Thunder Client, Postman, etc.)
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

// Permet les requêtes OPTIONS (preflight)
app.options("*", cors());

// ====== STATIC FILES (uploads) ======
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== ROUTES ======
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/realisations", realisationsRouter);

// ====== TEST ROUTE (ping Render) ======
app.get("/ping", (req, res) => {
  res.json({ message: "pong 🟢 backend opérationnel" });
});

export default app;
