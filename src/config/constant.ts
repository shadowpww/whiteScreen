export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// whistle启动端口
export const WHISTLE_PORT = 8080;

// 截图文件所在目录
export const SCREEN_PATH = '__screenshot';

export const DEVICE_INFO = {
  Iphone: {
    name: 'Iphone', // 设备名
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/18C66 QQ/8.8.38.705 V1_IPH_SQ_8.8.38_1_APP_A Pixel/1242 MiniAppEnable SimpleUISwitch/0 StudyMode/0 CurrentMode/0 CurrentFontScale/1.000000 QQTheme/1000 Core/WKWebView Device/Apple(iPhone 11 Pro Max) NetType/WIFI QBWebViewType/1 WKType/1', // UA
    viewport: {
      width: 428,            // 屏幕宽度
      height: 800,           // 屏幕高度
      deviceScaleFactor: 2,  // 缩放比例
      isMobile: true,        // 是否是移动设备
      hasTouch: true,        // 是否支持touch事件
      isLandscape: false,    // 是否横屏
    },
  },
};
