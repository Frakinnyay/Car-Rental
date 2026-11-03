import ImageKit from "imagekit";

let client = null;

/**
 * ImageKit client is created lazily so the server can start (and the rest of
 * the API can work) even when image hosting is not configured yet.
 */
export const getImageKit = () => {
  const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    const err = new Error("Image hosting is not configured on the server (ImageKit environment variables are missing).");
    err.status = 503;
    throw err;
  }
  if (!client) {
    client = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
  }
  return client;
};
