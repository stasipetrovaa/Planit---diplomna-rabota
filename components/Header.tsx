import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { useHeader } from "@/contexts/header-context";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const { title, subtitle, toggleViewMode } = useHeader();
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    logout();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menus}>
        <Pressable onPress={toggleViewMode} style={styles.calendarIcon}>
          <Feather
            name="calendar"
            size={24}
            color={Colors.tabIconSelected}
          />
        </Pressable>

        <View>
          <Pressable onPress={toggleMenu} style={styles.icon}>
            <Ionicons
              name="menu"
              size={28}
              color={menuVisible ? Colors.tabIconSelected : "black"}
            />
          </Pressable>

          {menuVisible && (
            <>
              <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Feather name="log-out" size={20} color="#EF4444" />
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: "10%",
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    borderBottomColor: "#f3eeffff",
    borderBottomWidth: 1,
  },
  headerText: {
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "MontserratBold",
  },
  subtitle: {
    fontFamily: "MontserratBold",
    fontSize: 16,
    color: Colors.placeholderText,
  },
  icon: {
    padding: 6,
  },
  calendarIcon: {
    padding: 6,
    marginRight: 8,
  },
  menus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuBackdrop: {
    position: "fixed" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  menuDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontFamily: "MontserratBold",
    fontSize: 15,
    color: "#EF4444",
  },
});
