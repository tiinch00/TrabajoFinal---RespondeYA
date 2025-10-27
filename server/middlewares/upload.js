// middlewares/upload.js

import fs from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "uploads", "fotos_perfil");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase(); // .jpg, .png...
        // si tenés auth, podés usar req.user.id. Si no, usá params:
        const userId = req.params.id ?? "anon";
        cb(null, `user_${userId}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido"), false);
};

export const uploadFotoPerfil = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).single("foto"); // el campo del form-data será "foto"
