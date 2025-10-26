import { createContext, useContext, useState } from "react";
import { useCalendar } from "./calendar-context";

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  reset: () => void;
};

const HeaderContext = createContext<HeaderContextType>({
  title: "",
  setTitle: () => {},
  subtitle: "",
  setSubtitle: () => {},
  reset: () => {},
});

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const { monthDayString } = useCalendar();
  const [title, setTitle] = useState("Today");
  const [subtitle, setSubtitle] = useState(monthDayString);

  const reset = () => {
    setTitle("Today");
    setSubtitle(monthDayString);
  };

  return (
    <HeaderContext.Provider
      value={{ title, setTitle, subtitle, setSubtitle, reset }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
