import { GamePhase } from "../../types/game";
import type { CountryId, PlayerId } from "../../types/game";
import type { GameEngine } from "../../core/game";
import type { PlayerPlugin } from "./plugin";

export class DefensivePlayer implements PlayerPlugin {
  id = "defensive";
  displayName = "Defensive";

  private readonly lostCountries = new Map<PlayerId, Set<CountryId>>();

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

    const lost = this.ensureLost(playerId);
    for (const countryId of [...lost]) {
      if (game.country(countryId).ownerId === playerId) {
        lost.delete(countryId);
      }
    }

    game.allocateArmiesToMostThreatened(playerId, true);
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
    const lost = this.ensureLost(playerId);

    for (const targetId of lost) {
      const neighbors = game.neighbors(targetId);
      for (const neighborId of neighbors) {
        if (game.country(neighborId).ownerId !== playerId) continue;
        if (!game.canAttack(neighborId, targetId)) continue;

        const won = game.attackUntilWinOrLose(neighborId, targetId);
        if (won) {
          lost.delete(targetId);
          return;
        }
      }
    }

    const snapshot = game.getSnapshot();
    if (snapshot.phase !== GamePhase.Victory) {
      game.finishAttackPhase();
    }
  }

  trackDefeat(playerId: PlayerId, countryId: CountryId): void {
    this.ensureLost(playerId).add(countryId);
  }

  private ensureLost(playerId: PlayerId): Set<CountryId> {
    let set = this.lostCountries.get(playerId);
    if (!set) {
      set = new Set<CountryId>();
      this.lostCountries.set(playerId, set);
    }
    return set;
  }
}
