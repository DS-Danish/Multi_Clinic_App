import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Button } from "./ui/Button";

type ContactUsButtonProps = {
   style?: ViewStyle;
};

export function ContactUsButton({ style }: ContactUsButtonProps) {
   const handlePress = () => {
      router.push("/(app)/support");
   };

   return (
      <View style={[styles.container, style]}>
         <View style={styles.copyRow}>
            <View style={styles.iconWrap}>
               <MaterialCommunityIcons
                  name="lifebuoy"
                  size={20}
                  color="#2563eb"
               />
            </View>
            <View style={styles.textWrap}>
               <Text style={styles.title}>Need help?</Text>
               <Text style={styles.subtitle}>
                  Contact the ClinicConnect support team.
               </Text>
            </View>
         </View>
         <Button
            title="Contact Us"
            onPress={handlePress}
            style={styles.button}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   copyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
   },
   iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   textWrap: {
      flex: 1,
   },
   title: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 2,
   },
   subtitle: {
      fontSize: 13,
      color: "#6b7280",
   },
   button: {
      borderRadius: 8,
   },
});