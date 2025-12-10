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
          {/* Filled Gradient Button (Primary) */}
          <Pressable onPress={goLogin} style={styles.shadowWrapper}>
            <LinearGradient
              colors={[Colors.tabIconSelected, "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonFilled}
            >
              <Text style={styles.buttonTextFilled}>Log In</Text>
            </LinearGradient>
          </Pressable>

          {/* Gradient Border Button (Secondary) */}
          <Pressable onPress={goSignup}>
            <LinearGradient
              colors={[Colors.tabIconSelected, "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorderContainer}
            >
              <View style={styles.buttonWhiteInner}>
                <Text style={styles.buttonTextGradient}>Sign Up</Text>
              </View>
            </LinearGradient>
          </Pressable>
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
    gap: 16,
    width: "80%",
  },
  shadowWrapper: {
    shadowColor: Colors.tabIconSelected,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonFilled: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextFilled: {
    color: "white",
    fontFamily: "MontserratBold",
    fontSize: 18,
  },
  gradientBorderContainer: {
    borderRadius: 16,
    padding: 2, // Thickness of the border
  },
  buttonWhiteInner: {
    backgroundColor: Colors.background,
    borderRadius: 14, // Slightly less than container to fit
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextGradient: {
    color: Colors.tabIconSelected,
    fontFamily: "MontserratBold",
    fontSize: 18,
  },
});
