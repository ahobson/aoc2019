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
    const rin = new Readable();
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
  });
});
