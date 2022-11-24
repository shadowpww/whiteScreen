import puppeteer from 'puppeteer';
import { sendImageAndText } from '../lib/wechat';
import { CaseConfig } from '../lib/rainbow';

export const recorderChecker = async (page: puppeteer.Page, config: CaseConfig) => {
  const errorMessageArray: Array<string> = [];

  for (const item of (config.checker?.recorder || [])) {
    const { description = '', filePath } = item;
    const { play } = await import(`../../recorder-scripts/${filePath}`);
    await play(page).catch((error: Error) => {
      errorMessageArray.push(`脚本:${description || filePath} 异常:${error}`);
    });
  }

  if (errorMessageArray.length === 0) {
    return;
  }

  await sendImageAndText({
    page,
    screenshotOptions: { fullPage: true, quality: 60, type: 'jpeg' },
    title: `${config.title} 录制执行脚本发现异常`,
    description: `页面url: ${config.url}, \n\n ${errorMessageArray.join('\n')}`,
  });
};
