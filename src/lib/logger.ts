import fs from 'fs';
const output = fs.createWriteStream('./outPut.log.txt');
const errorOutput = fs.createWriteStream('./outPut.err.txt');

// 自定义的简单记录器
const logger = new console.Console({ stdout: output, stderr: errorOutput });

export {
  logger,
};
