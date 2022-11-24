import puppeteer from 'puppeteer';
import { sendImageAndText } from '../lib/wechat';
import { CaseConfig } from '../lib/rainbow';

interface IsContainResult{
  isContain: boolean;
  seletor: string;
}

// 是否包含指定元素
const isContainElement = async (page: puppeteer.Page, config: CaseConfig): Promise<IsContainResult> => {
  const seletors = config.checker.seletors || [];
  for (const seletor of seletors) {
    if (await page.$(seletor) === null) {
      return { isContain: false, seletor };
    }
  }
  return { isContain: true, seletor: '' };
};

export const domSelectorChecker = async (page: puppeteer.Page, config: CaseConfig) => {
  const { isContain, seletor } = await isContainElement(page, config);
  if (isContain) {
    return;
  }

  await sendImageAndText({
    page,
    screenshotOptions: { fullPage: true, quality: 60, type: 'jpeg' },
    title: `${config.title} 不存在指定元素`,
    description: `页面url: ${config.url}, 缺失元素 ${seletor}`,
  });
};
