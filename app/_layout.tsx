import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

import CustomCalendar from "@/components/CustomCalendar";
import Header from "@/components/Header";
import SplashScreen from "@/components/SplashScreen";
import { Colors } from "@/constants/Colors";
import { ExpoCalendarProvider, useCalendar } from "@/contexts/calendar-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useRouter, useSegments } from "expo-router";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const [loaded] = useFonts({
    Glockenspiel: require("../assets/fonts/LT-Glockenspiel-Black.ttf"),
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    MontserratBold: require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (!loaded || showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <ExpoCalendarProvider>
        <HeaderProvider>
          <AppContent />
        </HeaderProvider>
      </ExpoCalendarProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const { monthDayString } = useCalendar();
  const { setTitle, setSubtitle, reset } = useHeader();
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const openCalendarHandler = () => {
    if (!openCalendar) {
      setTitle("Calendar");
      setSubtitle("Today: " + monthDayString);
    } else {
      reset();
    }
    setOpenCalendar(!openCalendar);
  };

  // Simple gate: if not authenticated, ensure we're under /auth, else go to tabs
  useEffect(() => {
    const inAuth = segments[0] === "auth";
    if (!isAuthenticated && !inAuth) {
      router.replace("/auth");
    }
    if (isAuthenticated && inAuth) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.background,
        flex: 1,
        position: "relative",
      }}
    >
      {isAuthenticated && segments[0] !== "auth" && (
        <Header onMenuPress={() => {}} onCalendarPress={openCalendarHandler} />
      )}
      {openCalendar && (
        <CustomCalendar openCalendarHandler={openCalendarHandler} />
      )}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* <StatusBar style="auto" />
      <Sidebar /> */}
    </SafeAreaView>
  );
}
