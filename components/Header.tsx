import { Colors } from "@/constants/Colors";
import { useHeader } from "@/contexts/header-context";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HeaderProps = {
  onMenuPress: () => void;
  onCalendarPress: () => void;
};

export default function Header({ onMenuPress, onCalendarPress }: HeaderProps) {
  const { title, subtitle } = useHeader();
  const [active, setActive] = useState<"calendar" | "menu" | null>(null);

  const handleCalendarPress = () => {
    setActive(active !== "calendar" ? "calendar" : null);
    onCalendarPress();
  };

  const handleMenuPress = () => {
    setActive(active !== "menu" ? "menu" : null);
    onMenuPress();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menus}>
        <Pressable onPress={handleCalendarPress} style={styles.icon}>
          <Feather
            name="calendar"
            size={22}
            color={active === "calendar" ? Colors.tabIconSelected : "black"}
          />
        </Pressable>

        <Pressable onPress={handleMenuPress} style={styles.icon}>
          <Ionicons
            name="menu"
            size={28}
            color={active === "menu" ? Colors.tabIconSelected : "black"}
          />
        </Pressable>
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
  },
  icon: {
    padding: 6,
  },
  menus: {
    flexDirection: "row",
    alignItems: "center",
  },
});
