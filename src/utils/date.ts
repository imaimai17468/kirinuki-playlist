import { format } from "@formkit/tempo";

export const formatDate = (date: Date): string => {
  return format(date, "YYYY/MM/DD");
};
