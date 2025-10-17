import Vapi from "@vapi-ai/web";

// ✅ Pass the API key directly as a string (not as an object)
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
