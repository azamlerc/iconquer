import { GamePhase } from "../../types/game";
import type { PlayerId } from "../../types/game";
import type { GameEngine } from "../../core/game";
import type { PlayerPlugin } from "./plugin";

export class AggressivePlayer implements PlayerPlugin {
  id = "aggressive";
  displayName = "Aggressive";

  runPickCountry(game: GameEngine, playerId: PlayerId): void {
    const pick = this.bestCountryToPick(game, playerId) ?? game.pickRandomUnownedCountry();
    if (pick) game.pickCountry(playerId, pick);
  }

  runAssignInitialArmies(game: GameEngine, playerId: PlayerId): void {
    game.allocateArmiesToMostThreatened(playerId, true);
  }

  runAssignArmiesFromIncome(game: GameEngine, playerId: PlayerId): void {
    const player = game.player(playerId);
    if (player.cards.length > 4) {
      game.turnInCards(playerId, game.bestCardsToTurnIn(playerId).slice(0, 3));
    }
    game.allocateArmiesToMostThreatened(playerId, false);
    game.updateReserveArmies(playerId, 0.5);
    game.startAttackPhase();
  }

  runAssignArmiesFromConquer(game: GameEngine, playerId: PlayerId): void {
    game.turnInCards(playerId, game.bestCardsToTurnIn(playerId).slice(0, 3));
    game.allocateArmiesToMostThreatened(playerId, false);
  }

  runAdvanceArmies(game: GameEngine, playerId: PlayerId): void {
    game.allocateArmiesToMostThreatened(playerId, false);
  }

  runFortify(game: GameEngine, playerId: PlayerId): void {
    game.fortifyVulnerableCountries(playerId);
  }

  runAttack(game: GameEngine, playerId: PlayerId): void {
    let done = game.attackVulnerableCountries(playerId);
    if (done && game.getSnapshot().phase !== GamePhase.Victory) {
      game.finishAttackPhase();
    }
  }

  private bestCountryToPick(game: GameEngine, playerId: PlayerId): string | null {
    const unowned = game.countryIds().filter((id) => game.country(id).ownerId === null);
    if (!unowned.length) return null;

    let best: string | null = null;
    let bestScore = -Infinity;

    for (const countryId of unowned) {
      const def = game.map.countries[countryId];
      const neighbors = def.neighbors;
      let friendlyNeighbors = 0;
      let enemyNeighbors = 0;
      let foreignNeighbors = 0;
      for (const neighborId of neighbors) {
        const ownerId = game.country(neighborId).ownerId;
        if (ownerId === playerId) friendlyNeighbors += 1;
        else if (ownerId) enemyNeighbors += 1;

        const sameContinent = Object.values(game.map.continents).some(
          (continent) => continent.countries.includes(countryId) && continent.countries.includes(neighborId),
        );
        if (!sameContinent) foreignNeighbors += 1;
      }

      const score = foreignNeighbors * 2 + friendlyNeighbors + enemyNeighbors + Math.random() * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = countryId;
      }
    }

    return best;
  }
}
