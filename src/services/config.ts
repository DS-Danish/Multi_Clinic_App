import { Platform } from "react-native";

const deviceHost =
  Platform.OS === "android" ? "192.168.1.16" : "192.168.1.16";

export const BACKEND_API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? `http://${deviceHost}:3000`;

export const CHATBOT_API_URL =
  process.env.EXPO_PUBLIC_CHATBOT_URL ?? `http://${deviceHost}:8000`;