import { getImageKitAuth } from "../src/lib/imagekit-auth";

export async function GET() {
  const auth = await getImageKitAuth();
  return new Response(JSON.stringify(auth), {
    headers: { "Content-Type": "application/json" },
  });
}
