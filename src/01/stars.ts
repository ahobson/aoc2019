import { once } from "events";
import * as fs from "fs";
import * as readline from "readline";

export function fuelForMass(mass: number) {
  return Math.floor(mass / 3) - 2;
}

function fuelForFuel(fuel: number): number {
  const f = fuelForMass(fuel);
  if (f <= 0) {
    return 0;
  }
  const r = f + fuelForFuel(f);
  return r;
}

export function fuelForMassAndFuel(mass: number) {
  const f = fuelForMass(mass);
  const fr = fuelForFuel(f);
  return f + fr;
}

async function fuelRequirements(
  filename: string,
  fuelFn: (arg0: number) => number
): Promise<number> {
  let sum = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filename),
    crlfDelay: Infinity
  });

  rl.on("line", (input: string) => {
    sum += fuelFn(parseInt(input.trim(), 10));
  });
  await once(rl, "close");

  return sum;
}

if (require.main === module) {
  // argv[0] is ts-node
  // argv[1] is this_file
  if (process.argv[2] == "partone") {
    fuelRequirements(process.argv[3], fuelForMass).then(fr => console.log(fr));
  } else {
    fuelRequirements(process.argv[3], fuelForMassAndFuel).then(fr =>
      console.log(fr)
    );
  }
}
