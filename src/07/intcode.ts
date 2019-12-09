import {
  readlines,
  openFileStream,
  IntcodeIO,
  MemoryIntcodeIO
} from "../utils/io";

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
  inIO: IntcodeIO,
  outIO: IntcodeIO
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
          outIO.prompt("Opcode 3: reading input: ");
          const line = await inIO.read();
          if (line.length === 0) {
            throw new Error("Opcode 3 read 0 length data");
          }
          workingMemory[p1] = parseInt(line.trim(), 10);
          ptr += 2;
        }
        break;
      case 4:
        {
          const v1 = getParameterValue(workingMemory, instr.c, ptr + 1);
          outIO.prompt("Opcode 4: ");
          outIO.write(v1.toString());
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
        inIO.close();
        outIO.close();
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
  inIO: IntcodeIO,
  outIO: IntcodeIO
): Promise<string> {
  const memory = await run(initializeWorkingMemory(input), inIO, outIO);
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
      const inIO = new MemoryIntcodeIO("thrusterIn");
      inIO.write(setting);
      inIO.write(inputSignal);
      const outIO = new MemoryIntcodeIO("thrusterOut");
      await runProgram(program, inIO, outIO);
      const line = outIO.buffer().pop();
      if (line) {
        return Promise.resolve(line);
      }
      throw new Error("Empty outIO buffer");
    }, Promise.resolve("0"));
}

async function* phaseSettingGenerator(initialState: string[]) {
  const state = Object.assign([], initialState);
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
  const phaseIterator = phaseSettingGenerator(["0", "1", "2", "3", "4"]);
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

export async function runFeedbackLoop(
  program: string,
  phaseSetting: string
): Promise<string> {
  const eaPipe = new MemoryIntcodeIO("ea");
  const abPipe = new MemoryIntcodeIO("ab");
  const bcPipe = new MemoryIntcodeIO("bc");
  const cdPipe = new MemoryIntcodeIO("cd");
  const dePipe = new MemoryIntcodeIO("de");

  const phases = phaseSetting.split(",");
  if (phases.length != 5) {
    throw new Error("wrong phase length");
  }
  const [ia, ib, ic, id, ie] = phases;

  abPipe.write(ia);
  bcPipe.write(ib);
  cdPipe.write(ic);
  dePipe.write(id);
  eaPipe.write(ie);
  abPipe.write("0");

  await Promise.all([
    runProgram(program, eaPipe, abPipe),
    runProgram(program, abPipe, bcPipe),
    runProgram(program, bcPipe, cdPipe),
    runProgram(program, cdPipe, dePipe),
    runProgram(program, dePipe, eaPipe)
  ]);
  const r = abPipe.buffer().pop();
  if (r === undefined) {
    throw new Error("Undefined last signal");
  }
  return r;
}

async function findMaxFeedbackLoop(program: string): Promise<string> {
  const phaseIterator = phaseSettingGenerator(["5", "6", "7", "8", "9"]);
  let n = await phaseIterator.next();
  let maxFeedback = 0;
  while (n && !n.done) {
    const phaseSetting: string = n.value;
    const thrustString = await runFeedbackLoop(program, phaseSetting);
    const thrust = parseInt(thrustString, 10);
    if (thrust > maxFeedback) {
      maxFeedback = thrust;
    }
    n = await phaseIterator.next();
  }
  return maxFeedback.toString();
}

if (require.main === module) {
  // argv[0] is ts-node
  // argv[1] is this_file
  readlines(openFileStream(process.argv[2]))
    .then(lines => {
      if (process.env.P1) {
        return findMaxThruster(lines[0]);
      } else {
        return findMaxFeedbackLoop(lines[0]);
      }
    })
    .then(maxThruster => {
      console.log("Max Thruster", maxThruster);
    })
    .catch(err => console.log("Error", err));
}
