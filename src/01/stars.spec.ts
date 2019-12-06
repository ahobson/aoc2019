import { fuelForMass, fuelForMassAndFuel } from "./stars";
describe("stars", () => {
  it("should calculate fuel for mass", () => {
    expect(fuelForMass(12)).toEqual(2);
    expect(fuelForMass(14)).toEqual(2);
    expect(fuelForMass(1969)).toEqual(654);
    expect(fuelForMass(100756)).toEqual(33583);
  });

  it("should calculate fuel for mass and fuel", () => {
    expect(fuelForMassAndFuel(14)).toEqual(2);
    expect(fuelForMassAndFuel(1969)).toEqual(966);
    expect(fuelForMassAndFuel(100756)).toEqual(50346);
  });
});
