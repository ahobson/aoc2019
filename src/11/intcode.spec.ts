import { HullPaintingRobotIntcodeIO } from "./intcode";

describe("intcode", () => {
  it("should having painting robot", async () => {
    const robot = new HullPaintingRobotIntcodeIO({
      size: 5,
      initialPosition: { x: 2, y: 2 }
    });
    let d = await robot.read();
    expect(d).toEqual("0");

    robot.write("1");
    robot.write("0");

    robot.write("0");
    robot.write("0");

    robot.write("1");
    robot.write("0");

    robot.write("1");
    robot.write("0");

    d = await robot.read();
    expect(d).toEqual("1");

    robot.write("0");
    robot.write("1");

    robot.write("1");
    robot.write("0");

    robot.write("1");
    robot.write("0");

    expect(robot.buffer()).toEqual([
      ".....",
      "...#.",
      "...#.",
      ".##..",
      "....."
    ]);
    expect(robot.position).toEqual({ x: 2, y: 1 });
    expect(robot.paintedCount).toEqual(6);
  });
});
