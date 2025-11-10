// routes/index.js
import express from "express";

const router = express.Router();

router.get("/", function (req, res) {
  res.send("Bienvenue sur l’API de CMC Cuisine 🚀");
});

export default router;
