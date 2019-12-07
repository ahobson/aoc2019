import { readlines } from "../utils/io";

type OrbitMapInfo = {
  depth: number;
  moons: string[];
  parent?: string;
};

interface OrbitMap {
  [key: string]: OrbitMapInfo;
}

export function generateMap(input: string[]): OrbitMap {
  const orbitMap: OrbitMap = {};
  input.forEach(line => {
    const [planet, moon] = line.trim().split(")", 2);
    if (planet in orbitMap) {
      orbitMap[planet].moons.push(moon);
    } else {
      orbitMap[planet] = { depth: -1, moons: [moon] };
    }
    if (moon in orbitMap) {
      orbitMap[moon].parent = planet;
    } else {
      orbitMap[moon] = { depth: -1, moons: [], parent: planet };
    }
  });
  orbitMap["COM"].depth = 0;

  const stack: string[] = [];
  orbitMap["COM"].moons.forEach(moon => stack.push(moon));

  while (stack.length > 0) {
    const planet = stack.pop();
    // console.log("moon planet", planet);
    // console.log("orbitMap", orbitMap);
    if (planet === undefined) {
      throw Error("planet is undefined");
    }
    const parent = orbitMap[planet].parent;
    if (parent) {
      orbitMap[planet].depth = orbitMap[parent].depth + 1;
      orbitMap[planet].moons.forEach(moon => stack.push(moon));
    } else {
      throw Error(`planet missing parent: ${planet}`);
    }
  }

  return orbitMap;
}

export function checksumMap(orbitMap: OrbitMap) {
  let totalCount = 0;
  Object.keys(orbitMap).forEach(planet => {
    totalCount += orbitMap[planet].depth;
  });
  return totalCount;
}

export function findOrbitalTransfers(
  orbitMap: OrbitMap,
  planetOne: string,
  planetTwo: string
): number {
  let oPlanet: string | undefined = planetOne;
  let oPath: string[] = [];
  let tPlanet: string | undefined = planetTwo;
  let tPath: string[] = [];
  while (orbitMap[oPlanet].depth !== orbitMap[tPlanet].depth) {
    if (orbitMap[oPlanet].depth < orbitMap[tPlanet].depth) {
      tPlanet = orbitMap[tPlanet].parent;
      if (tPlanet === undefined) {
        throw Error("undefined tPlanet");
      }
      tPath.push(tPlanet);
    } else {
      oPlanet = orbitMap[oPlanet].parent;
      if (oPlanet === undefined) {
        throw Error("undefined oPlanet");
      }
      oPath.push(oPlanet);
    }
  }

  while (oPlanet !== tPlanet) {
    tPlanet = orbitMap[tPlanet].parent;
    if (tPlanet === undefined) {
      throw Error("undefined tPlanet");
    }
    tPath.push(tPlanet);
    oPlanet = orbitMap[oPlanet].parent;
    if (oPlanet === undefined) {
      throw Error("undefined oPlanet");
    }
    oPath.push(oPlanet);
  }
  // -1 tPath YOU is already around planet
  // -1 oPath SAN is already around planet
  return tPath.length + oPath.length - 2;
}

if (require.main === module) {
  readlines(process.stdin).then(lines => {
    const map = generateMap(lines);
    if (process.env.P1) {
      console.log(checksumMap(map));
    } else {
      console.log(findOrbitalTransfers(map, "YOU", "SAN"));
    }
  });
}
