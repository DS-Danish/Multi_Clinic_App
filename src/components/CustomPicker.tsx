import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
   FlatList,
   Modal,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

interface Item {
   label: string;
   value: string;
}

interface CustomPickerProps {
   selectedValue: string;
   onValueChange: (value: string) => void;
   items: Item[];
   placeholder?: string;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
   selectedValue,
   onValueChange,
   items,
   placeholder = "Select...",
}) => {
   const [modalVisible, setModalVisible] = useState(false);

   const selectedItem = items.find((item) => item.value === selectedValue);
   const displayText = selectedItem ? selectedItem.label : placeholder;

   return (
      <>
         <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalVisible(true)}
         >
            <Text
               style={[styles.pickerText, !selectedItem && styles.placeholder]}
            >
               {displayText}
            </Text>
            <MaterialCommunityIcons
               name="chevron-down"
               size={20}
               color="#6b7280"
            />
         </TouchableOpacity>

         <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
               <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Select an option</Text>
                     <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <MaterialCommunityIcons
                           name="close"
                           size={24}
                           color="#6b7280"
                        />
                     </TouchableOpacity>
                  </View>
                  <FlatList
                     data={items}
                     keyExtractor={(item) => item.value}
                     renderItem={({ item }) => (
                        <TouchableOpacity
                           style={styles.option}
                           onPress={() => {
                              onValueChange(item.value);
                              setModalVisible(false);
                           }}
                        >
                           <Text style={styles.optionText}>{item.label}</Text>
                           {item.value === selectedValue && (
                              <MaterialCommunityIcons
                                 name="check"
                                 size={20}
                                 color="#2563eb"
                              />
                           )}
                        </TouchableOpacity>
                     )}
                     ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                           <Text style={styles.emptyText}>
                              No options available
                           </Text>
                        </View>
                     }
                  />
               </View>
            </View>
         </Modal>
      </>
   );
};

const styles = StyleSheet.create({
   pickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      padding: 12,
      backgroundColor: "#ffffff",
   },
   pickerText: {
      fontSize: 14,
      color: "#1f2937",
   },
   placeholder: {
      color: "#9ca3af",
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
   },
   modalContent: {
      backgroundColor: "#ffffff",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      maxHeight: "80%",
   },
   modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 8,
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1f2937",
   },
   option: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
   },
   optionText: {
      fontSize: 16,
      color: "#1f2937",
   },
   emptyContainer: {
      padding: 20,
      alignItems: "center",
   },
   emptyText: {
      fontSize: 14,
      color: "#9ca3af",
   },
});
