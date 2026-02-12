import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface EditAppointmentDialogProps {
   visible: boolean;
   appointment: any; // Appointment type
   onClose: () => void;
   onSave: (data: any) => void;
}

// Helper to format datetime-local string
const formatDateTimeLocal = (date: Date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");
   return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to parse datetime-local to ISO
const toISO = (datetimeLocal: string) => {
   if (!datetimeLocal) return undefined;
   const date = new Date(datetimeLocal);
   return isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
   visible,
   appointment,
   onClose,
   onSave,
}) => {
   const [form, setForm] = useState({
      id: "",
      startTime: "",
      endTime: "",
      notes: "",
   });

   useEffect(() => {
      if (visible && appointment) {
         setForm({
            id: appointment.id || "",
            startTime: formatDateTimeLocal(new Date(appointment.startTime)),
            endTime: formatDateTimeLocal(new Date(appointment.endTime)),
            notes: appointment.notes || "",
         });
      }
   }, [visible, appointment]);

   const handleSave = () => {
      onSave({
         id: form.id,
         startTime: toISO(form.startTime),
         endTime: toISO(form.endTime),
         notes: form.notes,
      });
   };

   return (
      <Modal visible={visible} transparent animationType="slide">
         <View style={styles.overlay}>
            <View style={styles.container}>
               <Text style={styles.title}>Edit Appointment</Text>

               {/* Start Time */}
               <Text style={styles.label}>Start Time</Text>
               <Input
                  value={form.startTime}
                  onChangeText={(text) => setForm({ ...form, startTime: text })}
                  placeholder="YYYY-MM-DDTHH:MM"
                  style={styles.input}
               />

               {/* End Time */}
               <Text style={styles.label}>End Time</Text>
               <Input
                  value={form.endTime}
                  onChangeText={(text) => setForm({ ...form, endTime: text })}
                  placeholder="YYYY-MM-DDTHH:MM"
                  style={styles.input}
               />

               {/* Notes */}
               <Text style={styles.label}>Notes</Text>
               <TextInput
                  style={styles.textarea}
                  value={form.notes}
                  onChangeText={(text) => setForm({ ...form, notes: text })}
                  multiline
                  numberOfLines={4}
                  placeholder="Add notes..."
               />

               <View style={styles.actions}>
                  <Button
                     title="Cancel"
                     variant="outline"
                     onPress={onClose}
                     style={styles.button}
                  />
                  <Button
                     title="Save Changes"
                     onPress={handleSave}
                     style={styles.button}
                  />
               </View>
            </View>
         </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
   },
   container: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 500,
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 16,
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginTop: 12,
      marginBottom: 4,
   },
   input: {
      marginBottom: 8,
   },
   textarea: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      padding: 12,
      fontSize: 14,
      color: "#1f2937",
      textAlignVertical: "top",
      minHeight: 100,
      backgroundColor: "#ffffff",
   },
   actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
   },
   button: {
      flex: 1,
   },
});
