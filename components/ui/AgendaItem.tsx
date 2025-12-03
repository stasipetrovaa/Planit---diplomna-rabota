import { Colors } from "@/constants/Colors";
import { EventType } from "@/types/types";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemProps {
  item: EventType;
  onPress?: (item: EventType) => void;
  onToggleComplete?: (item: EventType) => void;
}

const AgendaItem = ({ item, onPress, onToggleComplete }: ItemProps) => {
  const formatTime = (date: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDuration = () => {
    if (!item.endTime || !item.startTime) return "";
    const diff = item.endTime.getTime() - item.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    } else {
      return `${minutes}m`;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(item);
    }
  };

  if (!item) {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>No Events Planned Today</Text>
      </View>
    );
  }

  const isCompleted = item.completed;

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.item, isCompleted && styles.itemCompleted]} activeOpacity={0.7}>
      <View
        style={[styles.colorBar, { backgroundColor: item.color || "#3B82F6", opacity: isCompleted ? 0.5 : 1 }]}
      />
      <View style={styles.timeContainer}>
        <Text style={[styles.itemHourText, isCompleted && styles.textCompleted]}>{formatTime(item.startTime)}</Text>
        <Text style={[styles.itemDurationText, isCompleted && styles.textCompleted]}>{getDuration()}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.itemTitleText, isCompleted && styles.textCompleted, isCompleted && styles.strikethrough]}>{item.title}</Text>
        {item.notes && <Text style={[styles.itemNotesText, isCompleted && styles.textCompleted]}>{item.notes}</Text>}
      </View>
      <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox} activeOpacity={0.6}>
        <View style={[styles.checkboxInner, isCompleted && styles.checkboxChecked]}>
          {isCompleted && <Feather name="check" size={14} color="white" />}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default memo(AgendaItem);

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  itemCompleted: {
    backgroundColor: "#f8f8f8",
    opacity: 0.8,
  },
  checkbox: {
    marginLeft: 12,
    padding: 4,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.tabIconSelected,
    borderColor: Colors.tabIconSelected,
  },
  colorBar: {
    width: 4,
    height: "100%",
    minHeight: 40,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginRight: 10,
  },
  timeContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  itemHourText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemDurationText: {
    color: "grey",
    fontSize: 10,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemTitleText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  itemNotesText: {
    color: "grey",
    fontSize: 12,
    fontStyle: "italic",
  },
  textCompleted: {
    color: "#999",
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  emptyItem: {
    paddingLeft: 20,
    height: 52,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
  },
  emptyItemText: {
    color: "lightgrey",
    fontSize: 14,
  },
});
