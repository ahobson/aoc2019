import { readlines } from "../utils/readlines";

export function hasAdjacentDigits(input: string): boolean {
  for (let i = 0; i < input.length - 1; i++) {
    if (input[i] == input[i + 1]) {
      return true;
    }
  }
  return false;
}

export function hasMonotonicallyIncreasingDigits(input: string): boolean {
  for (let i = 0; i < input.length - 1; i++) {
    if (input[i] > input[i + 1]) {
      return false;
    }
  }

  return true;
}

export function isMatchingPassword(input: string): boolean {
  return (
    input.length == 6 &&
    hasAdjacentDigits(input) &&
    hasMonotonicallyIncreasingDigits(input)
  );
}

export function countMatchingPasswords(
  startRange: number,
  endRange: number
): number {
  let matchCount = 0;
  for (let pw = startRange; pw <= endRange; pw++) {
    if (isMatchingPassword(pw.toString())) {
      matchCount++;
    }
  }
  return matchCount;
}

if (require.main === module) {
  readlines(process.stdin).then(lines => {
    const [startRange, endRange] = lines[0]
      .split("-", 2)
      .map(r => parseInt(r, 10));
    console.log(countMatchingPasswords(startRange, endRange));
  });
}
