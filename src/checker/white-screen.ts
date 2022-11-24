import fs from 'fs';
import puppeteer from 'puppeteer';
import { wechat } from '../lib/wechat';
import { CaseConfig } from '../lib/rainbow';
import { md5 } from '../lib/utils';
import moment from 'moment';
import { createCanvas, loadImage } from 'canvas';
import { logger } from '../lib/logger';
// import { logger } from '../lib/logger';

// 图片类型
const IMG_TYPE = 'png';

// 图片保存路径
const SCREEN_PATH = '__screenshot';

function setScreeshotPath(url: string): Promise<string> {
  const now = new Date();
  const date = moment(now).format('YYYY-MM-DD');
  const time = moment(now).format('HH:mm:ss');
  const filename = `${time}-${encodeURIComponent(url.split('pages/')[1] || url)}`;
  const path = `${SCREEN_PATH}/${date}/`;

  return new Promise((resolve) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) resolve(filename);
      resolve(`${path}${filename}.${IMG_TYPE}`);
    });
  });
}

// 是否是白屏
const isWitheScreen = async (imageBuffer: Buffer) => {
  const image = await loadImage(imageBuffer);
  const { width, height } = image;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const pixelColorMap = new Map();

  // 绘制图片
  context.drawImage(image, 0, 0, width, height);

  // 获取图像的像素信息
  const { data } = context.getImageData(0, 0, width, height);

  // 获取所有的rgba的像素
  for (let i = 0;i < data.length / 4;i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const color = `${r.toString(16)}${g.toString(16)}${b.toString(16)}`;

    pixelColorMap.set(color, (pixelColorMap.get(color) || 0) + 1);
  }

  const pixelArray = Array.from(pixelColorMap);
  pixelArray.sort((a, b) => b[1] - a[1]);

  // 获取页面中相同颜色最多的像素
  const [color, number] = pixelArray[0];
  const percentage = number / (width * height);

  return {
    color,
    percentage,
  };
};

export const whiteScreenChecker = async (page: puppeteer.Page, config: CaseConfig) => {
  // 发送企业微信
  const imageBuffer = await page.screenshot({ fullPage: false, type: IMG_TYPE });
  const imageBase64 = imageBuffer.toString('base64');
  const { color, percentage } = await isWitheScreen(imageBuffer as Buffer);

  // 对页面出现最多的颜色和阈值进行比较
  const threshold = config.checker.whiteScreen?.threshold || 1;
  if (percentage < threshold) {
    logger.info('White Screen Percentage:', config.url, percentage);
    return;
  }

  await wechat({
    type: 'image',
    base64: imageBase64,
    md5: md5(imageBuffer),
  }).catch(() => null);

  await wechat({
    type: 'text',
    title: `${config.title} 疑是白屏`,
    description: `页面url: ${config.url}\n颜色#${color}占比%${(percentage * 100).toFixed(2)}, 超出阈值%${(threshold * 100).toFixed(2)}`,
  });
};
