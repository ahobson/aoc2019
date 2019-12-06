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
