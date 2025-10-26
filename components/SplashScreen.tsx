import { Colors } from "@/constants/Colors";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
    });

    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    });
    fadeIn.start();

    fadeIn.start(() => {
      setTimeout(() => {
        fadeOut.start(() => {
          onAnimationComplete();
        });
      }, 1000);
    });

    return () => {
      fadeIn.stop();
      fadeOut.stop();
    };
  }, [fadeAnim, onAnimationComplete]);

  return (
    <View style={[styles.container]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={[styles.appLogo]}
        />
        <Text style={[styles.subtitle]}>Your Day, Perfectly Planned</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  appLogo: {
    width: "100%",
    height: "50%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  subtitle: {
    marginTop: -80,
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Montserrat",
    color: "#A085FF",
  },
});
