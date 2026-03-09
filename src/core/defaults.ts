import { AttackMode, type Settings } from "../types/game";

export const defaultSettings: Settings = {
  assignCountries: true,
  attacksPerClick: AttackMode.AttackUntilWinOrLose,
  diceToRoll: 3,
  lossesExceedValue: 5,
  cardValues: 1,
  allowTurningInCards: true,
  advanceArmies: true,
};

export const defaultPlayerColors = [
  "#e53935",
  "#fb8c00",
  "#fdd835",
  "#43a047",
  "#1e88e5",
  "#8e24aa",
];
