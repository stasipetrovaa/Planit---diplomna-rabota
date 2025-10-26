import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { useHeader } from "@/contexts/header-context";
import { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

type CustomCalendarProps = {
  openCalendarHandler: () => void;
};

const CustomCalendar = ({ openCalendarHandler }: CustomCalendarProps) => {
  const { todayToString, monthDayString } = useCalendar();
  const { setTitle, setSubtitle } = useHeader();

  useEffect(() => {
    setTitle("Calendar");
    setSubtitle("Today: " + monthDayString);
  }, []);

  return (
    <SafeAreaView style={styles.calendarContainer}>
      <Calendar
        current={todayToString}
        onDayPress={openCalendarHandler}
        style={styles.calendar}
        monthFormat="MMMM"
        theme={{
          dayTextColor: Colors.text,
          todayTextColor: Colors.tabIconSelected,
          textMonthFontFamily: "MontserratBold",
          textMonthFontSize: 20,
          textDayFontSize: 16,
          textDayHeaderFontFamily: "MontserratBold",
          textDayFontFamily: "Montserrat",
          arrowColor: Colors.tabIconSelected,
        }}
      />
    </SafeAreaView>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  calendarContainer: {
    alignSelf: "center",
    position: "absolute",
    top: "18%",
    width: "80%",
    height: "100%",
  },
  calendar: {
    zIndex: 1,
    boxShadow: "0px 10px 32px rgba(0, 0, 0, 0.13)",
    borderRadius: 16,
    padding: 12,
  },
});
