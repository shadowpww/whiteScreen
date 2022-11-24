
import request from 'request';
import puppeteer from 'puppeteer';
import { md5 } from '../lib/utils';
import { IS_PRODUCTION } from '../config/constant';
import { rainbowData } from './rainbow';
import { logger } from './logger';

interface WechatMessageContent{
  title?: string;
  url?: string;
  description?: string;
  base64?: string;
  md5?: string;
  type: string;
  atList?: Array<string>;
}

// 拼接企业微信发送消息的url
const getUrl = () => {
  const wechatSecrets = rainbowData.secrets?.wechatKey;
  const wechatKey = IS_PRODUCTION ? wechatSecrets?.production : wechatSecrets?.development;
  return `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wechatKey}`;
};

export function wechat(content: WechatMessageContent) {
  const newsMap: {
    [index: string]: any;
  } = {
    news: {
      articles: [
        {
          title: content.title,
          description: content.description,
          url: content.url,
          picurl: content.url,
        },
      ],
    },
    image: {
      base64: content.base64,
      md5: content.md5,
    },
    text: {
      content: `${content.title}:\n${content.description}`,
      mentioned_list: content.atList || [],
    },
  };

  const options = {
    method: 'POST',
    uri: getUrl(),
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      msgtype: content.type,
      [content.type]: newsMap[content.type],
    }),
  };

  return new Promise((resovle, reject) => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        try {
          const info = JSON.parse(body);
          if (info.errcode !== 0) {
            console.error(`推送企业微信异常:${JSON.stringify(info)}`);
            reject(info);
          }
          resovle(info);
        } catch (e) {
          reject(e);
        }
      } else {
        console.error(`推送企业微信异常:${response}`);
        reject();
      }
    });
  });
}

interface ImageAndTextOptions{
  page: puppeteer.Page;                            // 当前Page的实例
  title: string;                                   // 标题
  description: string;                             // 描述信息
  screenshotOptions: puppeteer.ScreenshotOptions;  // 图片相关信息
}

// 发送图文消息，图片和文字是拆开的
export async function sendImageAndText(options: ImageAndTextOptions) {
  // 发送企业微信
  const imageBuffer = await options.page.screenshot(options.screenshotOptions);
  const imageBase64 = imageBuffer.toString('base64');

  await wechat({
    type: 'image',
    base64: imageBase64,
    md5: md5(imageBuffer),
  }).catch(error => logger.error(error));

  await wechat({
    type: 'text',
    title: options.title,
    description: options.description,
  }).catch(error => logger.error(error));
}
