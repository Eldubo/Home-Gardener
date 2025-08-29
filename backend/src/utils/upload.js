import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const uploadFile = (fieldName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      // Generate unique filename with timestamp and original extension
      cb(null, `user_${Date.now()}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  };

  return multer({ 
    storage, 
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }).single(fieldName);
};
