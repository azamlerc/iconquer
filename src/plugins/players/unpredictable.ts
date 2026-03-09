import { GamePhase } from "../../types/game";
import type { PlayerId } from "../../types/game";
import type { GameEngine } from "../../core/game";
import type { PlayerPlugin } from "./plugin";

export class UnpredictablePlayer implements PlayerPlugin {
  id = "unpredictable";
  displayName = "Unpredictable";

  runPickCountry(game: GameEngine, playerId: PlayerId): void {
    const pick = game.pickRandomUnownedCountry();
    if (pick) game.pickCountry(playerId, pick);
  }

  runAssignInitialArmies(game: GameEngine, playerId: PlayerId): void {
    game.allocateArmiesRandomly(playerId);
  }

  runAssignArmiesFromIncome(game: GameEngine, playerId: PlayerId): void {
    const player = game.player(playerId);
    if (player.cards.length > 4) {
      game.turnInCards(playerId, game.bestCardsToTurnIn(playerId).slice(0, 3));
    }

    game.allocateArmiesRandomly(playerId);
    game.updateReserveArmies(playerId, 0.5);
    game.startAttackPhase();
  }

  runAssignArmiesFromConquer(game: GameEngine, playerId: PlayerId): void {
    game.turnInCards(playerId, game.bestCardsToTurnIn(playerId).slice(0, 3));
    game.allocateArmiesRandomly(playerId);
  }

  runAdvanceArmies(game: GameEngine, playerId: PlayerId): void {
    game.allocateArmiesRandomly(playerId);
  }

  runFortify(game: GameEngine, playerId: PlayerId): void {
    game.fortifyVulnerableCountries(playerId);
  }

  runAttack(game: GameEngine, playerId: PlayerId): void {
    const done = game.attackRandomCountries(playerId);
    if (done && game.getSnapshot().phase !== GamePhase.Victory) {
      game.finishAttackPhase();
    }
  }
}
