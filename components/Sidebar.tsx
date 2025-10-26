import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Sidebar() {
  return (
    <Modal visible={false} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: 280,
    backgroundColor: "white",
    height: "100%",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontFamily: "MontserratBold",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Montserrat",
  },
});
