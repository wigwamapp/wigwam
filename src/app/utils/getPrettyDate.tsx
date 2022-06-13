import { format, formatDistanceToNowStrict, isToday } from "date-fns";

export const getPrettyDate = (date: string | number) => {
  const preparedDate = new Date(date); // TODO: Add locales

  if (isToday(preparedDate)) {
    return formatDistanceToNowStrict(preparedDate);
  }

  return format(preparedDate, "dd MMM, yyyy");
};
