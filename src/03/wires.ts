import { readlines } from "../utils/readlines";

type Coordinate = {
  x: number;
  y: number;
};

interface GridAndIntersections {
  grid: number[][];
  intersections: Coordinate[];
}

function initializeGrid(): GridAndIntersections {
  const grid = new Array<number[]>();

  return {
    grid: grid,
    intersections: new Array<Coordinate>()
  };
}

function setWirePath(
  gridAndIntersections: GridAndIntersections,
  coord: Coordinate,
  id: number
) {
  if (gridAndIntersections.grid[coord.x] === undefined) {
    gridAndIntersections.grid[coord.x] = new Array<number>();
  }

  if (
    gridAndIntersections.grid[coord.x][coord.y] &&
    gridAndIntersections.grid[coord.x][coord.y] !== id
  ) {
    gridAndIntersections.intersections.push(coord);
  }
  gridAndIntersections.grid[coord.x][coord.y] = id;
}

function traceWire(
  gridAndIntersections: GridAndIntersections,
  wirePath: string,
  id: number
) {
  let x = 0;
  let y = 0;
  wirePath.split(",").forEach(path => {
    const wireLength = parseInt(path.slice(1), 10);
    switch (path[0]) {
      case "U":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(gridAndIntersections, { x: x, y: ++y }, id);
        }
        break;
      case "D":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(gridAndIntersections, { x: x, y: --y }, id);
        }
        break;
      case "L":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(gridAndIntersections, { x: --x, y: y }, id);
        }
        break;
      case "R":
        for (let i = 0; i < wireLength; i++) {
          setWirePath(gridAndIntersections, { x: ++x, y: y }, id);
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
    .map(coord => Math.abs(coord.x) + Math.abs(coord.y))
    .sort()[0];
}

if (require.main === module) {
  readlines(process.stdin).then(wires => {
    console.log(findClosestIntersection(wires[0], wires[1]));
  });
}
