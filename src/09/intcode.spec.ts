import { MemoryIntcodeIO } from "../utils/io";
import { runProgram } from "./intcode";

describe("intcode", () => {
  it("should run program", async () => {
    let inIO = new MemoryIntcodeIO("in1");
    let outIO = new MemoryIntcodeIO("out1");
    let prog = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99";
    await runProgram(prog, inIO, outIO);
    expect(outIO.lineBuffer.join(",")).toStrictEqual(prog);

    inIO = new MemoryIntcodeIO("in1");
    outIO = new MemoryIntcodeIO("out1");
    await runProgram("1102,34915192,34915192,7,4,7,99,0", inIO, outIO);
    expect(outIO.lineBuffer[0].length).toEqual(16);

    inIO = new MemoryIntcodeIO("in1");
    outIO = new MemoryIntcodeIO("out1");
    prog = "104,1125899906842624,99";
    await runProgram(prog, inIO, outIO);
    expect(outIO.lineBuffer[0]).toEqual(prog.split(",")[1]);
  });
});
