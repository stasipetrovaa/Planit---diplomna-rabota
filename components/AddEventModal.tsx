import { Colors } from "@/constants/Colors";

import { EventType, Repeat } from "@/types/types";
import { getWeekday } from "@/utils/utils";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomSpinner from "./ui/DurationSpinner";

const createEmptyEvent = (selectedDate?: Date): EventType => {
  const date = selectedDate || new Date();
  const now = new Date();
  const startTime = new Date(date);
  startTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  return {
    title: "",
    startDate: date,
    endDate: date,
    repeat: null,
    startTime: startTime,
    endTime: endTime,
    notes: "",
    color: "",
    alarms: [],
  };
};

type AddEventModalProps = {
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
  onAddEvent: (event: EventType) => void;
  onUpdateEvent?: (event: EventType) => void;
  onDeleteEvent?: (eventId: string) => void;
  editingEvent?: EventType | null;
  selectedDate?: Date;
};

const AddEventModal = ({
  openAddModal,
  setOpenAddModal,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  editingEvent,
  selectedDate,
}: AddEventModalProps) => {
  const [event, setEvent] = useState<EventType>(() => createEmptyEvent(selectedDate));
  const isEditing = !!editingEvent;

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (openAddModal) {
      if (editingEvent) {
        setEvent(editingEvent);
        setTime(editingEvent.startTime);
        const diff = (editingEvent.endTime.getTime() - editingEvent.startTime.getTime()) / (1000 * 60 * 60);
        setDuration(diff);
      } else {
        setEvent(createEmptyEvent(selectedDate));
        setTime(null);
        setDuration(null);
      }
    }
  }, [openAddModal, editingEvent, selectedDate]);

  const translateY = useRef(new Animated.Value(0)).current;
  const handleClose = () => {
    setOpenAddModal(false);
    translateY.setValue(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        return Math.abs(gesture.dy) > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
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
      return `On the ${dayOfMonth}${dayOfMonth === 1
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
      const newEndTime = new Date(selectedTime.getTime() + (duration || 1) * 60 * 60 * 1000);
      setEvent({
        ...event,
        startTime: selectedTime,
        endTime: newEndTime,
      });
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
    if (isEditing && onUpdateEvent) {
      onUpdateEvent(event);
    } else {
      onAddEvent(event);
    }
    setEvent(createEmptyEvent());
    setTime(null);
    setDuration(null);
    setOpenAddModal(false);
  };

  const handleDeleteEvent = () => {
    if (isEditing && onDeleteEvent && event.id) {
      onDeleteEvent(event.id);
      setEvent(createEmptyEvent());
      setTime(null);
      setDuration(null);
      setOpenAddModal(false);
    }
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
          <Pressable onPress={handleClose} style={{ width: "100%", alignItems: "center" }}>
            <View style={styles.dragHandle} />
          </Pressable>
          <View style={{ width: "100%", gap: 16 }}>
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
              style={[styles.optionsSelector, styles.timeSelector]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.placeholder}>
                {`Time: ${formatTime(event.startTime)} - ${formatTime(event.endTime)} | ${getDuration()}h`}
              </Text>
              <Feather name="clock" size={16} color={Colors.text} />
            </Pressable>
            <View style={styles.rowContainer}>
              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={16} color={Colors.text} />
                <Text style={styles.placeholder}>{renderDate()}</Text>
              </Pressable>

              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowRepeatPicker(true)}
              >
                <Feather name="repeat" size={16} color={Colors.text} />
                <Text style={styles.placeholder}>{renderRepeat()}</Text>
              </Pressable>

              <Pressable
                style={styles.optionsSelector}
                onPress={() => setShowColorPicker((v) => !v)}
              >
                <Feather name="disc" size={16} color={Colors.text} />
                <Text style={styles.placeholder}>
                  {event.color ? `Color` : "Color"}
                </Text>
              </Pressable>

              {event.color && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: event.color,
                    alignSelf: "center",
                    marginLeft: 4,
                    borderWidth: 1.5,
                    borderColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
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
          <View style={styles.notesContainer}>
            <TextInput
              placeholder="Add note..."
              style={styles.notesInput}
              placeholderTextColor={Colors.placeholderText}
              value={event.notes}
              onChangeText={(text) => setEvent({ ...event, notes: text })}
              multiline
            />
          </View>
          <View style={styles.buttonRow}>
            {isEditing && (
              <TouchableOpacity onPress={handleDeleteEvent} activeOpacity={0.7} style={styles.deleteButton}>
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAddEvent} activeOpacity={0.7} style={styles.submitButtonContainer}>
              <LinearGradient
                colors={[Colors.tabIconSelected, "#8B5CF6"]} // Updated gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, { borderRadius: 16 }]}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? "Update Task" : "Add Task"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
        {showTimePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={time || event.startTime}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
            is24Hour
          />
        )}
        {showDatePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={event.startDate}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            is24Hour
          />
        )}
        {showTimePicker && Platform.OS === "web" && (
          <View style={styles.webPickerOverlay}>
            <View style={styles.webPickerContainer}>
              <Text style={styles.webPickerTitle}>Select Time</Text>
              <TextInput
                style={styles.webPickerInput}
                placeholder="HH:MM"
                defaultValue={`${String(event.startTime.getHours()).padStart(2, "0")}:${String(event.startTime.getMinutes()).padStart(2, "0")}`}
                onChangeText={(text) => {
                  const [hours, minutes] = text.split(":").map(Number);
                  if (!isNaN(hours) && !isNaN(minutes)) {
                    const newTime = new Date();
                    newTime.setHours(hours, minutes, 0, 0);
                    setTime(newTime);
                  }
                }}
              />
              <View style={styles.webPickerButtons}>
                <Pressable onPress={() => setShowTimePicker(false)} style={styles.webPickerButton}>
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (time) {
                      const newEndTime = new Date(time.getTime() + (duration || 1) * 60 * 60 * 1000);
                      setEvent({ ...event, startTime: time, endTime: newEndTime });
                    }
                    setShowTimePicker(false);
                    setShowDurationPicker(true);
                  }}
                  style={[styles.webPickerButton, { backgroundColor: Colors.tabIconSelected }]}
                >
                  <Text style={{ color: Colors.background }}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        {showDatePicker && Platform.OS === "web" && (
          <View style={styles.webPickerOverlay}>
            <View style={styles.webPickerContainer}>
              <Text style={styles.webPickerTitle}>Select Date</Text>
              <TextInput
                style={styles.webPickerInput}
                placeholder="YYYY-MM-DD"
                defaultValue={event.startDate.toISOString().split("T")[0]}
                onChangeText={(text) => {
                  const date = new Date(text);
                  if (!isNaN(date.getTime())) {
                    setEvent({ ...event, startDate: date });
                  }
                }}
              />
              <View style={styles.webPickerButtons}>
                <Pressable onPress={() => setShowDatePicker(false)} style={styles.webPickerButton}>
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  style={[styles.webPickerButton, { backgroundColor: Colors.tabIconSelected }]}
                >
                  <Text style={{ color: Colors.background }}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "relative",
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Slightly darker overlay
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "100%", // Full width bottom sheet
    backgroundColor: Colors.modalBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#F7F7F7", // Light gray filled
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "transparent",
  },
  placeholder: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 14,
  },
  optionsSelector: {
    backgroundColor: "#F7F7F7", // Filled style
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E5E5", // Subtle border for distinctiveness
    flexDirection: "row", // Align icon and text
    alignItems: "center",
    gap: 8, // Space between icon and text
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%", // Full width for time selector
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow wrapping
    gap: 10,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  button: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontFamily: "MontserratBold",
    fontSize: 16,
  },
  notesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 20,
    paddingTop: 20, // Ensure text starts at top
    minHeight: 100,
    color: Colors.text,
    fontFamily: "Montserrat",
    fontSize: 15,
    textAlignVertical: "top", // Android specific
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  deleteButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonContainer: {
    flex: 1,
    shadowColor: Colors.tabIconSelected,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 24,
  },
  webPickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webPickerContainer: {
    backgroundColor: Colors.modalBackground,
    padding: 24,
    borderRadius: 24,
    minWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  webPickerTitle: {
    fontSize: 20,
    fontFamily: "MontserratBold",
    marginBottom: 20,
    color: Colors.text,
  },
  webPickerInput: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    width: "100%",
    textAlign: "center",
    fontFamily: "MontserratBold",
    color: Colors.text,
  },
  webPickerButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
    width: "100%",
  },
  webPickerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
  },
});

export default AddEventModal;
