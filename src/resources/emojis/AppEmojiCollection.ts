import { ApplicationEmoji, Collection, Snowflake } from "discord.js";

export class AppEmojiCollection {
  static #instance: AppEmojiCollection;

  public emojiCollection: Collection<Snowflake, ApplicationEmoji> | undefined;

  private constructor() {}

  /**
   * The static getter that controls access to the singleton instance.
   *
   * This implementation allows you to extend the Singleton class while
   * keeping just one instance of each subclass around.
   */
  public static get instance(): AppEmojiCollection {
    if (!AppEmojiCollection.#instance) {
      AppEmojiCollection.#instance = new AppEmojiCollection();
    }
    return AppEmojiCollection.#instance;
  }

  public setCollection(collection: Collection<Snowflake, ApplicationEmoji>) {
    this.emojiCollection = collection;
  }
  public getCollection(): Collection<Snowflake, ApplicationEmoji> {
    return this.emojiCollection!;
  }
}
