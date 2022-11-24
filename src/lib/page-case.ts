import puppeteer from 'puppeteer';
import { logger } from './logger';
import { toggleRuleFile } from './whistle';
import { sendImageAndText } from './wechat';
import { rainbowData, CaseConfig } from './rainbow';
import { DEVICE_INFO, IS_PRODUCTION, IS_TEST } from '../config/constant';
import { whiteScreenChecker } from '../checker/white-screen';
import { domSelectorChecker } from '../checker/dom-selector';
import { recorderChecker } from '../checker/recorder';


// 需要监控的页面的类
export class PageCase {
  readonly page: puppeteer.Page;
  readonly startTime: Date;
  readonly config: CaseConfig;
  readonly errorInfo: Array<string | Error> = [];

  constructor(page: puppeteer.Page, config: CaseConfig) {
    this.config = config;
    this.page = page;
    this.startTime = new Date();
  }

  // 初始化
  public async init() {
    // 开发环境不需要切换whistle代理规则
    if (IS_PRODUCTION || IS_TEST) {
      toggleRuleFile(this.config.whistleFilePath);
    }

    await this.page.emulate(DEVICE_INFO.Iphone);
    await this.bindEvent();
    await this.page.goto(this.config.url);

    // 检查当前是否是登入页面并且登入
    await this.qqLogin();
  }

  // 结束当前页面的测试
  public async close() {
    await this.sendPageErrorMessage();
    await this.page.close({ runBeforeUnload: true });
  }

  // 执行检查器
  public async evaluateChecker() {
    const { checker } = this.config;
    // 白屏相关检查
    if (checker.whiteScreen) {
      await whiteScreenChecker(this.page, this.config);
    }

    // 页面是否包含指定元素的检查
    if (checker.seletors) {
      await domSelectorChecker(this.page, this.config);
    }

    // 如果当前有recorder
    if (checker.recorder?.length) {
      await recorderChecker(this.page, this.config);
    }
  }

  // 结束当前页面的测试
  public async sendPageErrorMessage() {
    // 下面的事件是为了监听页面报错的
    if (this.config.checker?.pageError === false) {
      return;
    }
    // 无错误发生
    if (this.errorInfo.length === 0) {
      return;
    }
    await sendImageAndText({
      page: this.page,
      screenshotOptions: { fullPage: true, quality: 60, type: 'jpeg' },
      title: `${this.config.title} 页面发生错误`,
      description: `页面URL:${this.config.url} \n\n ${this.errorInfo.join('\n')}`,
    });
  }

  // 进行QQ登入
  private async qqLogin() {
    const loginElement = await this.page.$('#web_login');
    // 无需登入
    if (!loginElement) {
      return;
    }
    await this.page.tap('#u');
    await this.page.type('#u', rainbowData.secrets?.qqLogin.uin as string);
    await this.page.tap('#p');
    await this.page.type('#p', rainbowData.secrets?.qqLogin.password as string);
    await this.page.tap('#go');
    // await this.page.waitForTimeout(3000);
    await this.page.waitForNavigation();

    if (await this.page.$('#web_login')) {
      logger.error(`${this.config.url}登录失败`);
    }
  }

  // 添加错误信息
  private addErrorInfo(errorInfo: string) {
    const configUrl = new URL(this.page.url());
    const pageUrl = new URL(this.config.url);

    // 排除参数和协议，对不是当前页面的错误信息做过滤
    if (`${configUrl.host}${configUrl.pathname}` !== `${pageUrl.host}${pageUrl.pathname}`) {
      return;
    }

    this.errorInfo.push(errorInfo);
  }

  // 对页面事件的绑定
  private async bindEvent() {
    // 当页面出现登入框的时候  执行登入
    // this.page.waitForSelector('#web_login').then(() => {
    //   logger.log('web_login');
    // });

    // 当发生页面js代码没有捕获的异常时触发
    this.page.on('pageerror', (error) => {
      logger.log('pageerror', error);
      this.addErrorInfo(`未捕获JS错误:${error.toString()}`);
    });

    // 当页面的请求失败时触发。通常是某个请求超时了。
    this.page.on('requestfailed', (res) => {
      const reg = /^https?:\/\//;
      const url = res.url();
      const isHttp = reg.test(url);

      // 忽略scheme的错误
      if (!isHttp) {
        return;
      }

      this.addErrorInfo(`资源加载失败:${url}`);
    });

    // 当页面接收到某个请求触发
    this.page.on('response', (res) => {
      const url = new URL(res.url());
      const isPage = url.href === this.config.url;

      // 加载正常
      if (res.status() < 400) {
        return;
      }

      if (isPage) {
        this.addErrorInfo(`页面打开${res.status()}:${url.href}`);
      } else {
        this.addErrorInfo(`资源加载${res.status()}:${url.href}`);
      }
    });
  }
}
