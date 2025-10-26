import AgendaItem from "@/components/ui/AgendaItem";
import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const { events, getEvents } = useCalendar();
  const [query, setQuery] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  useEffect(() => {
    const ym = visibleMonth;
    const start = new Date(ym.getFullYear(), ym.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(
      ym.getFullYear(),
      ym.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    getEvents(start, end);
  }, [visibleMonth]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, query]);

  const groupedByDay = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      const key = e.startDate.toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    const entries = Object.entries(map).sort((a, b) =>
      a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
    );
    return entries;
  }, [filtered]);

  const monthLabel = useMemo(() => {
    return visibleMonth.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  }, [visibleMonth]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{monthLabel}</Text>
        <Text style={styles.subtitle}>All events</Text>
      </View>

      <TextInput
        placeholder="Search by title"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        placeholderTextColor={Colors.placeholderText}
      />

      {groupedByDay.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No events this month</Text>
        </View>
      ) : (
        <FlatList
          data={groupedByDay}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, dayEvents] }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              {dayEvents
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .map((ev, index) => {
                  const key =
                    ev.id ||
                    `${
                      ev.title
                    }-${ev.startDate.toISOString()}-${ev.startTime.toISOString()}-${index}`;
                  return <AgendaItem key={key} item={ev} />;
                })}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 20,
  },
  subtitle: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
    fontSize: 12,
  },
  search: {
    borderWidth: 1.5,
    borderColor: Colors.tabIconSelected,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    color: Colors.text,
    fontFamily: "Montserrat",
  },
  calendar: {
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  section: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: "MontserratBold",
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.placeholderText,
    fontFamily: "Montserrat",
  },
});
