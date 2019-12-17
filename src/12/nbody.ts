import { readlines } from "../utils/io";

interface MoonPosition {
  x: number;
  y: number;
  z: number;
}

interface MoonVelocity {
  dx: number;
  dy: number;
  dz: number;
}

interface Moon {
  position: MoonPosition;
  velocity: MoonVelocity;
}

interface MoonMap {
  moons: Moon[];
}

export function scanMoons(dataLines: string[]): MoonMap {
  const moons = dataLines.map(line => {
    const m = line.trim().match(/^<x=(-?\d+),\s+y=(-?\d+),\s+z=(-?\d+)>$/);
    if (!m) {
      throw new Error(`Cannot parse line: ${line}`);
    }
    return {
      position: {
        x: parseInt(m[1], 10),
        y: parseInt(m[2], 10),
        z: parseInt(m[3], 10)
      },
      velocity: {
        dx: 0,
        dy: 0,
        dz: 0
      }
    };
  });
  return {
    moons: moons
  };
}

function applyGravity(mmap: MoonMap): MoonMap {
  for (let i = 0; i < mmap.moons.length; i++) {
    for (let j = 0; j < mmap.moons.length; j++) {
      if (j != i && j > i) {
        const m1 = mmap.moons[i];
        const m2 = mmap.moons[j];
        if (m1.position.x > m2.position.x) {
          m2.velocity.dx += 1;
          m1.velocity.dx -= 1;
        } else if (m2.position.x > m1.position.x) {
          m1.velocity.dx += 1;
          m2.velocity.dx -= 1;
        }

        if (m1.position.y > m2.position.y) {
          m2.velocity.dy += 1;
          m1.velocity.dy -= 1;
        } else if (m2.position.y > m1.position.y) {
          m1.velocity.dy += 1;
          m2.velocity.dy -= 1;
        }

        if (m1.position.z > m2.position.z) {
          m2.velocity.dz += 1;
          m1.velocity.dz -= 1;
        } else if (m2.position.z > m1.position.z) {
          m1.velocity.dz += 1;
          m2.velocity.dz -= 1;
        }
      }
    }
  }
  return mmap;
}

function applyVelocity(mmap: MoonMap): MoonMap {
  for (let i = 0; i < mmap.moons.length; i++) {
    mmap.moons[i].position.x += mmap.moons[i].velocity.dx;
    mmap.moons[i].position.y += mmap.moons[i].velocity.dy;
    mmap.moons[i].position.z += mmap.moons[i].velocity.dz;
  }

  return mmap;
}

export function nextStep(mmap: MoonMap): MoonMap {
  return applyVelocity(applyGravity(mmap));
}

export function simulate(mmap: MoonMap, steps: number): MoonMap {
  for (let i = 0; i < steps; i++) {
    mmap = nextStep(mmap);
  }
  return mmap;
}

export function totalEnergy(mmap: MoonMap): number {
  return mmap.moons
    .map(
      moon =>
        (Math.abs(moon.position.x) +
          Math.abs(moon.position.y) +
          Math.abs(moon.position.z)) *
        (Math.abs(moon.velocity.dx) +
          Math.abs(moon.velocity.dy) +
          Math.abs(moon.velocity.dz))
    )
    .reduce((acc, cur) => acc + cur);
}

export function moonToString(moon: Moon): string {
  return (
    `(${moon.position.x},${moon.position.y},${moon.position.z})` +
    `->(${moon.velocity.dx},${moon.velocity.dy},${moon.velocity.dz})`
  );
}

// function moonMapToString(mmap: MoonMap): string {
//   return mmap.moons.map(moon => moonToString(moon)).join("/");
// }

interface MoonHistory {
  [key: string]: number;
}

export function findPreviousState(mmap: MoonMap): number {
  let pmaps: MoonHistory[] = new Array<MoonHistory>(mmap.moons.length);
  for (let mi = 0; mi < mmap.moons.length; mi++) {
    pmaps[mi] = {};
  }
  let cmap = JSON.parse(JSON.stringify(mmap));
  for (let i = 0; i < 50000000; i++) {
    for (let mi = 1; mi < 2; mi++) {
      const k = moonToString(cmap.moons[mi]);
      if (pmaps[mi][k] !== undefined) {
        const period = i - pmaps[mi][k];
        console.log(`moon ${mi} period ${period} step ${i}`);
      }
      pmaps[mi][k] = i;
    }
    cmap = nextStep(cmap);
  }
  return -1;
}

if (require.main === module) {
  if (process.env.P1) {
    readlines(process.stdin)
      .then(lines => scanMoons(lines))
      .then(mmap => simulate(mmap, 1000))
      .then(mmap => console.log(totalEnergy(mmap)));
  } else {
    readlines(process.stdin)
      .then(lines => scanMoons(lines))
      .then(mmap => console.log(findPreviousState(mmap)));
  }
}
