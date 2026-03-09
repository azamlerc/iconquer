import type { ContinentDefinition, CountryDefinition, MapDefinition } from "../../types/game";

interface CountriesRaw {
  [key: string]: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    dotOffsetX?: number;
    dotOffsetY?: number;
    neighbors: string[];
  };
}

interface ContinentsRaw {
  [key: string]: {
    armies: number;
    countries: string[];
  };
}

export async function loadWorldMap(): Promise<MapDefinition> {
  const [countriesRes, continentsRes] = await Promise.all([
    fetch("/maps/iconquer-world/Countries.json"),
    fetch("/maps/iconquer-world/Continents.json"),
  ]);

  const countriesRaw = (await countriesRes.json()) as CountriesRaw;
  const continentsRaw = (await continentsRes.json()) as ContinentsRaw;

  const countries: Record<string, CountryDefinition> = {};
  for (const [name, value] of Object.entries(countriesRaw)) {
    countries[name] = {
      id: name,
      x: value.x,
      y: value.y,
      width: value.width,
      height: value.height,
      dotOffsetX: value.dotOffsetX,
      dotOffsetY: value.dotOffsetY,
      neighbors: value.neighbors,
    };
  }

  const continents: Record<string, ContinentDefinition> = {};
  for (const [name, value] of Object.entries(continentsRaw)) {
    continents[name] = {
      id: name,
      armies: value.armies,
      countries: value.countries,
    };
  }

  return {
    id: "com.kavasoft.iConquer.maps.world.hd",
    name: "iConquer World",
    background: "/maps/iconquer-world/Background.jpg",
    baseWidth: 1820,
    baseHeight: 950,
    countries,
    continents,
  };
}
