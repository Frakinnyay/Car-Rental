import multer from "multer";
import { HttpError } from "../utils/validate.js";

// Files are kept in memory (no temp files left on disk) and streamed to
// ImageKit. 4 MB keeps requests below serverless body limits (~4.5 MB).
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, "Only JPEG, PNG or WebP images are allowed."));
  },
});

export default upload;
