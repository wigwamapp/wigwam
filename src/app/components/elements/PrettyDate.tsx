import { FC } from "react";
import { useAtomValue } from "jotai";
import format from "date-fns/format";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import isToday from "date-fns/isToday";

import {
  DEFAULT_LOCALES_FOR_DATES,
  FALLBACK_LOCALES_FOR_DATES,
} from "fixtures/dateLocales";

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

  const { locale } =
    DEFAULT_LOCALES_FOR_DATES.find((loc) => loc.code === currentLocaleCode) ??
    FALLBACK_LOCALES_FOR_DATES;

  if (isToday(preparedDate)) {
    return formatDistanceToNowStrict(preparedDate, { locale, addSuffix: true });
  }

  return format(preparedDate, "PP", { locale });
};
