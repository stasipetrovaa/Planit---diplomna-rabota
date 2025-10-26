import HomeIcon from "@/assets/images/home.svg";

import PlusIcon from "@/assets/images/plus.svg";
import SearchIcon from "@/assets/images/search.svg";

import { EventType } from "@/types/types";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import AddEventModal from "@/components/AddEventModal";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";

export default function TabLayout() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const { addEvent } = useCalendar();

  const createEvent = async (event: EventType) => {
    try {
      const eventId = await addEvent(event);
      if (eventId) {
        setTimeout(() => {
          setOpenAddModal(false);
        }, 600);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { ...styles.tabBarStyle },
            default: { ...styles.tabBarStyle },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <HomeIcon
                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
                width={32}
                height={32}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: () => (
              <LinearGradient
                colors={[Colors.tabIconSelected, Colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.plusIcon}
              >
                <PlusIcon width={80} height={80} style={{ marginTop: 10 }} />
              </LinearGradient>
            ),
            tabBarButton: (props) => (
              <HapticTab
                {...props}
                onPress={() => {
                  // props.onPress?.();
                  setOpenAddModal(true);
                }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ focused }) => (
              <SearchIcon
                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
                width={32}
                height={32}
              />
            ),
          }}
        />
      </Tabs>

      <AddEventModal
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
        onAddEvent={createEvent}
      />

      {/* {snackOpen && (
        <Snackbar
          visible={snackOpen}
          onDismiss={() => setSnackOpen(false)}
          duration={2000}
        >
          Event created
        </Snackbar>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    display: "flex",
    flexDirection: "row",
    paddingTop: 10,
    alignSelf: "center",
    bottom: "4%",
    borderRadius: 30,
    height: "8%",
    width: "88%",
    backgroundColor: Colors.tabBackground,
    borderTopWidth: 0,
  },
  plusIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 40,
    borderColor: Colors.background,
    borderWidth: 8,
    top: -10,
  },
});
