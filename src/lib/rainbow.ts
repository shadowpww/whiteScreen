// 获取七彩石相关配置
import { Rainbow } from '@tencent/rainbow-node-sdk';
import { IS_PRODUCTION } from '../config/constant';
interface WhiteScreenChecker {
  threshold?: number;      // 阈值
}

interface RocoderScripts {
  description: string;             // 脚本描述
  filePath: string;                    // 脚本地址
}

interface CheckerMap {
  whiteScreen?: WhiteScreenChecker; // 选择器
  seletors?: Array<string>;         // 选择器
  pageError?: boolean;              // 选择器
  recorder?: Array<RocoderScripts>;
}

export interface CaseConfig {
  title: string;             // 页面描述信息
  url: string;
  fullPage: boolean;         // 是否截整个页面
  checker: CheckerMap;       // 检查器
  whistleFilePath?: string;   // whistle规则文件
}

export interface RainbowSecrets {
  qqLogin: {
    uin: string;
    password: string;
  },
  wechatKey: {
    production: string;
    development: string;
  }
}

export interface RainbowData {
  [index: string]: any;
  secrets?: RainbowSecrets;
  testCaseConfig: Array<CaseConfig>;
}

interface GroupResultItem {
  key: string;
  value: string;
}

const rainbow = new Rainbow({
  connectStr: 'http://api.rainbow.oa.com:8080',
  isUsingLocalCache: true,
  isUsingFileCache: true,
  timeoutPolling: 10000,
});

const groupConfig = {
  appID: 'e21af2b2-3687-4ac7-84b2-f3b342c1ad54',
  group: `supernova.${IS_PRODUCTION ? 'production' : 'development'}`,
};

export const rainbowData: RainbowData = {
  testCaseConfig: [],
};

async function getRainbowConfig() {
  const result = await rainbow.getGroup(groupConfig);
  result.key_values.forEach((item: GroupResultItem) => {
    rainbowData[item.key] = JSON.parse(item.value);
  });
}


let initialized = false; // 是否已经初始化
export async function rainbowInit() {
  if (initialized) {
    return;
  }
  rainbow.addWatcher(groupConfig, async () => {
    getRainbowConfig();
  });
  initialized = true;
  await getRainbowConfig();
}
