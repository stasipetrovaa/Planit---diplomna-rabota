import { Colors } from "@/constants/Colors";
import { EventType } from "@/types/types";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemProps {
  item: EventType;
  onPress?: (item: EventType) => void;
  onToggleComplete?: (item: EventType) => void;
  showCheckbox?: boolean;
}

const AgendaItem = ({ item, onPress, onToggleComplete, showCheckbox = true }: ItemProps) => {
  const formatTime = (date: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const handleToggleComplete = (e: any) => {
    e.stopPropagation();
    if (onToggleComplete && showCheckbox) {
      onToggleComplete(item);
    }
  };

  if (!item) {
    return null;
  }

  const isCompleted = item.completed;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.item, isCompleted && styles.itemCompleted]}
      activeOpacity={0.7}
    >
      <View
        style={[styles.colorBar, { backgroundColor: item.color || "#6B9FEB" }]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemTitleText, isCompleted && styles.strikethrough]}>
            {item.title}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Feather name="clock" size={12} color="#999" style={styles.clockIcon} />
          <Text style={styles.timeText}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>
      {showCheckbox && (
        <TouchableOpacity
          onPress={handleToggleComplete}
          style={styles.checkbox}
          activeOpacity={0.6}
          disabled={!onToggleComplete}
        >
          <View style={[styles.checkboxInner, isCompleted && styles.checkboxChecked]}>
            {isCompleted && <Feather name="check" size={12} color="white" />}
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default memo(AgendaItem);

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "white",
    flexDirection: "row",
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  itemCompleted: {
    backgroundColor: "#F9F9F9",
    opacity: 0.7,
  },
  colorBar: {
    width: 4,
    height: "100%",
    minHeight: 44,
    borderRadius: 2,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    marginBottom: 4,
  },
  itemTitleText: {
    color: "#1A1A1A",
    fontFamily: "MontserratBold",
    fontSize: 15,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "Montserrat",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: Colors.tabIconSelected,
    borderColor: Colors.tabIconSelected,
  },
});
