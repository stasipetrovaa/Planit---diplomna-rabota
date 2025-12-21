import AgendaItem from "@/components/ui/AgendaItem";
import HorizontalDaySelector from "@/components/ui/HorizontalDaySelector";
import CalendarModal from "@/components/CalendarModal";
import EmptyStateTimeline from "@/components/EmptyStateTimeline";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { useHeader } from "@/contexts/header-context";
import { EventType } from "@/types/types";
import { useCallback, useMemo, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEventModal } from "./_layout";

export default function HomeScreen() {
  const { monthDayString, events, today, setToday, toggleEventComplete } =
    useCalendar();
  const { setTitle, setSubtitle, viewMode, setViewMode } = useHeader();
  const { openEventModal } = useEventModal();
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const handleEventPress = useCallback((event: EventType) => {
    openEventModal(event);
  }, [openEventModal]);

  const handleToggleComplete = useCallback((event: EventType) => {
    toggleEventComplete(event);
  }, [toggleEventComplete]);

  useEffect(() => {
    setTitle("Today");
    setSubtitle(monthDayString);
  }, [monthDayString, setTitle, setSubtitle]);

  // Handle calendar button click
  useEffect(() => {
    if (viewMode === "calendar") {
      setCalendarModalVisible(true);
      setTimeout(() => setViewMode("today"), 0);
    }
  }, [viewMode, setViewMode]);

  const dayEvents = useMemo(() => {
    const selectedDate = new Date(today);
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [events, today]);

  // Group events by hour for timeline display
  const timelineData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
    const eventsByHour: { [key: number]: EventType[] } = {};

    dayEvents.forEach((event) => {
      const hour = event.startTime.getHours();
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push(event);
    });

    return { hours, eventsByHour };
  }, [dayEvents]);

  const handleDaySelect = useCallback((date: Date) => {
    setToday(date);
  }, [setToday]);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <HorizontalDaySelector
        selectedDate={today}
        onDateSelect={handleDaySelect}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dayEvents.length === 0 ? (
          <EmptyStateTimeline />
        ) : (
          timelineData.hours.map((hour) => {
            const hourEvents = timelineData.eventsByHour[hour];
            if (!hourEvents || hourEvents.length === 0) return null;

            return (
              <View key={hour} style={styles.timelineRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{formatHour(hour)}</Text>
                </View>
                <View style={styles.eventsColumn}>
                  {hourEvents.map((item, index) => {
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
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <CalendarModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        selectedDate={today}
        onDateSelect={handleDaySelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  timelineRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timeColumn: {
    width: 70,
    paddingTop: 16,
    paddingLeft: 16,
    alignItems: "flex-start",
  },
  timeText: {
    fontSize: 12,
    fontFamily: "MontserratBold",
    color: "#666",
  },
  eventsColumn: {
    flex: 1,
  },
});
