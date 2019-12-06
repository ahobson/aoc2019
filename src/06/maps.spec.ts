import { generateMap, checksumMap } from "./maps";

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
});
