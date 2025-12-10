import AgendaItem from "@/components/ui/AgendaItem";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { EventType } from "@/types/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEventModal } from "./_layout";
import { Feather } from "@expo/vector-icons";

export default function ExploreScreen() {
  const { events, getEvents } = useCalendar();
  const { openEventModal } = useEventModal();
  const [query, setQuery] = useState("");

  const handleEventPress = useCallback((event: EventType) => {
    openEventModal(event);
  }, [openEventModal]);

  // Load all events
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    getEvents(start, end);
  }, []);

  // Filter events by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, query]);

  // Sort all events by date and time
  const sortedEvents = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateCompare = a.startDate.getTime() - b.startDate.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }, [filtered]);

  // Group events by date for display
  const groupedByDate = useMemo(() => {
    const grouped: { date: string; dateObj: Date; events: EventType[] }[] = [];

    sortedEvents.forEach((event) => {
      const dateKey = event.startDate.toISOString().split("T")[0];

      let dateGroup = grouped.find(g => g.date === dateKey);
      if (!dateGroup) {
        dateGroup = {
          date: dateKey,
          dateObj: new Date(event.startDate),
          events: []
        };
        grouped.push(dateGroup);
      }

      dateGroup.events.push(event);
    });

    return grouped;
  }, [sortedEvents]);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) {
      return "Schedule";
    } else if (checkDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${day}, ${monthDay}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search events..."
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {groupedByDate.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color="#DDD" />
            <Text style={styles.emptyText}>
              {query ? "No events found" : "No events scheduled"}
            </Text>
          </View>
        ) : (
          groupedByDate.map((dateGroup, groupIndex) => (
            <View key={dateGroup.date} style={styles.dateSection}>
              <View style={styles.dateHeaderContainer}>
                <View style={styles.dateBadge}>
                  <Feather name="calendar" size={14} color={Colors.tabIconSelected} />
                  <Text style={styles.dateHeaderText}>
                    {formatDateHeader(dateGroup.dateObj)}
                  </Text>
                </View>
              </View>

              <View style={styles.eventsContainer}>
                {dateGroup.events.map((item, index) => {
                  const key =
                    item.id ||
                    `${item.title}-${item.startDate.toISOString()}-${item.startTime.toISOString()}-${index}`;
                  return (
                    <View key={key} style={styles.eventWrapper}>
                      <AgendaItem
                        item={item}
                        onPress={handleEventPress}
                        showCheckbox={false}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Use main background
    paddingTop: 16, // Add top padding since header is gone
  },
  header: {
    // keeping empty style just in case it's ref'd or to hold space if needed, 
    // but effectively it's not used now.
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  // ... title/subtitle unused now ...
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF0F6", // Filled style matching other inputs
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24, // More space below search
    paddingHorizontal: 20,
    paddingVertical: 4, // Inner padding for input
    // Removed shadows for cleaner "filled" look
  },
  searchIcon: {
    marginRight: 12,
  },
  search: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.text,
    fontFamily: "Montserrat",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
    fontSize: 16,
    marginTop: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    // Make date badge more subtle/clean
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    marginBottom: 4,
    // Removed shadows and background for simple text header look
  },
  dateHeaderText: {
    fontSize: 14,
    fontFamily: "MontserratBold",
    color: Colors.tabIconSelected,
    marginLeft: 8,
    textTransform: "uppercase", // Uppercase for header style
    letterSpacing: 0.5,
  },
  eventsContainer: {
    gap: 12, // Increased gap between events
  },
  eventWrapper: {
    paddingHorizontal: 20,
  },
});
