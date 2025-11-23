# Kandora2 - Discord Mahjong Bot

## Architecture Overview

This is a Discord bot focused on mahjong (Japanese riichi mahjong) quiz/practice features with Majsoul API integration. Core components:

- **Discord Bot Layer** (`src/index.ts`): Discord.js v14 client with slash command handling
- **Commands** (`src/commands/`): Modular slash commands (quiz, mjg, ping, createuser)
- **Majsoul API** (`src/api/majsoul/`): WebSocket-based connection to Majsoul game servers using protobuf
- **Mahjong Logic** (`src/mahjong/`): Hand parsing, tile rendering (Canvas), shanten calculation
- **Database** (`src/db/`): MongoDB via Mongoose for user data and API config persistence

## Development Workflow

### Environment Setup

Requires `.env` with: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `MONGODB_URI`, `MAJSOUL_UID`, `MAJSOUL_TOKEN`

### Key Commands

- `npm run tsx` - Run bot in development (uses tsx for TypeScript execution)
- `npm test` - Run Jest tests
- `npm run build` - Build with tsup (minified)
- `npm run deployCommands` - Deploy Discord slash commands (run after command changes)
- `npm run deployEmoji` - Deploy custom emojis to Discord application

### Testing

- Jest with ts-jest preset
- Spec files colocated with source: `*.spec.ts` (e.g., `handParser.spec.ts`, `imageUtils.spec.ts`)
- Run tests after modifying mahjong logic or utilities

## Project-Specific Patterns

### Command Structure

Commands follow a module pattern in `src/commands/`:

```typescript
export const data = new SlashCommandBuilder()...
export async function execute(interaction: ChatInputCommandInteraction) {...}
```

Import and register in `src/utils/commandUtils.ts` commands object.

### Localization System

All user-facing strings use the localization system (`src/resources/localization/`):

- Define paths in `strings.ts` (e.g., `"commands.quiz.common.reply.timerDisclaimerFormat"`)
- Provide translations in `strings-en.ts`, `strings-fr.ts`
- Use `localize()` helper from `localizationUtils.ts` to resolve by Discord locale
- Use `buildOptionNameAndDescription()` for slash command options

### Mahjong Hand Notation

Tiles use compact notation: `1-9m` (man/characters), `1-9p` (pin/dots), `1-9s` (sou/bamboo), `1-7z` (honors)

- Example: `123m456p789s1122z` (full hand)
- Melds separated by spaces: `123m 456p 789s 1122z` (open hand)
- Internal representations: `Tile9997` (4 suits × 9 ranks array), `Tile34` (34-element array)
- Converters in `handConverter.ts`: `fromStrToTile9997()`, `fromTile9997ToStr()`

### Canvas-based Tile Rendering

`src/mahjong/imageUtils.ts` generates mahjong hand images:

- Base tiles in `src/resources/tiles/base/tiles.png` (10×4 grid)
- Cached generated images in `src/resources/tiles/generated/`
- Use `handToFileName()` to get deterministic cache keys
- Supports tilted tiles for melds with rotation via `DOMMatrix`

### Majsoul API Integration

RxJS-based reactive architecture (`src/api/majsoul/data/`):

- `MajsoulApi.retrieveApiResources()` fetches latest protobuf definitions
- `Connection` class handles WebSocket with automatic reconnection
- `RpcImplementation` provides typed RPC service calls
- Passport authentication flow in `connector.ts` with cookie/token persistence in MongoDB
- Game records decoded via `parseGameRecordResponse()`

### Database Models

Mongoose schemas in `src/db/`:

- `User` - Discord user data and quiz statistics
- `MajsoulConfig` - Stores API credentials (passportToken, loginCookies, userAgent)

### Quiz System

`src/commands/quiz/handlers/QuizHandler.ts` - Abstract base class for quiz modes:

- Subclasses: `NanikiruQuizHandler` (tile discard efficiency), `ChinitsuQuizHandler` (pure hand building)
- Quiz modes: `Explore` (review all questions), `First` (first correct wins), `Race` (speed competition)
- Questions loaded from CSV: `src/resources/nanikiru/problems/nanikiruCollection.csv`
- Uses emoji reactions for answers via `AppEmojiCollection`

## Common Gotchas

- **Canvas on Windows**: May need Visual Studio build tools for native dependencies
- **Majsoul Token Expiry**: Run `connector.ts` main() to refresh passport tokens when API calls fail
- **Emoji References**: Custom emojis must be deployed to Discord app before use (run `deployEmoji` script)
- **Slash Commands**: Always run `deployCommands` after modifying command definitions before testing

## External Dependencies

- **syanten** npm package: Calculates shanten (tiles-to-ready) for mahjong hands
- **canvas**: Node.js Canvas API implementation for tile image generation
- **protobufjs**: Runtime protobuf encoding/decoding for Majsoul API
- **discord.js**: Discord Bot API library (v14)
