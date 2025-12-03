import { createContext, useContext, useState } from "react";
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
  setTitle: () => {},
  subtitle: "",
  setSubtitle: () => {},
  viewMode: "calendar",
  setViewMode: () => {},
  toggleViewMode: () => {},
  reset: () => {},
});

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const { monthDayString } = useCalendar();
  const [title, setTitle] = useState("Today");
  const [subtitle, setSubtitle] = useState(monthDayString);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "today" ? "calendar" : "today"));
  };

  const reset = () => {
    setTitle("Today");
    setSubtitle(monthDayString);
  };

  return (
    <HeaderContext.Provider
      value={{ title, setTitle, subtitle, setSubtitle, viewMode, setViewMode, toggleViewMode, reset }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
