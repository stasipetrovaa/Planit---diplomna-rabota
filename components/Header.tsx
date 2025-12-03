import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { useHeader } from "@/contexts/header-context";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useRef, useState, useEffect } from "react";
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const { title, subtitle, viewMode, toggleViewMode } = useHeader();
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(viewMode === "today" ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: viewMode === "today" ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }, [viewMode, slideAnim]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    logout();
  };

  const toggleWidth = 72;
  const buttonWidth = 36;

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menus}>
        <View style={[styles.toggleContainer, { width: toggleWidth }]}>
          <Animated.View
            style={[
              styles.toggleIndicator,
              {
                width: buttonWidth,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, buttonWidth],
                    }),
                  },
                ],
              },
            ]}
          />
          <Pressable
            onPress={() => viewMode !== "today" && toggleViewMode()}
            style={[styles.toggleButton, { width: buttonWidth }]}
          >
            <Feather
              name="list"
              size={18}
              color={viewMode === "today" ? "white" : Colors.placeholderText}
            />
          </Pressable>
          <Pressable
            onPress={() => viewMode !== "calendar" && toggleViewMode()}
            style={[styles.toggleButton, { width: buttonWidth }]}
          >
            <Feather
              name="calendar"
              size={18}
              color={viewMode === "calendar" ? "white" : Colors.placeholderText}
            />
          </Pressable>
        </View>

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
  menus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 20,
    backgroundColor: "#F0EDFF",
    height: 36,
    position: "relative",
    alignItems: "center",
  },
  toggleIndicator: {
    position: "absolute",
    height: 32,
    backgroundColor: Colors.tabIconSelected,
    borderRadius: 16,
    left: 2,
  },
  toggleButton: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
