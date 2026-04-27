import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useSegments } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

export default function DoctorLayout() {
   const { user, logout } = useAuth();
   const segments = useSegments();
   const currentScreen = segments[segments.length - 1];

   const handleLogout = async () => {
      await logout();
      router.replace("/login");
   };

   const handleBack = () => {
      router.back();
   };

   // Hide back button only on the dashboard screen
   const isDashboard = currentScreen === "dashboard";

   return (
      <Stack
         screenOptions={{
            headerStyle: { backgroundColor: "#ffffff" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerRight: () => (
               <View style={styles.headerRight}>
                  <TouchableOpacity
                     onPress={handleLogout}
                     style={styles.iconButton}
                  >
                     <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color="#ef4444"
                     />
                  </TouchableOpacity>
               </View>
            ),
            headerLeft: () => (
               <View style={styles.headerLeft}>
                  {/* Show back button for screens other than dashboard */}
                  {!isDashboard && (
                     <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                     >
                        <MaterialCommunityIcons
                           name="arrow-left"
                           size={24}
                           color="#4b5563"
                        />
                     </TouchableOpacity>
                  )}
                  <View style={styles.avatar}>
                     <Text style={styles.avatarText}>
                        {user?.name?.charAt(0) || "D"}
                     </Text>
                  </View>
                  <View>
                     <Text style={styles.greeting}>
                        Dr. {user?.name?.split(" ")[1] || user?.name}
                     </Text>
                     <Text style={styles.role}>Doctor</Text>
                  </View>
               </View>
            ),
         }}
      >
         <Stack.Screen name="dashboard" options={{ title: "" }} />
         <Stack.Screen
            name="appointments"
            options={{ title: "" }}
         />
         <Stack.Screen name="patients" options={{ title: "" }} />
         <Stack.Screen name="reports" options={{ title: "" }} />
      </Stack>
   );
}

const styles = StyleSheet.create({
   headerRight: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
   },
   iconButton: {
      padding: 8,
      marginLeft: 8,
      position: "relative",
   },
   headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 16,
   },
   backButton: {
      padding: 8,
      marginRight: 8,
   },
   avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#3b82f6",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   avatarText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "600",
   },
   greeting: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1f2937",
   },
   role: {
      fontSize: 12,
      color: "#6b7280",
   },
});
