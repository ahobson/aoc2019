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

export function simulate(mmap: MoonMap, steps: number): MoonMap {
  for (let i = 0; i < steps; i++) {
    mmap = applyGravity(mmap);
    mmap = applyVelocity(mmap);
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

if (require.main === module) {
  readlines(process.stdin)
    .then(lines => scanMoons(lines))
    .then(mmap => simulate(mmap, 1000))
    .then(mmap => console.log(totalEnergy(mmap)));
}
