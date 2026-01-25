import React from "react";
import { StyleProp, StyleSheet, TextInput, TextStyle } from "react-native";

interface InputProps {
   value: string;
   onChangeText: (text: string) => void;
   placeholder?: string;
   secureTextEntry?: boolean;
   keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
   autoCapitalize?: "none" | "sentences" | "words" | "characters";
   style?: StyleProp<TextStyle>;
   inputStyle?: StyleProp<TextStyle>;
   editable?: boolean;
   maxLength?: number;
}

export function Input({
   value,
   onChangeText,
   placeholder,
   secureTextEntry = false,
   keyboardType = "default",
   autoCapitalize = "none",
   style,
   inputStyle,
   editable = true,
   maxLength,
}: InputProps) {
   return (
      <TextInput
         value={value}
         onChangeText={onChangeText}
         placeholder={placeholder}
         secureTextEntry={secureTextEntry}
         keyboardType={keyboardType}
         autoCapitalize={autoCapitalize}
         editable={editable}
         style={[styles.input, !editable && styles.disabled, style, inputStyle]}
         placeholderTextColor="#9ca3af"
         maxLength={maxLength}
      />
   );
}

const styles = StyleSheet.create({
   input: {
      height: 44,
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      paddingHorizontal: 12,
      fontSize: 14,
      backgroundColor: "#ffffff",
      color: "#1f2937",
   },
   disabled: {
      backgroundColor: "#f3f4f6",
      color: "#9ca3af",
   },
});
