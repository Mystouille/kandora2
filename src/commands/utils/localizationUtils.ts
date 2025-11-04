import {
  ApplicationCommandOptionBase,
  Locale,
  SharedNameAndDescription,
  SlashCommandBooleanOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import {
  NameDesc,
  resourceMap,
  StringResources,
} from "../../resources/localization/strings";
import { stringsEn } from "../../resources/localization/strings-en";

type NestedStringContainer = { [id: string]: NestedStringContainer | string };

// Return a localized string from the specified resources object
function localize(resources: StringResources, path: string): string {
  const tokens = path.split(".");
  let object: NestedStringContainer | string = resources;
  tokens.forEach((tok) => {
    if (typeof object !== "string") {
      object = object[tok];
    }
  });
  if (typeof object === "string") {
    return object;
  } else {
    return JSON.stringify(object);
  }
}

// Return the localization props needed for discord.js multilanguage support
export function getLocProps(path: string) {
  const props: Partial<Record<Locale, string | null>> | null = {};
  Object.values(Locale).forEach((item) => {
    let locale = item.toString() as Locale;
    let localizedRes = resourceMap[locale];
    if (localizedRes !== undefined) {
      let localizedString = localize(localizedRes, path);
      props[locale] = localizedString;
    }
  });
  return props;
}

export function buildOptionNameAndDescription<
  OptionType extends SharedNameAndDescription,
>(option: OptionType, path: NameDesc) {
  return option
    .setName(localize(stringsEn, path.name))
    .setNameLocalizations(getLocProps(path.name))
    .setDescription(localize(stringsEn, path.desc))
    .setDescriptionLocalizations(getLocProps(path.desc));
}
