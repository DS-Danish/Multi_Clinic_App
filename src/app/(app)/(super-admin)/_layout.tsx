import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, Stack, router, usePathname } from "expo-router";
import React, { useState } from "react";
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";

const menuItems = [
   {
      id: "dashboard",
      label: "Dashboard",
      icon: "view-dashboard",
      path: "/(app)/(super-admin)" as const,
   },
   {
      id: "create",
      label: "Add Clinic",
      icon: "plus",
      path: "/(app)/(super-admin)/create" as const,
   },
   {
      id: "settings",
      label: "Settings",
      icon: "cog",
      path: "/(app)/(super-admin)/settings" as const,
   },
];

export default function SuperAdminLayout() {
   const pathname = usePathname();
   const { user, logout } = useAuth();
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const isActive = (path: string) => {
      return pathname === path || pathname.startsWith(path + "/");
   };

   const handleNavigation = (path: Href) => {
      router.push(path as any); // Type assertion to bypass strict route type checking
      setSidebarOpen(false);
   };

   return (
      <SafeAreaView style={styles.container} edges={["top"]}>
         <View style={styles.layout}>
            {/* Sidebar */}
            <View style={[styles.sidebar, sidebarOpen && styles.sidebarOpen]}>
               <View style={styles.adminInfo}>
                  <View style={styles.logo}>
                     <MaterialCommunityIcons
                        name="shield-account"
                        size={28}
                        color="#2563eb"
                     />
                  </View>
                  <View>
                     <Text style={styles.adminName}>Super Admin</Text>
                     <Text style={styles.adminRole}>Control Panel</Text>
                  </View>
               </View>

               <ScrollView style={styles.menu}>
                  {menuItems.map((item) => (
                     <TouchableOpacity
                        key={item.id}
                        style={[
                           styles.menuItem,
                           isActive(item.path) && styles.activeMenuItem,
                        ]}
                        onPress={() => handleNavigation(item.path as any)} // 👈 add "as any"
                     >
                        <MaterialCommunityIcons
                           name={item.icon as any}
                           size={20}
                           color={isActive(item.path) ? "#2563eb" : "#6b7280"}
                        />
                        <Text
                           style={[
                              styles.menuText,
                              isActive(item.path) && styles.activeMenuText,
                           ]}
                        >
                           {item.label}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>

               <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                  <MaterialCommunityIcons
                     name="logout"
                     size={20}
                     color="#ef4444"
                  />
                  <Text style={styles.logoutText}>Logout</Text>
               </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
               {/* Header */}
               <View style={styles.header}>
                  <View style={styles.userInfo}>
                     <Text style={styles.userName}>
                        {user?.name || "Admin"}
                     </Text>
                     <Text style={styles.userRole}>Super Admin</Text>
                  </View>
                  <TouchableOpacity
                     onPress={() => setSidebarOpen(!sidebarOpen)}
                     style={styles.menuButton}
                  >
                     <MaterialCommunityIcons
                        name="menu"
                        size={24}
                        color="#1f2937"
                     />
                  </TouchableOpacity>
               </View>

               {/* Content */}
               <Stack screenOptions={{ headerShown: false }} />
            </View>

            {/* Mobile overlay */}
            {sidebarOpen && (
               <TouchableOpacity
                  style={styles.overlay}
                  onPress={() => setSidebarOpen(false)}
               />
            )}
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   layout: {
      flex: 1,
      flexDirection: "row",
   },
   sidebar: {
      width: 280,
      backgroundColor: "#ffffff",
      borderLeftWidth: 1,
      borderLeftColor: "#e5e7eb",
      padding: 20,
      position: "absolute",
      top: 0,
      bottom: 0,
      right: -280,
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
   },
   sidebarOpen: {
      right: 0,
   },
   adminInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 20,
   },
   logo: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
   },
   adminName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#1f2937",
   },
   adminRole: {
      fontSize: 12,
      color: "#6b7280",
   },
   menu: {
      flex: 1,
   },
   menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 8,
      marginBottom: 4,
   },
   activeMenuItem: {
      backgroundColor: "#eff6ff",
   },
   menuText: {
      fontSize: 14,
      color: "#4b5563",
   },
   activeMenuText: {
      color: "#2563eb",
      fontWeight: "500",
   },
   logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
   },
   logoutText: {
      fontSize: 14,
      color: "#ef4444",
   },
   main: {
      flex: 1,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
   },
   menuButton: {
      padding: 8,
   },
   userInfo: {
      alignItems: "flex-start",
   },
   userName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1f2937",
   },
   userRole: {
      fontSize: 12,
      color: "#6b7280",
   },

   centerInfo: {
      alignItems: "center",
      flex: 1,
   },
   rightPlaceholder: {
      width: 40,
   },
   headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
   },
   overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 10,
   },
});
