import { MemoryWritable } from "../utils/io";
import { parseImage, pixelColor, printImage } from "./image";

describe("image", () => {
  it("should calc pixel color", () => {
    const image = parseImage("0222112222120000", 2, 2);
    expect(pixelColor(image, 0, 0)).toEqual("0");
    const mw = new MemoryWritable();
    printImage(image, mw);
    expect(mw.stringData()).toEqual([" *", "* "]);
  });
});
