import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

export default function AddScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Add New Item</ThemedText>
      <ThemedText>
        This is the add screen where you can create new content.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
