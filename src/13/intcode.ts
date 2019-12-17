import { readlines, IntcodeIO, MemoryIntcodeIO } from "../utils/io";

function initializeWorkingMemory(input: string): number[] {
  return input.split(",").map(i => parseInt(i, 10));
}

function serializeMemory(memory: number[]): string {
  return memory.join(",");
}

function getParameterPtr(
  workingMemory: number[],
  relativeBase: number,
  parameterMode: number,
  parameter: number
): number {
  switch (parameterMode) {
    case 0:
      // position mode
      return workingMemory[parameter];
    case 1:
      // immediate mode
      return parameter;
    case 2:
      // relative mode
      return workingMemory[parameter] + relativeBase;
    default:
      throw Error(`Unknown parameterMode: ${parameterMode}`);
  }
}

function getParameterValue(
  workingMemory: number[],
  relativeBase: number,
  parameterMode: number,
  parameter: number
): number {
  const ptr = getParameterPtr(
    workingMemory,
    relativeBase,
    parameterMode,
    parameter
  );
  if (ptr > workingMemory.length) {
    return 0;
  }
  return workingMemory[ptr];
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
  let relativeBase = 0;
  let rawOp = workingMemory[ptr];
  let instr = parseInstruction(rawOp);
  while (instr.op != 99) {
    switch (instr.op) {
      case 1:
      case 2:
        {
          const v1 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );
          const v2 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.b,
            ptr + 2
          );
          const r = instr.op == 1 ? v1 + v2 : v1 * v2;
          const p3 = getParameterPtr(
            workingMemory,
            relativeBase,
            instr.a,
            ptr + 3
          );
          workingMemory[p3] = r;
          ptr += 4;
        }
        break;
      case 3:
        {
          const p1 = getParameterPtr(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );

          outIO.prompt("Opcode 3: reading input: ");
          const line = await inIO.read();
          if (line.length === 0) {
            throw new Error("Opcode 3 read 0 length data");
          }
          workingMemory[p1] = parseInt(line, 10);
          ptr += 2;
        }
        break;
      case 4:
        {
          const v1 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );
          outIO.prompt("Opcode 4: ");
          outIO.write(v1.toString());
          ptr += 2;
        }
        break;
      case 5:
      case 6:
        {
          const v1 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );
          const v2 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.b,
            ptr + 2
          );
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
          const v1 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );
          const v2 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.b,
            ptr + 2
          );
          const p3 = getParameterPtr(
            workingMemory,
            relativeBase,
            instr.a,
            ptr + 3
          );

          if ((instr.op === 7 && v1 < v2) || (instr.op === 8 && v1 === v2)) {
            workingMemory[p3] = 1;
          } else {
            workingMemory[p3] = 0;
          }
          ptr += 4;
        }
        break;
      case 9:
        {
          const v1 = getParameterValue(
            workingMemory,
            relativeBase,
            instr.c,
            ptr + 1
          );
          relativeBase += v1;
          ptr += 2;
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

export async function findMaxThruster(program: string): Promise<string> {
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

export async function findMaxFeedbackLoop(program: string): Promise<string> {
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

interface HullPosition {
  x: number;
  y: number;
}

type RobotDirection = "up" | "left" | "right" | "down";

type RobotState = "painting" | "moving";

export class HullPaintingRobotIntcodeIO extends IntcodeIO {
  hull: number[][];
  position: HullPosition;
  facing: RobotDirection;
  open: boolean;
  state: RobotState;
  paintedCount: number;

  constructor(
    {
      size,
      initialPosition
    }: { size: number; initialPosition: HullPosition } = {
      size: 1000,
      initialPosition: { x: 500, y: 500 }
    }
  ) {
    super();
    this.hull = new Array<number[]>(size);
    for (let x = 0; x < this.hull.length; x++) {
      this.hull[x] = new Array<number>(size);
      for (let y = 0; y < this.hull[x].length; y++) {
        // unpainted === -1
        this.hull[x][y] = -1;
      }
    }
    this.position = initialPosition;
    this.hull[this.position.x][this.position.y] = 1;
    this.facing = "up";
    this.open = true;
    this.state = "painting";
    this.paintedCount = 0;
  }

  async read(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.open) {
        reject("Closed for reading");
      }

      const xpos = this.hull[this.position.x];
      if (xpos === undefined) {
        return reject(`Cannot read from x: ${this.position.x}`);
      }
      const ypos = this.hull[this.position.x][this.position.y];
      if (ypos === undefined) {
        return reject(
          `Cannot read from x,: ${this.position.x},${this.position.y}`
        );
      }
      if (ypos === -1 || ypos === 0) {
        return resolve("0");
      } else {
        return resolve(ypos.toString());
      }
    });
  }

  async prompt(_line: string) {
    if (!this.open) {
      throw new Error("Closed for prompt");
    }
  }

  async write(line: string): Promise<void> {
    if (!this.open) {
      throw new Error("Closed for write");
    }
    return new Promise((_, reject) => {
      if (this.state === "painting") {
        if (-1 === this.hull[this.position.x][this.position.y]) {
          // first time painting this position
          this.paintedCount++;
        }
        if (line === "0") {
          // black
          this.hull[this.position.x][this.position.y] = 0;
        } else if (line === "1") {
          // white
          this.hull[this.position.x][this.position.y] = 1;
        } else {
          return reject(`Cannot handle painting input: '${line}'`);
        }
        this.state = "moving";
      } else {
        if (line === "0") {
          // left
          switch (this.facing) {
            case "up":
              this.facing = "left";
              break;
            case "left":
              this.facing = "down";
              break;
            case "down":
              this.facing = "right";
              break;
            case "right":
              this.facing = "up";
              break;
            default:
              reject(`Unknown facing: ${this.facing}`);
          }
        } else if (line === "1") {
          // right
          switch (this.facing) {
            case "up":
              this.facing = "right";
              break;
            case "left":
              this.facing = "up";
              break;
            case "down":
              this.facing = "left";
              break;
            case "right":
              this.facing = "down";
              break;
            default:
              reject(`Unknown facing: ${this.facing}`);
          }
        } else {
          reject(`Cannot handling turning input: '${line}'`);
        }
        switch (this.facing) {
          case "up":
            this.position = { x: this.position.x, y: this.position.y - 1 };
            break;
          case "down":
            this.position = { x: this.position.x, y: this.position.y + 1 };
            break;
          case "left":
            this.position = { x: this.position.x - 1, y: this.position.y };
            break;
          case "right":
            this.position = { x: this.position.x + 1, y: this.position.y };
            break;
        }
        this.state = "painting";
      }
    });
  }

  buffer(): string[] {
    const buf: string[] = [];
    for (let y = 0; y < this.hull[0].length; y++) {
      let line = "";
      for (let x = 0; x < this.hull.length; x++) {
        if (this.hull[x][y] === -1 || this.hull[x][y] === 0) {
          line += ".";
        } else {
          line += "#";
        }
      }
      buf.push(line);
    }
    return buf;
  }

  close() {
    this.open = false;
  }

  isOpen(): boolean {
    return this.open;
  }

  id(): string {
    return "hullRobot";
  }
}

enum ArcadeTile {
  Empty = 0,
  Wall = 1,
  Block = 2,
  HorizontalPaddle = 3,
  Ball = 4
}

enum ArcadeTileGlyph {
  Empty = ".",
  Wall = "#",
  Block = "+",
  HorizontalPaddle = "_",
  Ball = "*"
}

export class ArcadeIntcodeIO extends IntcodeIO {
  screen: ArcadeTile[][];
  state: "x" | "y" | "tile";
  coord_x: number;
  coord_y: number;
  open: boolean;
  score: number;
  paddle_x: number;
  ball_x: number;

  constructor(
    { size }: { size: number } = {
      size: 25
    }
  ) {
    super();
    this.screen = new Array<ArcadeTile[]>(size);
    for (let x = 0; x < this.screen.length; x++) {
      this.screen[x] = new Array<ArcadeTile>(size);
      for (let y = 0; y < this.screen[x].length; y++) {
        // empty === 0
        this.screen[x][y] = ArcadeTile.Empty;
      }
    }
    this.state = "x";
    this.open = true;
    this.score = 0;
  }

  async read(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.open) {
        return reject("Closed for read");
      }
      if (this.ball_x === this.paddle_x) {
        return resolve("0");
      } else if (this.ball_x > this.paddle_x) {
        return resolve("1");
      } else {
        return resolve("-1");
      }
    });
  }

  async prompt(_line: string) {
    if (!this.open) {
      throw new Error("Closed for prompt");
    }
  }

  async write(line: string): Promise<void> {
    if (!this.open) {
      throw new Error("Closed for write");
    }
    return new Promise((_, reject) => {
      switch (this.state) {
        case "x":
          this.coord_x = parseInt(line.trim(), 10);
          this.state = "y";
          break;
        case "y":
          this.coord_y = parseInt(line.trim(), 10);
          this.state = "tile";
          break;
        case "tile":
          const tile = parseInt(line.trim(), 10);
          if (this.coord_x === -1 && this.coord_y === 0) {
            this.score = tile;
          } else {
            if (tile === ArcadeTile.Ball) {
              this.ball_x = this.coord_x;
            } else if (tile === ArcadeTile.HorizontalPaddle) {
              this.paddle_x = this.coord_x;
            }
            this.screen[this.coord_x][this.coord_y] = tile;
          }
          this.state = "x";
          break;
        default:
          reject(`Unknown state: ${this.state}`);
      }
    });
  }

  buffer(): string[] {
    const buf: string[] = [];
    buf.push(`Score: ${this.score}`);
    for (let y = 0; y < this.screen[0].length; y++) {
      let line = "";
      for (let x = 0; x < this.screen.length; x++) {
        switch (this.screen[x][y]) {
          case ArcadeTile.Empty:
            line += ArcadeTileGlyph.Empty;
            break;
          case ArcadeTile.Ball:
            line += ArcadeTileGlyph.Ball;
            break;
          case ArcadeTile.Block:
            line += ArcadeTileGlyph.Block;
            break;
          case ArcadeTile.HorizontalPaddle:
            line += ArcadeTileGlyph.HorizontalPaddle;
            break;
          case ArcadeTile.Wall:
            line += ArcadeTileGlyph.Wall;
            break;
          default:
            throw new Error(`Unknown tile: ${this.screen[x][y]}`);
        }
      }
      const trimmedLine = line.replace(/\.+$/, "");
      if (trimmedLine.length > 0) {
        buf.push(trimmedLine);
      }
    }
    return buf;
  }

  close() {
    this.open = false;
  }

  isOpen(): boolean {
    return this.open;
  }

  id(): string {
    return "arcade";
  }
}

if (require.main === module) {
  // argv[0] is ts-node
  // argv[1] is this_file
  const arcade = new ArcadeIntcodeIO({ size: 40 });
  if (process.env.P1) {
    readlines(process.stdin)
      .then(lines => runProgram(lines[0], arcade, arcade))
      .then(_wm => {
        const screen = arcade.buffer().join("\n");
        let blockCount = 0;
        for (let i = 0; i < screen.length; i++) {
          if (screen[i] === ArcadeTileGlyph.Block) {
            blockCount++;
          }
        }
        process.stdout.write(screen);
        process.stdout.write("\n");
        console.log("blockCount", blockCount);
      })
      .catch(err => console.log("Error", err));
  } else {
    readlines(process.stdin)
      .then(lines => {
        const memory = initializeWorkingMemory(lines[0]);
        memory[0] = 2;
        return run(memory, arcade, arcade);
      })
      .then(_wm => {
        const screen = arcade.buffer().join("\n");
        process.stdout.write(screen);
        process.stdout.write("\n");
      })
      .catch(err => console.log("Error", err));
  }
}
