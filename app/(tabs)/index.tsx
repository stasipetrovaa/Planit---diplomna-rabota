import ParallaxScrollView from "@/components/ParallaxScrollView";
import AgendaItem from "@/components/ui/AgendaItem";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { useHeader } from "@/contexts/header-context";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WeekCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { monthDayString, todayToString, events, getEvents, today, setToday } =
    useCalendar();
  const { setTitle, setSubtitle } = useHeader();

  console.log("Events from calendar:", events);

  useEffect(() => {
    setTitle("Today");
    setSubtitle(monthDayString);
    const d = new Date();
    const start = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999
    );
    getEvents(start, end);
  }, []);

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

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

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const d = new Date(day.dateString);
      setToday(d);
      const start = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0,
        0
      );
      const end = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999
      );
      getEvents(start, end);
    },
    [getEvents, setToday]
  );

  return (
    <SafeAreaView style={styles.container}>
      <WeekCalendar
        current={todayToString}
        firstDay={1}
        pastScrollRange={3}
        futureScrollRange={3}
        markedDates={{
          [todayToString]: { selected: true },
        }}
        onDayPress={handleDayPress}
        theme={{
          selectedDayBackgroundColor: Colors.tabIconSelected,
          textDayFontFamily: "Montserrat",
          textMonthFontFamily: "MontserratBold",
          textDayHeaderFontFamily: "MontserratBold",
          textDayFontSize: 16,
        }}
      />
      <ParallaxScrollView>
        <View>
          {dayEvents.map((item, index) => {
            const key =
              item.id ||
              `${
                item.title
              }-${item.startDate.toISOString()}-${item.startTime.toISOString()}-${index}`;
            return <AgendaItem key={key} item={item} />;
          })}
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
});
