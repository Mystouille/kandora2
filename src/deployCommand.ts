import { deployCommands } from "./commands/utils/commandUtils";

deployCommands().then(() => {
  console.log(`Commands updated`);
});
