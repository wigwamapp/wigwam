import { FC } from "react";
import { format, formatDistanceToNowStrict, isToday } from "date-fns";
import { useAtomValue } from "jotai";

import {
  DEFAULT_LOCALES_FOR_DATES,
  FALLBACK_LOCALES_FOR_DATES,
} from "fixtures/locales";

import { currentLocaleAtom } from "app/atoms";

type PrettyDateProps = {
  date: string | number;
};

const PrettyDate: FC<PrettyDateProps> = ({ date }) => {
  const currentLocale = useAtomValue(currentLocaleAtom);

  return <>{getPrettyDate(date, currentLocale)}</>;
};

export default PrettyDate;

export const getPrettyDate = (
  date: string | number,
  currentLocaleCode: string
) => {
  const preparedDate = new Date(date);

  const { locale, format: formatOption } =
    DEFAULT_LOCALES_FOR_DATES.find((loc) => loc.code === currentLocaleCode) ??
    FALLBACK_LOCALES_FOR_DATES;

  if (isToday(preparedDate)) {
    return formatDistanceToNowStrict(preparedDate, { locale });
  }

  return format(preparedDate, formatOption, { locale });
};
