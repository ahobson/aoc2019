import { scanMoons, simulate, totalEnergy, findAllCenters } from "./nbody";

describe("nbody", () => {
  it("scans", () => {
    const mmap = scanMoons(["<x=1, y=3, z=-11>\n", "<x=17, y=-10, z=-8>\n"]);
    expect(mmap).toStrictEqual({
      moons: [
        {
          position: {
            x: 1,
            y: 3,
            z: -11
          },
          velocity: {
            dx: 0,
            dy: 0,
            dz: 0
          }
        },
        {
          position: {
            x: 17,
            y: -10,
            z: -8
          },
          velocity: {
            dx: 0,
            dy: 0,
            dz: 0
          }
        }
      ]
    });
  });

  it("simulates", () => {
    let mmap = scanMoons([
      "<x=-1, y=0, z=2>",
      "<x=2, y=-10, z=-7>",
      "<x=4, y=-8, z=8>",
      "<x=3, y=5, z=-1>"
    ]);

    expect(simulate(mmap, 1)).toStrictEqual({
      moons: [
        {
          position: {
            x: 2,
            y: -1,
            z: 1
          },
          velocity: {
            dx: 3,
            dy: -1,
            dz: -1
          }
        },
        {
          position: {
            x: 3,
            y: -7,
            z: -4
          },
          velocity: {
            dx: 1,
            dy: 3,
            dz: 3
          }
        },
        {
          position: {
            x: 1,
            y: -7,
            z: 5
          },
          velocity: {
            dx: -3,
            dy: 1,
            dz: -3
          }
        },
        {
          position: {
            x: 2,
            y: 2,
            z: 0
          },
          velocity: {
            dx: -1,
            dy: -3,
            dz: 1
          }
        }
      ]
    });

    mmap = scanMoons([
      "<x=-1, y=0, z=2>",
      "<x=2, y=-10, z=-7>",
      "<x=4, y=-8, z=8>",
      "<x=3, y=5, z=-1>"
    ]);
    expect(simulate(mmap, 10)).toStrictEqual({
      moons: [
        {
          position: {
            x: 2,
            y: 1,
            z: -3
          },
          velocity: {
            dx: -3,
            dy: -2,
            dz: 1
          }
        },
        {
          position: {
            x: 1,
            y: -8,
            z: 0
          },
          velocity: {
            dx: -1,
            dy: 1,
            dz: 3
          }
        },
        {
          position: {
            x: 3,
            y: -6,
            z: 1
          },
          velocity: {
            dx: 3,
            dy: 2,
            dz: -3
          }
        },
        {
          position: {
            x: 2,
            y: 0,
            z: 4
          },
          velocity: {
            dx: 1,
            dy: -1,
            dz: -1
          }
        }
      ]
    });

    expect(totalEnergy(mmap)).toEqual(179);
  });

  it("finds center", () => {
    const mmap = scanMoons([
      "<x=-1, y=0, z=2>",
      "<x=2, y=-10, z=-7>",
      "<x=4, y=-8, z=8>",
      "<x=3, y=5, z=-1>"
    ]);
    const centers = findAllCenters(mmap);
    console.log("centers", centers);
  });
});
