// routes/realisations.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import auth from "../middleware/auth.js";

dotenv.config(); // ✅ on charge les variables ici aussi

const router = express.Router();

// ====== CONFIG CLOUDINARY ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ====== MULTER → CLOUDINARY STORAGE ======
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { title, description } = req.body;
    return {
      // ⚠️ choisis un seul dossier et garde-le partout
      // si ton dossier dans Cloudinary s'appelle "cmccuisine", mets-le aussi ici
      folder: "cmccuisine",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      context: {
        alt: title || "Réalisation CMC Cuisine",
        description: description || "",
      },
    };
  },
});

const upload = multer({ storage });

/**
 * GET /api/realisations
 * → liste toutes les images du dossier Cloudinary
 */
router.get("/", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("folder:cmccuisine") // 👈 même nom que dans le storage
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    const images = result.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
      format: img.format,
      created_at: img.created_at,
      width: img.width,
      height: img.height,
      context: img.context || null,
    }));

    res.json(images);
  } catch (err) {
    console.error("❌ Error fetching Cloudinary images:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/realisations
 * → upload une nouvelle photo sur Cloudinary
 */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const { title, description } = req.body;

    res.status(201).json({
      message: "Image uploaded to Cloudinary",
      url: req.file.path,
      public_id: req.file.filename,
      title,
      description,
    });
  } catch (err) {
    console.error("❌ Error uploading image:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/:public_id", auth, async (req, res) => {
  try {
    const { public_id } = req.params;

    // suppression sur Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // si tu n'as pas de Mongo pour les réalisations, c'est suffisant
    return res.json({ message: "Image deleted" });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
