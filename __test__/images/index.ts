import fs from "fs";
import path from "path";

// import path1  path.resolve(__dirname, "../test_image.jpg");

export const fieldImageFilepaths = ["./futsal1.jpg", "./futsal2.jpg", "./basket1.JPG"];
export const fieldImageBuffers = fieldImageFilepaths.map((filepath) => {
  return fs.readFileSync(path.resolve(__dirname, filepath));
});

export const playerFilepath = "./player1.png";
export const playerImageBuffer = fs.readFileSync(path.resolve(__dirname, playerFilepath));
