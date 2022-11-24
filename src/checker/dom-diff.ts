// import fs from 'fs';
// import puppeteer from 'puppeteer';
// import { wechat } from '../lib/wechat';
// import { logger } from '../lib/logger';

// export const domSelectorChecker = async (page: puppeteer.Page) => {
//   const evaReturn = await page.evaluate(({ pageConf, eleLayoutMap }) => {
//     const errInfo: Array<string> = [];
//     if (!pageConf.seletors) {
//       pageConf.seletors = ['body'];
//     }
//     // 根据选择器匹配的元素，通过其宽高和定位与上次是否相同，来确定文档是否正常渲染
//     let equal = true;
//     pageConf.seletors.forEach((select: string) => {
//       const key = `${pageConf.url} (${select})`;
//       const ele = document.querySelector(select);
//       const eleLayout = eleLayoutMap[key];
//       if (!ele) {
//         // 是否发生过找不到元素
//         if (eleLayout && eleLayout.unEqualOffset.indexOf('null') !== -1) return;

//         equal = false;
//         if (eleLayout) {
//           eleLayout.unEqualOffset.push('null');
//         } else {
//           eleLayoutMap[key] = {
//             offset: null,
//             unEqualOffset: ['null'],
//           };
//         }
//         errInfo.push(`${key}: element is null`);
//         return;
//       }

//       const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = ele;
//       const offset = `${offsetTop}-${offsetLeft}-${offsetWidth}-${offsetHeight}`;
//       if (eleLayout) {
//         // 若上次未找到元素 且 此次元素布局异常
//         if (eleLayout.offset && eleLayout.offset !== offset) {
//           // 此布局未发生过
//           if (eleLayout.unEqualOffset.indexOf(offset) === -1) {
//             equal = false;

//             const errMsg = ele ? `${key}: old offset => ${eleLayout.offset}, new offset => ${offset}` : `${key}: element is null`;
//             errInfo.push(errMsg);

//             eleLayout.unEqualOffset.push(offset);
//           }
//           return;
//         }
//         // 正常布局
//         eleLayout.offset = offset;
//         return;
//       }

//       eleLayoutMap[key] = {
//         offset,
//         unEqualOffset: [],
//       };
//     });

//     return {
//       errInfo,
//       eleLayoutMap,
//       eleLayoutIsEqual: equal,
//     };
//   }, { pageConf, eleLayoutMap });

//   const {
//     errInfo,
//     eleLayoutIsEqual, // 页面是否相同
//     eleLayoutMap: eleLayoutMapNew,
//   } = evaReturn;
//   eleLayoutMap = eleLayoutMapNew;

//   logger.log(`${new Date()}: ${JSON.stringify(eleLayoutMap)}`);


//   if (!eleLayoutIsEqual) {
//     // 截图
//     const path = await setScreeshotPath(url, st);
//     await page.screenshot({ path, fullPage: !!pageConf.fullPage, quality: 60, type: ImgType });
//     logger.error('errInfo:', JSON.stringify(errInfo));
//     // 发送企业微信
//     const contents = fs.readFileSync(path);
//     const base64Bf = Buffer.from(contents, 'binary').toString('base64');
//     const isSuccess = await wechat({
//       type: 'image',
//       base64: base64Bf,
//       md5: md5(contents),
//     }).catch(() => null);

//     if (!isSuccess) {
//       // 发送图片链接到企业微信
//       await wechat({
//         type: 'text',
//         title: '图片链接',
//         description: `${DOMAIN}/${path}`,
//       });
//     }

//     await wechat({
//       type: 'text',
//       title: '异常详情',
//       description: JSON.stringify(errInfo),
//     });
//   }
// };
