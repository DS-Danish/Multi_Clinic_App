import React from "react";
import {
   ActivityIndicator,
   Text,
   TextStyle,
   TouchableOpacity,
   ViewStyle,
} from "react-native";

interface ButtonProps {
   onPress: () => void;
   title: string;
   variant?:
      | "default"
      | "outline"
      | "destructive"
      | "secondary"
      | "ghost"
      | "link";
   size?: "default" | "sm" | "lg";
   disabled?: boolean;
   loading?: boolean;
   style?: ViewStyle | ViewStyle[];
   textStyle?: TextStyle;
   maxLength?: number;
}

export function Button({
   onPress,
   title,
   variant = "default",
   size = "default",
   disabled = false,
   loading = false,
   style,
   textStyle,
}: ButtonProps) {
   const getBackgroundColor = () => {
      switch (variant) {
         case "default":
            return "#2563eb";
         case "destructive":
            return "#dc2626";
         case "secondary":
            return "#e5e7eb";
         case "outline":
         case "ghost":
         case "link":
            return "transparent";
         default:
            return "#2563eb";
      }
   };

   const getTextColor = () => {
      switch (variant) {
         case "default":
         case "destructive":
            return "#ffffff";
         case "secondary":
            return "#1f2937";
         case "outline":
         case "ghost":
         case "link":
            return "#2563eb";
         default:
            return "#ffffff";
      }
   };

   const getBorderColor = () => {
      return variant === "outline" ? "#d1d5db" : "transparent";
   };

   const getPadding = () => {
      switch (size) {
         case "sm":
            return { paddingVertical: 8, paddingHorizontal: 12 };
         case "lg":
            return { paddingVertical: 14, paddingHorizontal: 24 };
         default:
            return { paddingVertical: 10, paddingHorizontal: 16 };
      }
   };

   const getFontSize = () => {
      switch (size) {
         case "sm":
            return 14;
         case "lg":
            return 16;
         default:
            return 14;
      }
   };

   const buttonStyle: ViewStyle = {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === "outline" ? 1 : 0,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
      ...getPadding(),
   };

   const textStyleFinal: TextStyle = {
      color: getTextColor(),
      fontSize: getFontSize(),
      fontWeight: "500",
   };

   return (
      <TouchableOpacity
         onPress={onPress}
         disabled={disabled || loading}
         activeOpacity={0.7}
         style={[buttonStyle, ...(Array.isArray(style) ? style : [style])]}
      >
         {loading ? (
            <ActivityIndicator color={getTextColor()} />
         ) : (
            <Text style={[textStyleFinal, textStyle]}>{title}</Text>
         )}
      </TouchableOpacity>
   );
}
