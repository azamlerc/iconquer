import { AggressivePlayer } from "./aggressive";
import { DefensivePlayer } from "./defensive";
import { UnpredictablePlayer } from "./unpredictable";
import type { PlayerPlugin } from "./plugin";

const aggressive = new AggressivePlayer();
const defensive = new DefensivePlayer();
const unpredictable = new UnpredictablePlayer();

export const builtInPlayerPlugins: Record<string, PlayerPlugin> = {
  [aggressive.id]: aggressive,
  [defensive.id]: defensive,
  [unpredictable.id]: unpredictable,
};
