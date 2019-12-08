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

export class MemoryPipe extends Duplex {
  lines: string[];

  constructor(options = {}) {
    super(options);
    this.lines = [];
  }

  isPipe() {
    return true;
  }

  _write(
    chunk: any,
    _encoding: string,
    cb?: (error: Error | null | undefined) => void | undefined
  ): boolean {
    this.lines.push(chunk.toString());
    if (cb) {
      cb(undefined);
    }
    return true;
  }

  _read(_size: number) {
    if (this.lines.length > 0) {
      this.push(this.lines.shift());
    } else {
      throw new Error("Pipe has no data to read");
    }
  }
}
