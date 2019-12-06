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

if (require.main === module) {
  readlines(process.stdin).then(lines => {
    const map = generateMap(lines);
    console.log(checksumMap(map));
  });
}
