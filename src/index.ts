import puppeteer from 'puppeteer';
import { IS_DEVELOPMENT, IS_PRODUCTION, IS_TEST, WHISTLE_PORT } from './config/constant';
import { logger } from './lib/logger';
import { PageCase } from './lib/page-case';
import { rainbowInit, rainbowData } from './lib/rainbow';

const MIN = 60 * 1000;
const INTERVALS = Number(process.env.delay) || 60 * MIN;

const start = async () => {
  await rainbowInit();

  // puppeteer启动参数
  const launchArgs = [
    '--disable-dev-shm-usage',
  ];

  // 生产和测试环境，请求走代理
  if (IS_PRODUCTION || IS_TEST) {
    launchArgs.push(`--proxy-server=127.0.0.1:${WHISTLE_PORT}`);
  }

  // 启动browser
  const browser = await puppeteer.launch({
    headless: IS_PRODUCTION || IS_TEST,
    devtools: IS_DEVELOPMENT,
    args: launchArgs,
    // whistle使用的自签证书，需要忽略证书错误
    ignoreHTTPSErrors: true,
  });

  // 遍历执行所有页面测试用例
  for (const pageConf of rainbowData.testCaseConfig) {
    const page = await browser.newPage();
    const pageCase = new PageCase(page, pageConf);
    await pageCase.init();
    await pageCase.evaluateChecker();
    await pageCase.close();
  }

  await browser.close();
};

async function init() {
  logger.log(`本宝宝又开始监控了，访问频率1次/${Math.floor(INTERVALS / MIN)}分钟`);
  setInterval(start, INTERVALS);
  start();
}

init().catch(error => logger.error('ERROR:', error));
