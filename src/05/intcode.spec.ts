import { Readable, Writable } from "stream";
import { runProgram } from "./intcode";

class MemoryWritable extends Writable {
  pdata: string[];
  constructor(options = {}) {
    super(options);
    this.pdata = [];
  }
  _write(
    chunk: any,
    _encoding: string,
    cb?: (error: Error | null | undefined) => void | undefined
  ): boolean {
    this.pdata.push(chunk.toString());
    if (cb) {
      cb(undefined);
    }
    return true;
  }

  stringData(): string {
    return this.pdata.join("");
  }
}

describe("intcode", () => {
  it("should run program", async () => {
    let rin = new Readable();
    rin.push("1\n");
    rin.push(null); // eslint-disable-line

    let wout = new MemoryWritable();
    await runProgram("3,5,4,5,99,5", rin, wout);
    expect(wout.stringData()).toStrictEqual(
      "Opcode 3: reading input\nOpcode 4: 1\n"
    );

    wout = new MemoryWritable();
    await runProgram("1101,55,-1,0,4,0,99", rin, wout);
    expect(wout.stringData()).toStrictEqual("Opcode 4: 54\n");

    rin = new Readable();
    rin.push("8\n");
    rin.push(null);
    wout = new MemoryWritable();
    await runProgram("3,9,8,9,10,9,4,9,99,-1,8", rin, wout);
    expect(wout.stringData()).toStrictEqual(
      "Opcode 3: reading input\nOpcode 4: 1\n"
    );

    rin = new Readable();
    rin.push("8\n");
    rin.push(null);
    wout = new MemoryWritable();
    await runProgram("3,3,1107,-1,8,3,4,3,99", rin, wout);
    expect(wout.stringData()).toStrictEqual(
      "Opcode 3: reading input\nOpcode 4: 0\n"
    );

    rin = new Readable();
    rin.push("8\n");
    rin.push(null);
    wout = new MemoryWritable();
    await runProgram("3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9", rin, wout);
    expect(wout.stringData()).toStrictEqual(
      "Opcode 3: reading input\nOpcode 4: 1\n"
    );
  });
});
