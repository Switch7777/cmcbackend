// routes/users.js
import express from "express";

const router = express.Router();

// route de test
router.get("/", (req, res) => {
  res.json({ message: "Route users OK" });
});

export default router;
