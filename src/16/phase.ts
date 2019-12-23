import { readlines } from "../utils/io";

export function phasePattern(pattern: number[], phaseNumber: number) {
  const basePattern = [0, 1, 0, -1];
  let newBasePattern = new Array<number>(basePattern.length * phaseNumber);
  let p = 0;
  for (let i = 0; i < basePattern.length; i++) {
    for (let j = 0; j < phaseNumber; j++) {
      newBasePattern[p] = basePattern[i];
      p++;
    }
  }
  let pi = 0;
  while (pi < pattern.length) {
    pattern[pi] = newBasePattern[pi % newBasePattern.length];
    pi++;
  }
}

export function runPhase(input: string, phaseCount: number): string {
  let output = input.split("");
  let pattern = new Array<number>(input.length + 1);
  for (let i = 0; i < phaseCount; i++) {
    for (let j = 0; j < output.length; j++) {
      phasePattern(pattern, j + 1);
      const nstr = output
        .map((s, n) => parseInt(s, 10) * pattern[n + 1])
        .reduce((acc, c) => acc + c)
        .toString();
      output[j] = nstr[nstr.length - 1];
    }
  }
  return output.join("");
}

if (require.main === module) {
  readlines(process.stdin)
    .then(lines => runPhase(lines[0], 100))
    .then(output => console.log("output", output.slice(0, 8)))
    .catch(err => console.log("Error", err));
}
