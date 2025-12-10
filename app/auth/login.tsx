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
      <View style={styles.contentContainer}>
        <View style={{ alignItems: "center", width: "100%", gap: 8 }}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please sign in to continue</Text>
        </View>

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

        <Pressable onPress={onContinue} style={styles.shadowWrapper}>
          <LinearGradient
            colors={[Colors.tabIconSelected, "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonFilled}
          >
            <Text style={styles.buttonTextFilled}>Log In</Text>
          </LinearGradient>
        </Pressable>

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
    paddingHorizontal: 24, // Added padding for the whole container
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  title: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 28, // Larger title
    textAlign: "center",
  },
  subtitle: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#EFF0F6", // Light gray filled background
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: Colors.text,
    fontFamily: "Montserrat",
    fontSize: 16,
  },
  shadowWrapper: {
    width: "100%", // Full width button
    shadowColor: Colors.tabIconSelected,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
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
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  muted: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
    fontSize: 14,
  },
  link: {
    color: Colors.tabIconSelected,
    fontFamily: "MontserratBold",
    fontSize: 14,
  },
});
