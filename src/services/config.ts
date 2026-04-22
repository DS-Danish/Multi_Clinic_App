import { Platform } from "react-native";

const localHost = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";

export const BACKEND_API_URL =
   process.env.EXPO_PUBLIC_BACKEND_URL || `http://${localHost}:3000`;

export const CHATBOT_API_URL =
   process.env.EXPO_PUBLIC_CHATBOT_URL || `http://${localHost}:8000`;
