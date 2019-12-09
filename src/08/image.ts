import { readlines } from "../utils/io";
import { Writable } from "stream";

type Layer = string;
type Image = {
  width: number;
  height: number;
  layers: Layer[];
};

export function parseImage(line: string, width: number, height: number): Image {
  const layers: Layer[] = [];

  let p = 0;
  let data = line.slice(p, p + width * height);
  while (data && data.length > 0) {
    layers.push(data);
    data = line.slice(p, p + width * height);
    p += data.length;
  }

  return {
    width: width,
    height: height,
    layers: layers
  };
}

function charCount(layer: Layer, c: string) {
  let cnt = 0;
  for (let i = 0; i < layer.length; i++) {
    if (layer[i] === c) {
      cnt++;
    }
  }
  return cnt;
}

export function pixelColor(image: Image, x: number, y: number): string {
  for (let i = 0; i < image.layers.length; i++) {
    const layer = image.layers[i];
    const color = layer[x + image.width * y];
    if ("2" != color) {
      return color;
    }
  }
  return "0";
}

export function printImage(image: Image, outw: Writable) {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if ("0" == pixelColor(image, x, y)) {
        outw.write(" ");
      } else {
        outw.write("*");
      }
    }
    outw.write("\n");
  }
}

export function checksumImage(image: Image): number {
  let minZero = image.layers[0].length;
  let minZeroIndex = 0;
  for (let i = 0; i < image.layers.length; i++) {
    const zc = charCount(image.layers[i], "0");
    if (zc < minZero) {
      minZero = zc;
      minZeroIndex = i;
    }
  }
  return (
    charCount(image.layers[minZeroIndex], "1") *
    charCount(image.layers[minZeroIndex], "2")
  );
}

if (require.main === module) {
  readlines(process.stdin).then(lines => {
    const image = parseImage(lines[0], 25, 6);
    if (process.env.P1) {
      console.log(checksumImage(image));
    } else {
      printImage(image, process.stdout);
    }
  });
}
