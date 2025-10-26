import { Colors } from "@/constants/Colors";

import { EventType, Repeat } from "@/types/types";
import { getWeekday } from "@/utils/utils";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import CustomSpinner from "./ui/DurationSpinner";

const EmptyEvent: EventType = {
  title: "",
  startDate: new Date(),
  endDate: new Date(),
  repeat: null,
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
  notes: "",
  color: "",
  alarms: [],
};

type AddEventModalProps = {
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
  onAddEvent: (event: EventType) => void;
};

const AddEventModal = ({
  openAddModal,
  setOpenAddModal,
  onAddEvent,
}: AddEventModalProps) => {
  const [event, setEvent] = useState<EventType>(EmptyEvent);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Slide-to-close support
  const translateY = useRef(new Animated.Value(0)).current;
  const handleClose = () => {
    setOpenAddModal(false);
    translateY.setValue(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        const shouldClose = gesture.dy > 120 || gesture.vy > 1.0;
        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => handleClose());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDuration = () => {
    const diff =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
    return diff;
  };

  const renderDate = () => {
    if (event.startDate.getDay() === new Date().getDay()) return "Today";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return event.startDate.toLocaleDateString(undefined, options);
  };

  const renderRepeat = () => {
    const dayOfMonth = event.startDate.getDate();
    if (!event.repeat) return "Repeat";

    if (event.repeat === "none") return "None";
    if (event.repeat === "daily") return "Daily";
    if (event.repeat === "weekly")
      return `Every ${getWeekday(event.startDate)}`;
    if (event.repeat === "monthly")
      return `On the ${dayOfMonth}${
        dayOfMonth === 1
          ? "st"
          : dayOfMonth === 2
          ? "nd"
          : dayOfMonth === 3
          ? "rd"
          : "th"
      }`;
    if (event.repeat === "yearly") return "Yearly";
  };

  const onTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTime(selectedTime);
      setShowDurationPicker(true);
    }
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEvent({ ...event, startDate: selectedDate });
    }
  };

  const onConfirm = (value: number) => {
    setDuration(value);
    setEvent({
      ...event,
      endTime: new Date(event.startTime.getTime() + value * 60 * 60 * 1000),
    });
    setShowDurationPicker(false);
  };

  const handleAddEvent = () => {
    if (!event.title.trim()) {
      return;
    }
    onAddEvent(event);
    setEvent(EmptyEvent);
    setTime(null);
    setDuration(null);
  };

  return (
    <Modal
      visible={openAddModal}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {showDurationPicker && (
          <CustomSpinner
            type="duration"
            initial={duration || 1}
            min={1}
            max={23}
            onConfirm={(value) => onConfirm(value as number)}
            onCancel={() => {
              setShowDurationPicker(false);
            }}
          />
        )}

        {showRepeatPicker && (
          <CustomSpinner
            type="repeat"
            initial="none"
            onConfirm={(value) => {
              setEvent({ ...event, repeat: value as Repeat });
              setShowRepeatPicker(false);
            }}
            onCancel={() => {
              setShowRepeatPicker(false);
            }}
          />
        )}

        <Animated.View
          style={{
            ...styles.modalContent,
            transform: [{ translateY }],
          }}
          {...panResponder.panHandlers}
        >
          <Pressable onPress={handleClose} style={{ width: "100%" }}>
            <View style={styles.dragHandle} />
          </Pressable>
          <View style={{ maxWidth: "80%", gap: 12 }}>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={Colors.text}
              value={event.title}
              onChangeText={(text) => setEvent({ ...event, title: text })}
            />
            <Text
              style={{ ...styles.placeholder, color: Colors.placeholderText }}
            >
              When?
            </Text>
            <Pressable
              style={styles.optionsSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.placeholder}>
                Time: {formatTime(event.startTime)} -{" "}
                {formatTime(event.endTime)} | {getDuration()}h{" "}
                <Feather name="clock" size={16} color={Colors.text} />
              </Text>
            </Pressable>
            <View style={styles.rowContainer}>
              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.placeholder}>{renderDate()}</Text>
              </Pressable>
              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowRepeatPicker(true)}
              >
                <Text style={styles.placeholder}>{renderRepeat()}</Text>
              </Pressable>

              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowColorPicker((v) => !v)}
              >
                <Text style={styles.placeholder}>
                  {event.color ? `Color` : "Color"}
                </Text>
              </Pressable>
              {event.color && (
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: event.color,
                    alignSelf: "center",
                    marginLeft: 6,
                    borderWidth: 1,
                    borderColor: Colors.tabIconSelected,
                  }}
                />
              )}
            </View>
            {showColorPicker && (
              <View style={styles.colorGrid}>
                {[
                  "#EF4444",
                  "#F59E0B",
                  "#10B981",
                  "#3B82F6",
                  "#8B5CF6",
                  "#EC4899",
                  "#14B8A6",
                  "#A3E635",
                  "#F97316",
                  "#0EA5E9",
                  "#22C55E",
                  "#EAB308",
                ].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setEvent({ ...event, color: c });
                      setShowColorPicker(false);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c,
                      margin: 6,
                      borderWidth: event.color === c ? 3 : 1,
                      borderColor:
                        event.color === c ? Colors.background : Colors.text,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 20 }}>
            <TextInput
              placeholder="Add note..."
              style={{
                flex: 1,
                fontFamily: "MontserratBold",
                fontSize: 14,
              }}
              placeholderTextColor={Colors.placeholderText}
              value={event.notes}
              onChangeText={(text) => setEvent({ ...event, notes: text })}
              multiline
            />
            <LinearGradient
              colors={[Colors.tabIconSelected, Colors.background]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1.1, y: 1 }}
              style={{ borderRadius: 20 }}
            >
              <Pressable onPress={handleAddEvent} style={styles.button}>
                <Text
                  style={{
                    color: Colors.background,
                    fontFamily: "MontserratBold",
                  }}
                >
                  Add Task
                </Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Animated.View>
        {showTimePicker && (
          <DateTimePicker
            value={time || event.startTime}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
            is24Hour
          />
        )}
        {showDatePicker && (
          <DateTimePicker
            value={event.startDate}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            is24Hour
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "relative",
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    boxShadow: "0px 10px 32px rgba(0, 0, 0, 0.13)",
    backgroundColor: Colors.modalBackground,
    borderRadius: 16,
    borderColor: "#F2F0FF",
    borderWidth: 1,
    padding: 20,
    marginBottom: "30%",
  },
  input: {
    fontSize: 20,
    fontFamily: "MontserratBold",
  },
  placeholder: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 14,
    fontWeight: "600",
  },
  optionsSelector: {
    borderWidth: 1.5,
    borderColor: Colors.tabIconSelected,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignSelf: "stretch",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 4,
  },
  button: {
    padding: 10,
    alignItems: "center",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.placeholderText,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default AddEventModal;
