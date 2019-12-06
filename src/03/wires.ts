import { readlines } from "../utils/readlines";

type Coordinate = {
  x: number;
  y: number;
};

type CoordinateSteps = {
  coord: Coordinate;
  totalStepCount: number;
};

type LineStepCount = {
  id: number;
  stepCount: number;
};

interface GridAndIntersections {
  grid: LineStepCount[][];
  intersections: CoordinateSteps[];
}

function initializeGrid(): GridAndIntersections {
  const grid = new Array<LineStepCount[]>();

  return {
    grid: grid,
    intersections: new Array<CoordinateSteps>()
  };
}

function setWirePath(
  gridAndIntersections: GridAndIntersections,
  coord: Coordinate,
  lineStepCount: LineStepCount
) {
  if (gridAndIntersections.grid[coord.x] === undefined) {
    gridAndIntersections.grid[coord.x] = new Array<LineStepCount>();
  }

  const cell = gridAndIntersections.grid[coord.x][coord.y];

  if (cell && cell.id !== lineStepCount.id) {
    gridAndIntersections.intersections.push({
      coord: coord,
      totalStepCount: cell.stepCount + lineStepCount.stepCount
    });
  }
  gridAndIntersections.grid[coord.x][coord.y] = lineStepCount;
}

function traceWire(
  gridAndIntersections: GridAndIntersections,
  wirePath: string,
  id: number
) {
  let x = 0;
  let y = 0;
  let stepCount = 0;
  wirePath.split(",").forEach(path => {
    const wireLength = parseInt(path.slice(1), 10);
    switch (path[0]) {
      case "U":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(
            gridAndIntersections,
            { x: x, y: ++y },
            { id: id, stepCount: ++stepCount }
          );
        }
        break;
      case "D":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(
            gridAndIntersections,
            { x: x, y: --y },
            { id: id, stepCount: ++stepCount }
          );
        }
        break;
      case "L":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(
            gridAndIntersections,
            { x: --x, y: y },
            { id: id, stepCount: ++stepCount }
          );
        }
        break;
      case "R":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(
            gridAndIntersections,
            { x: ++x, y: y },
            { id: id, stepCount: ++stepCount }
          );
        }
        break;
      default:
        throw new Error(`Unknown direction: ${path[0]}`);
    }
  });
}

export function findClosestIntersection(
  wireOnePath: string,
  wireTwoPath: string
): number {
  let grid = initializeGrid();
  traceWire(grid, wireOnePath, 1);
  traceWire(grid, wireTwoPath, 2);
  return grid.intersections
    .map(
      coordStepCount =>
        Math.abs(coordStepCount.coord.x) + Math.abs(coordStepCount.coord.y)
    )
    .sort()[0];
}

export function findFewestStepsIntersection(
  wireOnePath: string,
  wireTwoPath: string
): number {
  let grid = initializeGrid();
  traceWire(grid, wireOnePath, 1);
  traceWire(grid, wireTwoPath, 2);
  return grid.intersections
    .map(coordStepCount => coordStepCount.totalStepCount)
    .sort((a, b) => a - b)[0];
}

if (require.main === module) {
  readlines(process.stdin).then(wires => {
    if (process.env.P1) {
      console.log(findClosestIntersection(wires[0], wires[1]));
    } else {
      console.log(findFewestStepsIntersection(wires[0], wires[1]));
    }
  });
}
