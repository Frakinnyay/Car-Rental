import { getImageKit } from "../config/imageKit.js";

/**
 * Uploads an in-memory image (multer memoryStorage file) to ImageKit and
 * returns an optimised delivery URL (max width 1280px, WebP).
 */
export const uploadImage = async (file, folder) => {
  const imagekit = getImageKit();
  const response = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    folder,
  });
  return imagekit.url({
    path: response.filePath,
    transformation: [{ width: "1280" }, { quality: "80" }, { format: "webp" }],
  });
};
