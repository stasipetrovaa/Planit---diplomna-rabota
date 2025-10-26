import { EventType } from "@/types/types";
import { memo, useCallback } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemProps {
  item: EventType;
}

const AgendaItem = ({ item }: ItemProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDuration = () => {
    const diff = item.endTime.getTime() - item.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    } else {
      return `${minutes}m`;
    }
  };

  const itemPressed = useCallback(() => {
    Alert.alert(
      item.title,
      `Time: ${formatTime(item.startTime)} - ${formatTime(
        item.endTime
      )}\nDuration: ${getDuration()}${
        item.notes ? `\nNotes: ${item.notes}` : ""
      }`
    );
  }, [item]);

  if (!item) {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>No Events Planned Today</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={itemPressed} style={styles.item}>
      <View
        style={[styles.colorBar, { backgroundColor: item.color || "#3B82F6" }]}
      />
      <View style={styles.timeContainer}>
        <Text style={styles.itemHourText}>{formatTime(item.startTime)}</Text>
        <Text style={styles.itemDurationText}>{getDuration()}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.itemTitleText}>{item.title}</Text>
        {item.notes && <Text style={styles.itemNotesText}>{item.notes}</Text>}
      </View>
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
  },
  colorBar: {
    width: 4,
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
