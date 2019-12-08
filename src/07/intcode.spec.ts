import { MemoryIntcodeIO } from "../utils/io";
import { runProgram, runThruster } from "./intcode";

describe("intcode", () => {
  it("should run program", async () => {
    let inIO = new MemoryIntcodeIO();
    inIO.write("3");
    inIO.write("0");

    let outIO = new MemoryIntcodeIO();
    await runProgram(
      "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0",
      inIO,
      outIO
    );
    expect(outIO.buffer()).toStrictEqual(["3"]);
  });

  it("should run thruster", async () => {
    let t = await runThruster(
      "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0",
      "4,3,2,1,0"
    );
    expect(t).toEqual("43210");

    t = await runThruster(
      "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0",
      "0,1,2,3,4"
    );
    expect(t).toEqual("54321");

    t = await runThruster(
      "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31," +
        "31,1,32,31,31,4,31,99,0,0,0",
      "1,0,4,3,2"
    );
    expect(t).toEqual("65210");
  });
});
