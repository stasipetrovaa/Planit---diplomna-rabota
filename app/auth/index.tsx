import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";

export default function AuthLanding() {
  const { login } = useAuth();
  const router = useRouter();

  const goLogin = () => router.push("/auth/login");
  const goSignup = () => router.push("/auth/signup");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Welcome to PlanIt</Text>
        <Text style={styles.subtitle}>Organize your days effortlessly</Text>

        <View style={styles.buttons}>
          <LinearGradient
            colors={[Colors.tabIconSelected, Colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Pressable style={styles.button} onPress={goLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </Pressable>
          </LinearGradient>

          <LinearGradient
            colors={[Colors.background, Colors.tabIconSelected]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Pressable style={styles.button} onPress={goSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  title: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 28,
  },
  subtitle: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
  },
  buttons: {
    gap: 14,
    width: "80%",
  },
  buttonGradient: {
    borderRadius: 14,
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.background,
    fontFamily: "MontserratBold",
    fontSize: 16,
  },
});
