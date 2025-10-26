import { Weekdays } from "@/constants/common";

export const getWeekday = (date: Date): string => {
  return Weekdays[date.getDay()];
};

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
