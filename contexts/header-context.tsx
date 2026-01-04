import { createContext, useContext, useEffect, useState } from "react";
import { useCalendar } from "./calendar-context";

type ViewMode = "today" | "calendar";

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  reset: () => void;
};

const HeaderContext = createContext<HeaderContextType>({
  title: "",
  setTitle: () => { },
  subtitle: "",
  setSubtitle: () => { },
  viewMode: "calendar",
  setViewMode: () => { },
  toggleViewMode: () => { },
  reset: () => { },
});

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const { monthDayString, today } = useCalendar();
  const [title, setTitle] = useState("Today");
  const [subtitle, setSubtitle] = useState(monthDayString);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  useEffect(() => {
    const now = new Date();
    const isToday =
      today.getDate() === now.getDate() &&
      today.getMonth() === now.getMonth() &&
      today.getFullYear() === now.getFullYear();

    if (isToday) {
      setTitle("Today");
      setSubtitle(monthDayString);
    } else {
      setTitle(monthDayString);
      setSubtitle("");
    }
  }, [today, monthDayString]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "today" ? "calendar" : "today"));
  };

  const reset = () => {
    setTitle(monthDayString);
    setSubtitle("");
  };

  return (
    <HeaderContext.Provider
      value={{ title, setTitle, subtitle, setSubtitle, viewMode, setViewMode, toggleViewMode, reset }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
