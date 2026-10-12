import multer from 'multer';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../utils/storage.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`);
    error.statusCode = 400;
    cb(error, false);
  }
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('image');

export const uploadMultipleImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 5 },
}).array('images', 5);
