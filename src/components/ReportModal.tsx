import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

// Types mirroring web
interface ReportData {
   title: string;
   content: string;
   diagnosis?: string;
   prescription?: string;
   recommendations?: string;
   fileUrl?: string;
}

interface AppointmentDetails {
   patientName: string;
   clinicName: string;
   date: string;
}

interface ReportModalProps {
   visible: boolean;
   onClose: () => void;
   mode: "create" | "edit" | "view";
   initialData?: ReportData | null;
   appointmentDetails?: AppointmentDetails;
   onSave: (data: ReportData) => Promise<void> | void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
   visible,
   onClose,
   mode,
   initialData,
   appointmentDetails,
   onSave,
}) => {
   const [formData, setFormData] = useState<ReportData>({
      title: "",
      content: "",
      diagnosis: "",
      prescription: "",
      recommendations: "",
      fileUrl: "",
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      if (initialData && mode !== "create") {
         setFormData({
            title: initialData.title || "",
            content: initialData.content || "",
            diagnosis: initialData.diagnosis || "",
            prescription: initialData.prescription || "",
            recommendations: initialData.recommendations || "",
            fileUrl: initialData.fileUrl || "",
         });
      } else {
         // Reset for create mode
         setFormData({
            title: "",
            content: "",
            diagnosis: "",
            prescription: "",
            recommendations: "",
            fileUrl: "",
         });
      }
      setError("");
   }, [initialData, mode, visible]);

   const handleSubmit = async () => {
      if (!formData.title.trim() || !formData.content.trim()) {
         setError("Title and content are required");
         return;
      }

      setLoading(true);
      setError("");

      try {
         await onSave(formData);
         onClose(); // Close after successful save
      } catch (err: any) {
         setError(err.message || "Failed to save report. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const isViewMode = mode === "view";

   return (
      <Modal
         visible={visible}
         transparent
         animationType="slide"
         onRequestClose={onClose}
      >
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               {/* Header */}
               <View style={styles.header}>
                  <View style={styles.headerLeft}>
                     <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                           name="file-document"
                           size={24}
                           color={mode === "view" ? "#3b82f6" : "#a855f7"}
                        />
                     </View>
                     <View>
                        <Text style={styles.headerTitle}>
                           {mode === "create"
                              ? "Create Appointment Report"
                              : mode === "edit"
                                ? "Edit Appointment Report"
                                : "View Report"}
                        </Text>
                        {appointmentDetails && (
                           <Text style={styles.headerSubtitle}>
                              {appointmentDetails.patientName} •{" "}
                              {appointmentDetails.clinicName} •{" "}
                              {new Date(
                                 appointmentDetails.date,
                              ).toLocaleDateString()}
                           </Text>
                        )}
                     </View>
                  </View>
                  <TouchableOpacity
                     onPress={onClose}
                     style={styles.closeButton}
                     disabled={loading}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color="#9ca3af"
                     />
                  </TouchableOpacity>
               </View>

               <ScrollView contentContainerStyle={styles.formContainer}>
                  {error ? (
                     <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                     </View>
                  ) : null}

                  {/* Title */}
                  <View style={styles.field}>
                     <Label style={styles.label}>
                        Report Title <Text style={styles.required}>*</Text>
                     </Label>
                     {isViewMode ? (
                        <Text style={styles.viewText}>{formData.title}</Text>
                     ) : (
                        <Input
                           value={formData.title}
                           onChangeText={(text) =>
                              setFormData({ ...formData, title: text })
                           }
                           placeholder="e.g., Post-Consultation Report"
                           maxLength={200}
                           editable={!loading}
                           style={styles.input}
                        />
                     )}
                  </View>

                  {/* Content */}
                  <View style={styles.field}>
                     <Label style={styles.label}>
                        Report Content <Text style={styles.required}>*</Text>
                     </Label>
                     {isViewMode ? (
                        <Text style={styles.viewText}>{formData.content}</Text>
                     ) : (
                        <TextInput
                           value={formData.content}
                           onChangeText={(text) =>
                              setFormData({ ...formData, content: text })
                           }
                           placeholder="Detailed report content and observations..."
                           multiline
                           numberOfLines={5}
                           editable={!loading}
                           style={styles.textarea}
                        />
                     )}
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.field}>
                     <Label style={styles.label}>Diagnosis</Label>
                     {isViewMode ? (
                        <Text style={styles.viewText}>
                           {formData.diagnosis || "—"}
                        </Text>
                     ) : (
                        <TextInput
                           value={formData.diagnosis}
                           onChangeText={(text) =>
                              setFormData({ ...formData, diagnosis: text })
                           }
                           placeholder="Medical diagnosis and findings..."
                           multiline
                           numberOfLines={3}
                           editable={!loading}
                           style={styles.textarea}
                        />
                     )}
                  </View>

                  {/* Prescription */}
                  <View style={styles.field}>
                     <Label style={styles.label}>Prescription</Label>
                     {isViewMode ? (
                        <Text style={styles.viewText}>
                           {formData.prescription || "—"}
                        </Text>
                     ) : (
                        <TextInput
                           value={formData.prescription}
                           onChangeText={(text) =>
                              setFormData({ ...formData, prescription: text })
                           }
                           placeholder="Prescribed medications and dosage..."
                           multiline
                           numberOfLines={3}
                           editable={!loading}
                           style={styles.textarea}
                        />
                     )}
                  </View>

                  {/* Recommendations */}
                  <View style={styles.field}>
                     <Label style={styles.label}>Recommendations</Label>
                     {isViewMode ? (
                        <Text style={styles.viewText}>
                           {formData.recommendations || "—"}
                        </Text>
                     ) : (
                        <TextInput
                           value={formData.recommendations}
                           onChangeText={(text) =>
                              setFormData({
                                 ...formData,
                                 recommendations: text,
                              })
                           }
                           placeholder="Follow-up recommendations and lifestyle advice..."
                           multiline
                           numberOfLines={3}
                           editable={!loading}
                           style={styles.textarea}
                        />
                     )}
                  </View>

                  {/* File URL */}
                  <View style={styles.field}>
                     <Label style={styles.label}>
                        Attachment URL (Optional)
                     </Label>
                     {isViewMode ? (
                        formData.fileUrl ? (
                           <Text style={[styles.viewText, styles.link]}>
                              {formData.fileUrl}
                           </Text>
                        ) : (
                           <Text style={styles.viewText}>—</Text>
                        )
                     ) : (
                        <>
                           <Input
                              value={formData.fileUrl || ""}
                              onChangeText={(text) =>
                                 setFormData({ ...formData, fileUrl: text })
                              }
                              placeholder="https://example.com/report.pdf"
                              editable={!loading}
                              style={styles.input}
                           />
                           <Text style={styles.helperText}>
                              Link to external files or documents
                           </Text>
                        </>
                     )}
                  </View>
               </ScrollView>

               {/* Actions */}
               {!isViewMode && (
                  <View style={styles.footer}>
                     <Button
                        title="Cancel"
                        variant="outline"
                        onPress={onClose}
                        disabled={loading}
                        style={styles.footerButton}
                     />
                     <Button
                        title={
                           loading
                              ? "Saving..."
                              : mode === "create"
                                ? "Create Report"
                                : "Update Report"
                        }
                        onPress={handleSubmit}
                        disabled={loading}
                        style={styles.footerButton}
                     />
                  </View>
               )}
               {isViewMode && (
                  <View style={styles.footer}>
                     <Button
                        title="Close"
                        variant="outline"
                        onPress={onClose}
                        style={styles.footerButton}
                     />
                  </View>
               )}
            </View>
         </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
   },
   modalContent: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      width: "100%",
      maxWidth: 600,
      maxHeight: "90%",
      overflow: "hidden",
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
   },
   headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: "#f3f4f6",
      alignItems: "center",
      justifyContent: "center",
   },
   headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   headerSubtitle: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
   },
   closeButton: {
      padding: 4,
   },
   formContainer: {
      padding: 20,
      gap: 16,
   },
   field: {
      gap: 6,
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
   },
   required: {
      color: "#ef4444",
   },
   input: {
      marginTop: 0,
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
   },
   viewText: {
      fontSize: 14,
      color: "#1f2937",
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: "#f9fafb",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#e5e7eb",
   },
   link: {
      color: "#3b82f6",
      textDecorationLine: "underline",
   },
   helperText: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 4,
   },
   errorContainer: {
      backgroundColor: "#fee2e2",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#fecaca",
   },
   errorText: {
      color: "#b91c1c",
      fontSize: 14,
   },
   footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
   },
   footerButton: {
      flex: 1,
   },
});
