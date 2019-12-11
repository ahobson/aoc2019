import { readlines } from "../utils/io";

export class Slope {
  rise: number;
  run: number;

  static parse(s: string): Slope {
    const [rise, run] = s.split("/", 2).map(x => parseInt(x, 10));
    return new Slope(rise, run);
  }

  constructor(rise: number, run: number) {
    this.rise = rise;
    this.run = run;
  }

  toString(): string {
    return `${this.rise}/${this.run}`;
  }

  equals(other: Slope): boolean {
    if (
      this.rise === 0 &&
      other.rise === 0 &&
      Math.sign(this.run) === Math.sign(other.run)
    ) {
      return true;
    }
    if (
      this.run === 0 &&
      other.run === 0 &&
      Math.sign(this.rise) === Math.sign(other.rise)
    ) {
      return true;
    }

    // https://rob.conery.io/2018/08/21/mod-and-remainder-are-not-the-same/
    if (Math.sign(this.rise) != Math.sign(other.rise)) {
      return false;
    }
    if (Math.sign(this.run) != Math.sign(other.run)) {
      return false;
    }
    return this.rise * other.run === this.run * other.rise;
  }
}

interface MapPoint {
  x: number;
  y: number;
}

interface SlopeAndPoint {
  slope: Slope;
  point: MapPoint;
}

export class SlopeSet {
  slopes: SlopeAndPoint[];
  dupeSlopes: SlopeAndPoint[];

  constructor() {
    this.slopes = new Array<SlopeAndPoint>();
    this.dupeSlopes = new Array<SlopeAndPoint>();
  }

  add(origin: MapPoint, other: MapPoint) {
    const rise = other.y - origin.y;
    const run = other.x - origin.x;
    const newSlope = new Slope(rise, run);
    const i = this.slopes.findIndex(s => s.slope.equals(newSlope));
    if (i >= 0) {
      const cSlopeAndPoint = this.slopes[i];
      const cDistance =
        Math.abs(cSlopeAndPoint.slope.rise) +
        Math.abs(cSlopeAndPoint.slope.run);
      const newDistance = Math.abs(rise) + Math.abs(run);
      if (newDistance < cDistance) {
        this.slopes[i] = { slope: newSlope, point: other };
        this.dupeSlopes.push(cSlopeAndPoint);
      } else {
        this.dupeSlopes.push({ slope: newSlope, point: other });
      }
      return;
    }
    this.slopes.push({ slope: newSlope, point: other });
  }

  size() {
    return this.slopes.length;
  }

  toObject() {
    return {
      slopeCount: this.slopes.length,
      dupeSlopeCount: this.dupeSlopes.length,
      slopes: this.slopes.map(s => JSON.stringify(s)),
      dupeSlopes: this.dupeSlopes.map(s => JSON.stringify(s))
    };
  }
}

interface MapDataPoint {
  point: MapPoint;
  isAsteroid: boolean;
  s: string;
  asteroidsOnSlope: SlopeSet;
}

interface PointAndCount {
  point: MapPoint;
  count: number;
}

class AsteroidMap {
  data: MapDataPoint[][];
  width: number;
  height: number;
  maxPoint: PointAndCount;

  constructor(lines: string[]) {
    this.width = lines[0].length;
    this.height = lines.length;
    this.maxPoint = { point: { x: 0, y: 0 }, count: 0 };
    this.data = new Array<MapDataPoint[]>();

    for (let y = 0; y < this.height; y++) {
      if (lines[y].length > 0) {
        for (let x = 0; x < this.width; x++) {
          if (!this.data[x]) {
            this.data[x] = new Array<MapDataPoint>();
          }
          this.data[x][y] = {
            point: { x: x, y: y },
            isAsteroid: lines[y][x] === "#",
            s: lines[y][x],
            asteroidsOnSlope: new SlopeSet()
          };
        }
      }
    }
  }
}

export function findMaxDetected(lines: string[]): AsteroidMap {
  const aMap = new AsteroidMap(lines);

  for (let x = 0; x < aMap.width; x++) {
    for (let y = 0; y < aMap.height; y++) {
      const origin = aMap.data[x][y];
      if (origin.isAsteroid) {
        for (let i = 0; i < aMap.width; i++) {
          for (let j = 0; j < aMap.height; j++) {
            const other = aMap.data[i][j];
            if (other.isAsteroid && origin.point != other.point) {
              origin.asteroidsOnSlope.add(origin.point, other.point);
            }
          }
        }
      }
    }
  }

  for (let x = 0; x < aMap.width; x++) {
    for (let y = 0; y < aMap.height; y++) {
      const p = aMap.data[x][y];
      const pCount = p.asteroidsOnSlope.size();
      if (pCount > aMap.maxPoint.count) {
        aMap.maxPoint = { point: p.point, count: pCount };
      }
    }
  }

  return aMap;
}

interface CartesianAndTheta {
  point: MapPoint;
  theta: number;
}

function calculateCustomTheta(x: number, y: number): number {
  // * convert cartesian to polar coordinates
  // * Math.atan returns radians, convert to degrees for easier
  //   debugging
  let t = (Math.atan(y / x) * 180) / Math.PI;
  if (x >= 0 && y >= 0) {
    // quadrant 1
    return t;
  } else if (x < 0 && y >= 0) {
    // quadrant 2
    return t + 180;
  } else if (x < 0 && y < 0) {
    // quadrant 3
    return t + 180;
  } else if (x >= 0 && y < 0) {
    // quadrant 4
    return t;
  } else {
    throw new Error(`Unknown quadrant: ${x}, ${y}`);
  }
}

export function findNthDestroyed(
  aMap: AsteroidMap,
  n: number
): CartesianAndTheta {
  const maxPointData = aMap.data[aMap.maxPoint.point.x][aMap.maxPoint.point.y];
  if (maxPointData === undefined) {
    throw new Error("undefined max point data");
  }
  const slopes = maxPointData.asteroidsOnSlope.slopes;
  if (slopes.length < n) {
    throw new Error(`slopes are length ${slopes.length}, but n is ${n}`);
  }
  const points: CartesianAndTheta[] = slopes
    .map(snp => {
      return {
        point: {
          x: snp.point.x,
          y: snp.point.y
        },
        theta: calculateCustomTheta(snp.slope.run, snp.slope.rise)
      };
    })
    .sort((a, b) => a.theta - b.theta);

  // for (let i = 0; i < points.length; i++) {
  //   const p = points[i].point;
  //   aMap.data[p.x][p.y].s = String.fromCharCode(65 + i);
  // }
  // aMap.data[maxPointData.point.x][maxPointData.point.y].s = "*";

  // for (let j = 0; j < aMap.height; j++) {
  //   for (let i = 0; i < aMap.width; i++) {
  //     process.stdout.write(aMap.data[i][j].s);
  //   }
  //   process.stdout.write("\n");
  // }

  // console.log("points", points);
  return points[n - 1];
}

if (require.main === module) {
  // argv[0] is ts-node
  // argv[1] is this_file
  if (process.env.P1) {
    readlines(process.stdin)
      .then(lines => findMaxDetected(lines.map(l => l.trim())))
      .then(m => console.log(m.maxPoint));
  } else {
    readlines(process.stdin)
      .then(lines => findMaxDetected(lines.map(l => l.trim())))
      .then(aMap => {
        console.log(aMap.maxPoint);
        return findNthDestroyed(aMap, 200);
      })
      .then(n => console.log(n))
      .catch(e => console.log(e));
  }
}
