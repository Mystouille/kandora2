import { Locale } from "discord.js";
import { localize } from "./localizationUtils";

export function stringFormat(locale: Locale, str: string, ...args: string[]) {
  const locString = localize(locale, str);
  return locString.replace(/{(\d+)}/g, (match, index) => args[index] || "");
}
