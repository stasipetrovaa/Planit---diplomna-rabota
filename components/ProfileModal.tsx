import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showSourceSelector, setShowSourceSelector] = useState(false);

  // Load current user details when modal opens
  useEffect(() => {
    if (visible && user) {
      setName(user.name || "");
      setAvatarUri(user.avatarUri || null);
      setShowSourceSelector(false);
    }
  }, [visible, user]);

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Sorry, we need gallery permissions to upload a photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
        setShowSourceSelector(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Sorry, we need camera permissions to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
        setShowSourceSelector(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUri(null);
    setShowSourceSelector(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid display name.");
      return;
    }
    try {
      await updateProfile(name.trim(), avatarUri);
      onClose();
    } catch (error) {
      console.error("Error saving profile changes:", error);
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = () => {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Are you sure you want to permanently delete your account? This action cannot be undone."
        );
        if (confirmed) {
          executeDelete();
        }
      } else {
        Alert.alert(
          "Delete Account",
          "Are you sure you want to permanently delete your account? This action cannot be undone and all your events will be lost.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete Account",
              style: "destructive",
              onPress: executeDelete,
            },
          ]
        );
      }
    };

    const executeDelete = async () => {
      try {
        await deleteAccount();
        onClose();
      } catch (error) {
        console.error("Failed to delete account:", error);
      }
    };

    confirmDelete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color="white" />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setShowSourceSelector(true)}
                style={styles.editBadge}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarSubtitle}>Tap camera icon to change photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Email Address (Disabled) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{user?.email}</Text>
                <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" style={styles.lockIcon} />
              </View>
            </View>
          </View>

          <View style={styles.formDivider} />

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerDescription}>
              Permanently deletes your account and all associated events. This action cannot be undone.
            </Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={styles.deleteAccountBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteAccountBtnText}>⚠ Delete account</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Source Selector Drawer */}
          {showSourceSelector && (
            <View style={styles.sourceSelector}>
              <Text style={styles.selectorTitle}>Profile Photo Option</Text>
              <View style={styles.selectorButtons}>
                <TouchableOpacity onPress={handleTakePhoto} style={styles.selectorButton}>
                  <View style={[styles.iconContainer, { backgroundColor: "#EBF5FF" }]}>
                    <Ionicons name="camera" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.selectorText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSelectImage} style={styles.selectorButton}>
                  <View style={[styles.iconContainer, { backgroundColor: "#ECFDF5" }]}>
                    <Ionicons name="images" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.selectorText}>From Library</Text>
                </TouchableOpacity>

                {avatarUri && (
                  <TouchableOpacity onPress={handleRemovePhoto} style={styles.selectorButton}>
                    <View style={[styles.iconContainer, { backgroundColor: "#FEF2F2" }]}>
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </View>
                    <Text style={[styles.selectorText, { color: "#EF4444" }]}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowSourceSelector(false)}
                style={styles.selectorCancel}
              >
                <Text style={styles.selectorCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Dark slate overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "MontserratBold",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.tabIconSelected,
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.tabIconSelected,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSubtitle: {
    fontSize: 12,
    fontFamily: "Montserrat",
    color: "#64748B",
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "MontserratBold",
    color: "#64748B",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontFamily: "Montserrat",
    color: "#1E293B",
  },
  disabledInput: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
  },
  disabledText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Montserrat",
    color: "#94A3B8",
  },
  lockIcon: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "MontserratBold",
    color: "#64748B",
  },
  saveBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.tabIconSelected,
    shadowColor: Colors.tabIconSelected,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "MontserratBold",
    color: "white",
  },
  sourceSelector: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 10,
    gap: 16,
  },
  selectorTitle: {
    fontSize: 14,
    fontFamily: "MontserratBold",
    color: "#64748B",
    textAlign: "center",
  },
  selectorButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  selectorButton: {
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 12,
    fontFamily: "MontserratBold",
    color: "#475569",
  },
  selectorCancel: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectorCancelText: {
    fontSize: 14,
    fontFamily: "MontserratBold",
    color: "#64748B",
  },
  formDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  dangerZone: {
    marginBottom: 24,
    gap: 6,
    alignItems: "flex-start",
    backgroundColor: "#FFF5F5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerDescription: {
    fontSize: 12,
    fontFamily: "Montserrat",
    color: "#64748B",
    lineHeight: 16,
    width: "100%",
  },
  deleteAccountBtn: {
    backgroundColor: "transparent",
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  deleteAccountBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "MontserratBold",
    textDecorationLine: "underline",
  },
});
