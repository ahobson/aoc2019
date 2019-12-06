import * as readline from "readline";

function initializeWorkingMemory(input: string): number[] {
  return input.split(",").map(i => parseInt(i, 10));
}

function serializeMemory(memory: number[]): string {
  return memory.join(",");
}

function findOutput(input: string, desiredOutput: number): number {
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      const workingMemory = initializeWorkingMemory(input);
      workingMemory[1] = noun;
      workingMemory[2] = verb;
      const fMem = run(workingMemory);
      if (fMem.length == 0) {
        return -1;
      }
      if (fMem[0] === desiredOutput) {
        console.log("noun", noun, "verb", verb);
        return 100 * noun + verb;
      }
    }
  }
  return -1;
}

function run(workingMemory: number[]): number[] {
  let ptr = 0;
  let op = workingMemory[ptr];
  while (op != 99) {
    switch (op) {
      case 1:
      case 2:
        const ptr1 = workingMemory[ptr + 1];
        const ptr2 = workingMemory[ptr + 2];
        const v1 = workingMemory[ptr1];
        const v2 = workingMemory[ptr2];
        const r = op == 1 ? v1 + v2 : v1 * v2;
        const p3 = workingMemory[ptr + 3];
        workingMemory[p3] = r;
        ptr += 4;
        op = workingMemory[ptr];
        break;
      case 99:
        break;
      default:
        console.log("error");
        return [];
    }
  }
  return workingMemory;
}

export function runProgram(input: string): string {
  return serializeMemory(run(initializeWorkingMemory(input)));
}

if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });
  if (process.env.P1) {
    rl.on("line", (input: string) => {
      console.log(runProgram(input));
    });
  } else {
    rl.on("line", (input: string) => {
      console.log(findOutput(input, 19690720));
    });
  }
}
