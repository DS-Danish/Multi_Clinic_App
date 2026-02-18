import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
   ScrollView,
   StyleSheet,
   Switch,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { Guard } from "../../../../components/Guard";

export default function SuperAdminSettings() {
   const [notifications, setNotifications] = useState(true);
   const [darkMode, setDarkMode] = useState(false);

   return (
      <Guard allowedRoles={["SYSTEM_ADMIN"]}>
         <ScrollView style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>System-wide configuration</Text>

            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Preferences</Text>
               <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                     <MaterialCommunityIcons
                        name="bell-outline"
                        size={22}
                        color="#4b5563"
                     />
                     <Text style={styles.settingLabel}>
                        Enable Notifications
                     </Text>
                  </View>
                  <Switch
                     value={notifications}
                     onValueChange={setNotifications}
                  />
               </View>
               <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                     <MaterialCommunityIcons
                        name="theme-light-dark"
                        size={22}
                        color="#4b5563"
                     />
                     <Text style={styles.settingLabel}>Dark Mode</Text>
                  </View>
                  <Switch value={darkMode} onValueChange={setDarkMode} />
               </View>
            </View>

            <View style={styles.section}>
               <Text style={styles.sectionTitle}>System</Text>
               <TouchableOpacity style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                     <MaterialCommunityIcons
                        name="database"
                        size={22}
                        color="#4b5563"
                     />
                     <Text style={styles.settingLabel}>Backup Data</Text>
                  </View>
                  <MaterialCommunityIcons
                     name="chevron-right"
                     size={20}
                     color="#9ca3af"
                  />
               </TouchableOpacity>
               <TouchableOpacity style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                     <MaterialCommunityIcons
                        name="information-outline"
                        size={22}
                        color="#4b5563"
                     />
                     <Text style={styles.settingLabel}>About</Text>
                  </View>
                  <MaterialCommunityIcons
                     name="chevron-right"
                     size={20}
                     color="#9ca3af"
                  />
               </TouchableOpacity>
            </View>
         </ScrollView>
      </Guard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
      padding: 16,
   },
   title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   subtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 24,
   },
   section: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 16,
   },
   settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
   },
   settingInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   settingLabel: {
      fontSize: 14,
      color: "#1f2937",
   },
});
