import {
  readlines,
  openFileStream,
  inputPrompt,
  buildReadable,
  MemoryWritable
} from "../utils/io";
import { Readable, Writable } from "stream";

function initializeWorkingMemory(input: string): number[] {
  return input.split(",").map(i => parseInt(i, 10));
}

function serializeMemory(memory: number[]): string {
  return memory.join(",");
}

function getParameterValue(
  workingMemory: number[],
  parameterMode: number,
  parameter: number
): number {
  switch (parameterMode) {
    case 0:
      // position mode
      const ptr = workingMemory[parameter];
      return workingMemory[ptr];
    case 1:
      // immediate mode
      return workingMemory[parameter];
    default:
      throw Error(`Unknown parameterMode: ${parameterMode}`);
  }
}

interface Instruction {
  a: number;
  b: number;
  c: number;
  op: number;
}

function parseInstruction(rawOp: number): Instruction {
  let instr = rawOp.toString().padStart(5, "0");
  return {
    a: parseInt(instr[0], 10),
    b: parseInt(instr[1], 10),
    c: parseInt(instr[2], 10),
    op: parseInt(instr.slice(3), 10)
  };
}

async function run(
  workingMemory: number[],
  inr: Readable,
  outw: Writable
): Promise<number[]> {
  let ptr = 0;
  let rawOp = workingMemory[ptr];
  let instr = parseInstruction(rawOp);
  while (instr.op != 99) {
    switch (instr.op) {
      case 1:
      case 2:
        {
          const v1 = getParameterValue(workingMemory, instr.c, ptr + 1);
          const v2 = getParameterValue(workingMemory, instr.b, ptr + 2);
          const r = instr.op == 1 ? v1 + v2 : v1 * v2;
          // parameters that are written are always position mode
          const p3 = workingMemory[ptr + 3];
          workingMemory[p3] = r;
          ptr += 4;
        }
        break;
      case 3:
        {
          // parameters that are written are always position mode
          const p1 = workingMemory[ptr + 1];
          const line = await inputPrompt(
            inr,
            outw,
            "Opcode 3: reading input\n"
          );
          workingMemory[p1] = parseInt(line.trim(), 10);
          ptr += 2;
        }
        break;
      case 4:
        {
          const v1 = getParameterValue(workingMemory, instr.c, ptr + 1);
          outw.write(`Opcode 4: ${v1}\n`);
          ptr += 2;
        }
        break;
      case 5:
      case 6:
        {
          const v1 = getParameterValue(workingMemory, instr.c, ptr + 1);
          const v2 = getParameterValue(workingMemory, instr.b, ptr + 2);
          if ((instr.op === 5 && v1 !== 0) || (instr.op === 6 && v1 === 0)) {
            ptr = v2;
          } else {
            ptr += 3;
          }
        }
        break;
      case 7:
      case 8:
        {
          const v1 = getParameterValue(workingMemory, instr.c, ptr + 1);
          const v2 = getParameterValue(workingMemory, instr.b, ptr + 2);
          const p3 = workingMemory[ptr + 3];
          // parameters that are written are always position mode
          if ((instr.op === 7 && v1 < v2) || (instr.op === 8 && v1 === v2)) {
            workingMemory[p3] = 1;
          } else {
            workingMemory[p3] = 0;
          }
          ptr += 4;
        }
        break;
      case 99:
        return workingMemory;
      default:
        throw Error(`Unknown op: ${instr.op}, rawOp: ${rawOp}, ptr: ${ptr}`);
    }
    rawOp = workingMemory[ptr];
    instr = parseInstruction(rawOp);
  }
  return workingMemory;
}

export async function runProgram(
  input: string,
  inr: Readable,
  outw: Writable
): Promise<string> {
  const memory = await run(initializeWorkingMemory(input), inr, outw);
  return serializeMemory(memory);
}

export async function runThruster(
  program: string,
  phaseSetting: string
): Promise<string> {
  return phaseSetting
    .split(",")
    .reduce(async (acc: Promise<string>, setting: string) => {
      const inputSignal = await acc;
      const rin = buildReadable(setting, inputSignal);
      const wout = new MemoryWritable();
      await runProgram(program, rin, wout);
      const outputPrefix = "Opcode 4: ";
      const outputStr = wout.stringData().find(s => s.startsWith(outputPrefix));
      if (outputStr === undefined) {
        throw new Error(
          `Cannot find outputPrefix '${outputPrefix}': ${wout.stringData()}`
        );
      }
      return Promise.resolve(outputStr.slice(outputPrefix.length));
    }, Promise.resolve("0"));
}

async function* phaseSettingGenerator() {
  const state = ["0", "1", "2", "3", "4"];
  // Heap's algorithm
  const c: number[] = [];
  for (let i = 0; i < state.length; i++) {
    c[i] = 0;
  }

  yield state.join(",");

  let i = 0;
  while (i < state.length) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        const tmp = state[0];
        state[0] = state[i];
        state[i] = tmp;
      } else {
        const tmp = state[c[i]];
        state[c[i]] = state[i];
        state[i] = tmp;
      }
      yield state.join(",");
      c[i] += 1;
      i = 0;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
}

async function findMaxThruster(program: string): Promise<string> {
  const phaseIterator = phaseSettingGenerator();
  let n = await phaseIterator.next();
  let maxThruster = 0;
  while (n && !n.done) {
    const phaseSetting: string = n.value;
    const thrustString = await runThruster(program, phaseSetting);
    const thrust = parseInt(thrustString, 10);
    if (thrust > maxThruster) {
      maxThruster = thrust;
    }
    n = await phaseIterator.next();
  }
  return maxThruster.toString();
}

if (require.main === module) {
  // argv[0] is ts-node
  // argv[1] is this_file
  readlines(openFileStream(process.argv[2]))
    .then(lines => {
      return findMaxThruster(lines[0]);
    })
    .then(maxThruster => {
      console.log("Max Thruster", maxThruster);
    })
    .catch(err => console.log("Error", err));
}
