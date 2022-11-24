import fs from 'fs';
import { SCREEN_PATH } from '../config/constant';

/**
 * 删除目录和文件
 * @param {} path
 */
export function deleteAll(path: string) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) {
        deleteAll(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

/**
   * 删除非本月的目录
   * @param {} screenDir
   */
export function cleanFile(screenDir: string = SCREEN_PATH) {
  const yDirs = fs.readdirSync(screenDir);
  yDirs.forEach((yDir) => {
    const yDirPath = `${screenDir}/${yDir}`;
    if (`${(new Date()).getFullYear()}` !== yDir) {
      deleteAll(yDirPath);
      return;
    }

    const mDirs = fs.readdirSync(yDirPath);
    mDirs.forEach((mdir) => {
      const mDirPath = `${yDirPath}/${mdir}`;
      if (`${(new Date()).getMonth() + 1}` !== mdir) {
        deleteAll(mDirPath);
      }
    });
  });
}

