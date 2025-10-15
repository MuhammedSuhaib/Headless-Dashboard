import ImageKit from "imagekit";

export async function getImageKitAuth() {
  console.log("🔑 generating ImageKit auth...");
  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY!,
    privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT!,
  });
  const auth = imagekit.getAuthenticationParameters();
  console.log(auth);
  return auth;
}
