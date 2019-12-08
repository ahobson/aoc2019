import * as fs from "fs";
import * as readline from "readline";
import { once } from "events";
import { Duplex, Readable, Writable } from "stream";

export async function readlines(inr: Readable): Promise<string[]> {
  const rl = readline.createInterface({
    input: inr,
    crlfDelay: Infinity
  });
  let lines: string[] = [];
  rl.on("line", (input: string) => {
    lines.push(input.trim());
  });
  await once(rl, "close");
  return lines;
}

export function openFileStream(filename: string): Readable {
  return fs.createReadStream(filename);
}

export async function readSingleLine(inr: Readable): Promise<string> {
  await once(inr, "readable");
  const input: Buffer = await inr.read();
  return input.toString("utf8").trim();
}

export function inputPrompt(
  inr: Readable,
  outw: Writable,
  prompt: string
): Promise<string> {
  if (inr === process.stdin) {
    const rl = readline.createInterface({
      input: inr,
      output: prompt === "" ? undefined : outw,
      crlfDelay: Infinity
    });
    return new Promise(resolve => {
      rl.question(prompt, answer => {
        return resolve(answer);
      });
    });
  }
  if (prompt.length > 0) {
    outw.write(prompt);
  }
  const line = inr.read();
  if (line === undefined || line === null || line.length === 0) {
    console.log("WARNING: Empty Read");
  }
  return line;
}

async function* generateLines(lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    yield lines[i] + "\n";
  }
}

export function buildReadable(...lines: string[]): Readable {
  return Readable.from(generateLines(lines), {
    objectMode: false,
    autoDestroy: true
  });
}

export class MemoryWritable extends Writable {
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

  stringData(): string[] {
    return this.pdata
      .join("")
      .trim()
      .split("\n");
  }
}

export type MemoryPipeMode = "tty" | "fake";

export class MemoryPipe extends Duplex {
  mode: string;
  fakeLines: string[];

  constructor({ mode = "fake" }: { mode?: string } = {}) {
    super({ objectMode: true, highWaterMark: 1 });
    this.mode = mode;
    if (this.mode === "fake") {
      this.fakeLines = [];
    }
  }

  addFakeLines(...data: string[]) {
    for (let i = 0; i < data.length; i++) {
      this.fakeLines.push(data[i] + "\n");
    }
  }

  _write(
    chunk: any,
    _encoding: string,
    cb?: (error: Error | null | undefined) => void | undefined
  ) {
    if (this.mode === "tty") {
      process.stdout.write(chunk);
    } else {
      this.fakeLines.push(chunk.toString());
    }
    if (cb) {
      cb(undefined);
    }
  }

  _read(_size: number) {
    if (this.mode === "tty") {
      this.push(process.stdin.read());
    } else {
      if (this.fakeLines.length > 0) {
        this.push(this.fakeLines.shift());
      } else {
        this.push(null);
      }
    }
  }
}

export abstract class IntcodeIO {
  abstract async read(): Promise<string>;
  abstract async prompt(line: string): Promise<void>;
  abstract async write(line: string): Promise<void>;
  abstract buffer(): string[];
}

export class MemoryIntcodeIO extends IntcodeIO {
  lineBuffer: string[];

  constructor() {
    super();
    this.lineBuffer = [];
  }

  async read(): Promise<string> {
    const line = this.lineBuffer.shift();
    if (line) {
      return line;
    }
    throw new Error("Empty input");
  }

  async prompt(_line: string) {
    // nothing
  }

  async write(line: string) {
    this.lineBuffer.push(line);
  }

  buffer(): string[] {
    return this.lineBuffer;
  }
}

export class StdIntcodeIO extends IntcodeIO {
  rl: readline.Interface;
  lastLine: string;

  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: undefined,
      crlfDelay: Infinity
    });
  }

  read(): Promise<string> {
    return new Promise(resolve => {
      this.rl.question("", answer => {
        this.lastLine = answer.trim();
        return resolve(this.lastLine);
      });
    });
  }

  async write(data: string): Promise<void> {
    this.lastLine = data.trim();
    process.stdout.write(this.lastLine);
  }

  async prompt(line: string): Promise<void> {
    process.stdout.write(line);
  }

  buffer(): string[] {
    if (this.lastLine) {
      return [this.lastLine];
    } else {
      return [];
    }
  }
}
