import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ==== SEND CONTACT FORM ====
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Vérification basique
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Merci de remplir tous les champs obligatoires.",
      });
    }

    // === Config du transporteur mail ===
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === "true", // true si port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // === Contenu du mail ===
    const htmlContent = `
      <h2>Nouvelle demande de contact — CMC Cuisine</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${phone || "non renseigné"}</p>
      <p><strong>Message :</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
      <hr />
      <p>Mail automatique envoyé depuis le site cmc-cuisine.com</p>
    `;

    // === Envoi du mail principal ===
    await transporter.sendMail({
      from: `"CMC Cuisine" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO, // ton adresse de réception
      subject: "📩 Nouvelle demande de contact — CMC Cuisine",
      html: htmlContent,
    });

    // === (Optionnel) mail de confirmation au client ===
    // await transporter.sendMail({
    //   from: `"CMC Cuisine" <${process.env.MAIL_FROM}>`,
    //   to: email,
    //   subject: "Votre message a bien été reçu",
    //   text: `Bonjour ${name},\n\nMerci pour votre message ! Nous reviendrons vers vous dans les meilleurs délais.\n\nL’équipe CMC Cuisine.`,
    // });

    res.status(200).json({
      message: "Merci, votre message a bien été envoyé.",
    });
  } catch (err) {
    console.error("Erreur lors de l’envoi du message :", err);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de l’envoi du message. Veuillez réessayer plus tard.",
    });
  }
});

export default router;
