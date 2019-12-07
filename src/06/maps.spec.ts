import { generateMap, checksumMap, findOrbitalTransfers } from "./maps";

describe("maps", () => {
  it("should generate and checksum", async () => {
    expect(checksumMap(generateMap(["COM)B"]))).toEqual(1);
    expect(checksumMap(generateMap(["COM)B", "B)C"]))).toEqual(3);
    const map = generateMap([
      "COM)B",
      "B)C",
      "C)D",
      "D)E",
      "E)F",
      "B)G",
      "G)H",
      "D)I",
      "E)J",
      "J)K",
      "K)L"
    ]);
    expect(checksumMap(map)).toEqual(42);
  });

  it("should generate and calc transfers", async () => {
    const map = generateMap([
      "COM)B",
      "K)YOU",
      "B)C",
      "C)D",
      "D)E",
      "E)F",
      "B)G",
      "G)H",
      "D)I",
      "E)J",
      "J)K",
      "K)L",
      "I)SAN"
    ]);
    expect(findOrbitalTransfers(map, "YOU", "SAN")).toEqual(4);
  });
});
