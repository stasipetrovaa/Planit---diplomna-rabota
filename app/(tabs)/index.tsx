import ParallaxScrollView from "@/components/ParallaxScrollView";
import AgendaItem from "@/components/ui/AgendaItem";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { useHeader } from "@/contexts/header-context";
import { EventType } from "@/types/types";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View, LayoutAnimation, UIManager } from "react-native";
import { Calendar, WeekCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEventModal } from "./_layout";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { monthDayString, todayToString, events, today, setToday, toggleEventComplete } =
    useCalendar();
  const { setTitle, setSubtitle, viewMode } = useHeader();
  const { openEventModal } = useEventModal();
  const calendarOpacity = useRef(new Animated.Value(viewMode === "calendar" ? 1 : 0)).current;
  const calendarHeight = useRef(new Animated.Value(viewMode === "calendar" ? 1 : 0)).current;

  const handleEventPress = useCallback((event: EventType) => {
    openEventModal(event);
  }, [openEventModal]);

  const handleToggleComplete = useCallback((event: EventType) => {
    toggleEventComplete(event);
  }, [toggleEventComplete]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (viewMode === "today") {
      setTitle("Today");
      const now = new Date();
      setToday(now);
      setSubtitle(now.toLocaleDateString("en-US", { month: "long", day: "numeric" }));
      Animated.parallel([
        Animated.timing(calendarOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(calendarHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      setTitle("Calendar");
      setSubtitle(monthDayString);
      Animated.parallel([
        Animated.timing(calendarOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(calendarHeight, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [viewMode, monthDayString, setTitle, setSubtitle, setToday, calendarOpacity, calendarHeight]);

  const dayEvents = useMemo(() => {
    const selectedDate = new Date(today);
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [events, today]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { selected?: boolean; marked?: boolean; dotColor?: string }> = {};
    events.forEach((e) => {
      const dateStr = new Date(e.startDate).toISOString().split("T")[0];
      marks[dateStr] = {
        ...marks[dateStr],
        marked: true,
        dotColor: e.color || Colors.tabIconSelected,
      };
    });
    marks[todayToString] = {
      ...marks[todayToString],
      selected: true,
    };
    return marks;
  }, [events, todayToString]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const d = new Date(day.dateString);
      setToday(d);
    },
    [setToday]
  );

  const calendarMaxHeight = Platform.OS === "web" ? 380 : 120;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          opacity: calendarOpacity,
          maxHeight: calendarHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, calendarMaxHeight],
          }),
          overflow: "hidden",
        }}
      >
        {Platform.OS === "web" ? (
          <Calendar
            current={todayToString}
            firstDay={1}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              selectedDayBackgroundColor: Colors.tabIconSelected,
              textDayFontFamily: "Montserrat",
              textMonthFontFamily: "MontserratBold",
              textDayHeaderFontFamily: "MontserratBold",
              textDayFontSize: 16,
            }}
            style={styles.webCalendar}
          />
        ) : (
          <WeekCalendar
            current={todayToString}
            firstDay={1}
            pastScrollRange={3}
            futureScrollRange={3}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              selectedDayBackgroundColor: Colors.tabIconSelected,
              textDayFontFamily: "Montserrat",
              textMonthFontFamily: "MontserratBold",
              textDayHeaderFontFamily: "MontserratBold",
              textDayFontSize: 16,
            }}
          />
        )}
      </Animated.View>
      <ParallaxScrollView>
        <View>
          {dayEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events for this day</Text>
            </View>
          ) : (
            dayEvents.map((item, index) => {
              const key =
                item.id ||
                `${item.title}-${item.startDate.toISOString()}-${item.startTime.toISOString()}-${index}`;
              return (
                <AgendaItem
                  key={key}
                  item={item}
                  onPress={handleEventPress}
                  onToggleComplete={handleToggleComplete}
                />
              );
            })
          )}
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingBlock: 10,
  },
  calendarWrapper: {
    width: "100%",
    height: 160,
  },
  section: {
    backgroundColor: Colors.background,
    color: "grey",
    textTransform: "capitalize",
  },
  webCalendar: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
    fontSize: 16,
  },
});
