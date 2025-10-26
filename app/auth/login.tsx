import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const onContinue = () => {
    login();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.placeholderText}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={Colors.placeholderText}
          secureTextEntry
          style={styles.input}
        />
        <LinearGradient
          colors={[Colors.tabIconSelected, Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </LinearGradient>
        <View style={styles.row}>
          <Text style={styles.muted}>Don't have an account?</Text>
          <Link href="/auth/signup" style={styles.link}>
            Sign up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "88%",
    backgroundColor: Colors.modalBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2F0FF",
    padding: 20,
    gap: 12,
  },
  title: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 22,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.tabIconSelected,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontFamily: "Montserrat",
  },
  buttonGradient: {
    borderRadius: 10,
  },
  button: {
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.background,
    fontFamily: "MontserratBold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  muted: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
  },
  link: {
    color: Colors.tabIconSelected,
    fontFamily: "MontserratBold",
  },
});
