import * as fs from "fs";
import * as readline from "readline";
import { once } from "events";
import { Readable } from "stream";

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
