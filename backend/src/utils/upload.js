import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import path from "path";

// Configuración Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ usa la SERVICE_ROLE_KEY en backend
);

function getExtFrom(file) {
  const extFromName = path.extname(file?.originalname || "").toLowerCase();
  if (extFromName) return extFromName;
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
  };
  return map[file?.mimetype] || ".jpg";
}

// Middleware para recibir archivo
export const uploadFile = (fieldName, bucketName = "imagenes") => {
  const storage = multer.memoryStorage(); // guarda archivo en RAM

  const fileFilter = (req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }).single(fieldName);

  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

      try {
        const ext = getExtFrom(req.file);
        const fileName = `user_${Date.now()}${ext}`;

        // Subir al bucket
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) throw error;

        // Obtener URL pública
        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        req.fileUrl = publicUrl.publicUrl; // la pasamos al siguiente middleware
        next();
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    });
  };
};
