import type { CountryId, PlayerId } from "../../types/game";
import type { GameEngine } from "../../core/game";

export interface PlayerPlugin {
  id: string;
  displayName: string;
  runPickCountry(game: GameEngine, playerId: PlayerId): void;
  runAssignInitialArmies(game: GameEngine, playerId: PlayerId): void;
  runAssignArmiesFromIncome(game: GameEngine, playerId: PlayerId): void;
  runAssignArmiesFromConquer(game: GameEngine, playerId: PlayerId): void;
  runAdvanceArmies(game: GameEngine, playerId: PlayerId, fromCountryId: CountryId, toCountryId: CountryId): void;
  runFortify(game: GameEngine, playerId: PlayerId): void;
  runAttack(game: GameEngine, playerId: PlayerId): void;
}
