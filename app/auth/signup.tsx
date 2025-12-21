import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

export default function SignupScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!email || !password || !name) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        name
      });

      if (success) {
        router.replace("/(tabs)");
      } else {
        alert("Registration failed. Email might be taken.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={{ alignItems: "center", width: "100%", gap: 8 }}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <TextInput
          placeholder="Name"
          placeholderTextColor={Colors.placeholderText}
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.placeholderText}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={Colors.placeholderText}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable onPress={onCreate} style={styles.shadowWrapper} disabled={loading}>
          <LinearGradient
            colors={[Colors.tabIconSelected, "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.buttonFilled, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.buttonTextFilled}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.muted}>Already have an account?</Text>
          <Link href="/auth/login" style={styles.link}>
            Log in
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
    paddingHorizontal: 24,
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
    fontSize: 28,
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
    width: "100%",
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
