import { Colors } from "@/constants/Colors";
import { repeatOptions } from "@/constants/common";
import { Repeat } from "@/types/types";
import { capitalize } from "@/utils/utils";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CustomSpinnerProps = {
  type: "duration" | "repeat";
  initial: number | Repeat;
  min?: number;
  max?: number;
  onConfirm: (value: number | Repeat) => void;
  onCancel: () => void;
};

const CustomSpinner = ({
  type,
  initial,
  min,
  max,
  step = 1,
  onConfirm,
  onCancel,
}: CustomSpinnerProps & { step?: number }) => {
  const [value, setValue] = useState(initial);

  const handleChange = (delta: number) => {
    if (type === "duration") {
      const newValue = Math.min(
        max!,
        Math.max(min!, (value as number) + (delta * step))
      );
      setValue(newValue);
    } else if (type === "repeat") {
      const currentIndex = repeatOptions.indexOf(value as Repeat);
      let newIndex =
        (currentIndex + delta + repeatOptions.length) % repeatOptions.length;
      setValue(repeatOptions[newIndex]);
    }
  };

  const renderValue = () => {
    if (type === "duration") {
      const mins = value as number;
      if (mins < 60) return `${mins}m`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m === 0 ? `${h}h` : `${h}h ${m}m`;
    }
    const str = value as Repeat;
    return capitalize(str);
  };

  return (
    <View style={styles.spinnerOverlay}>
      <View style={styles.spinnerContainer}>
        <Text style={{ ...styles.placeholder, marginBottom: 12, fontSize: 16 }}>
          {type === "duration" ? "Select Duration" : "Select Repeat"}
        </Text>

        <View style={{ flexDirection: "column", gap: 12 }}>
          <View style={styles.container}>
            <Pressable style={styles.button} onPress={() => handleChange(-1)}>
              {type === "duration" ? (
                <Feather
                  name="minus"
                  size={20}
                  color={Colors.placeholderText}
                />
              ) : (
                <Feather
                  name="chevron-left"
                  size={20}
                  color={Colors.placeholderText}
                />
              )}
            </Pressable>

            <Text style={styles.value}>{renderValue()}</Text>

            <Pressable style={styles.button} onPress={() => handleChange(1)}>
              {type === "duration" ? (
                <Feather name="plus" size={20} color={Colors.placeholderText} />
              ) : (
                <Feather
                  name="chevron-right"
                  size={20}
                  color={Colors.placeholderText}
                />
              )}
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 8,
            }}
          >
            <Pressable style={{ padding: 8 }} onPress={onCancel}>
              <Text style={{ color: Colors.text, fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: Colors.tabIconSelected,
              }}
              onPress={() => onConfirm(value)}
            >
              <Text style={{ color: Colors.background, fontSize: 16 }}>
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.modalBackground,
    borderRadius: 8,
    padding: 8,
    gap: 12,
  },
  spinnerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  spinnerContainer: {
    backgroundColor: Colors.modalBackground,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 10px 32px rgba(0, 0, 0, 0.13)",
  },
  button: {
    borderRadius: 8,
    padding: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.placeholderText,
    minWidth: 80,
    textAlign: "center",
  },
  placeholder: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CustomSpinner;
