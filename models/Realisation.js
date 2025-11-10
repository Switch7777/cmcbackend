// models/Realisation.js
import mongoose from "mongoose";

const realisationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Realisation = mongoose.model("Realisation", realisationSchema);
export default Realisation;
