import { findMaxDetected, Slope, SlopeSet } from "./asteroid";

describe("asteroid", () => {
  it("slopes are equal", () => {
    const origin = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 2, y: 0 };
    const s1 = new Slope(p1.y - origin.y, p1.x - origin.x);
    const s2 = new Slope(p2.y - origin.y, p2.x - origin.x);
    expect(s1 === s2);
    const sSet = new SlopeSet();
    sSet.add(origin, p2);
    sSet.add(origin, p1);
    expect(sSet.size()).toEqual(1);
  });
  it("find max", () => {
    // let lines = [".#..#", ".....", "#####", "....#", "...##"];
    // let p = findMaxDetected(lines);
    // expect(p.maxPoint).toEqual({ point: { x: 3, y: 4 }, count: 8 });

    let lines = [
      "......#.#.",
      "#..#.#....",
      "..#######.",
      ".#.#.###..",
      ".#..#.....",
      "..#....#.#",
      "#..#....#.",
      ".##.#..###",
      "##...#..#.",
      ".#....####"
    ];
    let aMap = findMaxDetected(lines);
    expect(aMap.maxPoint).toEqual({ point: { x: 5, y: 8 }, count: 33 });

    lines = [
      "#.#...#.#.",
      ".###....#.",
      ".#....#...",
      "##.#.#.#.#",
      "....#.#.#.",
      ".##..###.#",
      "..#...##..",
      "..##....##",
      "......#...",
      ".####.###."
    ];
    aMap = findMaxDetected(lines);
    expect(aMap.maxPoint).toEqual({ point: { x: 1, y: 2 }, count: 35 });

    lines = [
      ".#..#..###",
      "####.###.#",
      "....###.#.",
      "..###.##.#",
      "##.##.#.#.",
      "....###..#",
      "..#.#..#.#",
      "#..#.#.###",
      ".##...##.#",
      ".....#.#.."
    ];
    aMap = findMaxDetected(lines);
    expect(aMap.maxPoint).toEqual({ point: { x: 6, y: 3 }, count: 41 });

    lines = [
      ".#..##.###...#######",
      "##.############..##.",
      ".#.######.########.#",
      ".###.#######.####.#.",
      "#####.##.#.##.###.##",
      "..#####..#.#########",
      "####################",
      "#.####....###.#.#.##",
      "##.#################",
      "#####.##.###..####..",
      "..######..##.#######",
      "####.##.####...##..#",
      ".#####..#.######.###",
      "##...#.##########...",
      "#.##########.#######",
      ".####.#.###.###.#.##",
      "....##.##.###..#####",
      ".#.#.###########.###",
      "#.#.#.#####.####.###",
      "###.##.####.##.#..##"
    ];
    aMap = findMaxDetected(lines);
    expect(aMap.maxPoint).toEqual({ point: { x: 11, y: 13 }, count: 210 });
  });
});
