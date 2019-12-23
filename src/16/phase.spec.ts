import { phasePattern, runPhase } from "./phase";

describe("phase", () => {
  it("phase pattern", () => {
    const pp = new Array<number>(10);
    phasePattern(pp, 1);
    expect(pp).toStrictEqual([0, 1, 0, -1, 0, 1, 0, -1, 0, 1]);
    phasePattern(pp, 2);
    expect(pp).toStrictEqual([0, 0, 1, 1, 0, 0, -1, -1, 0, 0]);
    phasePattern(pp, 3);
    expect(pp).toStrictEqual([0, 0, 0, 1, 1, 1, 0, 0, 0, -1]);
  });
  it("run phase", () => {
    expect(runPhase("12345678", 1)).toEqual("48226158");
    expect(runPhase("12345678", 2)).toEqual("34040438");
    expect(runPhase("12345678", 3)).toEqual("03415518");
    expect(runPhase("12345678", 4)).toEqual("01029498");

    expect(
      runPhase("80871224585914546619083218645595", 100).slice(0, 8)
    ).toEqual("24176176");
    expect(
      runPhase("19617804207202209144916044189917", 100).slice(0, 8)
    ).toEqual("73745418");
    expect(
      runPhase("69317163492948606335995924319873", 100).slice(0, 8)
    ).toEqual("52432133");
  });
});
