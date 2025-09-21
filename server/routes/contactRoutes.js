// routes/contactRoutes.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Configurar transporte
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD
  },
});

router.post("/", async (req, res) => {
  const { nombreUsuario, email, descripcion } = req.body;
  if (!nombreUsuario || !email || !descripcion){
    console.error("Faltan Datos");
    return res.status(400).json({ ok: false, error: "Faltan datos" });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
  return res.status(400).json({ ok: false, error: "Email inválido" });
 }

  try {
    await transporter.sendMail({
      from: `"Contacto desde RespondeYa!" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: "mdep171@gmail.com", // dónde recibís el correo
      subject: `Nuevo mensaje de ${nombreUsuario}`,
      text: descripcion,
      html: `
        <h3>Mensaje</h3>
        <p><strong>Nombre:</strong> ${nombreUsuario}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${descripcion}</p>
      `,
    });

    res.json({ ok: true, msg: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ ok: false, msg: "Error al enviar correo" });
  }
});

export default router;
