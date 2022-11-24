## 项目描述
本项目基于Puppeteer, 通过配置的方式来对指定的页面做UI相关自动化检查，除内置如下描述的可配置检查器外，也支持通过Chrome Recorder功能来录制案例。

## 项目目录结构
```
.
├── Dockerfile                  # 用于构建自动化测试服务镜像
├── Dockerfile.Debian           # 用于构建Debian基础镜像
├── fonts                       # linux所需要的中文字体
├── recorder-scripts            # 通过recorder所录制的自动化脚本目录
├── src                         # 源代码目录
│   ├── checker                 # 各类检查器
│   ├── config                  # 服务相关配置
│   ├── index.ts                # 功能入口
│   └── lib                     # 实现服务功能的各代码模块
├── start.sh                    # 服务启动脚本
└── whistle-rules               # 每个页面配置所对应的whistle规则
```

## 功能清单

1. 完善5种检查器
  - [x] 白屏检查器
  - [x] 页面错误监控
  - [x] dom监听
  - [x] chrome屏幕录制检测
  - [ ] Dom-Diff 前后两次页面打开DOM树结构进行检测
2. 配置完善
  - [x] 配置切换到七彩石
  - [x] 配置区分环境
  - [ ] 配置支持指定用户
3. 支持Whistle指定测试环境
  - [x] 规则配置： 配置支持配置whistle规则文件
  - [x] 证书问题： whistle 指定证书，linux 信任根证书
  - [x] 代理配置： 浏览器通过指定的代理
  - [x] 规则切换： 不同的页面需切换到页面所对应的规则
  - [ ] 多环境问题：一个页面多人开发多套环境问题？
4. 支持流水线触发
  - [ ] 触发*所有页面*检测
  - [ ] 触发*指定页面*检测
5. 分析性能瓶颈，多进程模型，提高性能

## 检查器
1. whiteScreen 基于像素点的白屏检测 
2. page-error 对页面打开http-code，js报错，页面内资源加载错误检测
3. domSelector 基于指定元素是否存在的检测
4. domDiff 基于前后两次页面打开DOM树结构进行检测
5. recorder 基于chrome屏幕录制检测


### whiteScreen配置
原理是计算所测试页面的截图中，相同色值的像素点和所有像素点的比例；
> 通过配置checker.whiteScreen.threshold来指定阈值

```JSON
{
  "title": "钱包首页",
  "description": "钱包首页h5部分",
  "url": "https://m.qianbao.qq.com/pages/qianbaoHome",
  "checker": {
    "whiteScreen": {
      "threshold": 0.8
    },
  }
}
```

### page-error配置
服务默认会对页面的html加载错误，资源加载错误，未捕获的js报错进行监控，无需额外的配置
> 可以通过配置checker.pageError = false 来关闭此功能

```JSON
{
  "title": "钱包首页",
  "description": "钱包首页h5部分",
  "url": "https://m.qianbao.qq.com/pages/qianbaoHome",
  "checker": {
    "pageError": false
  }
}
```

### domSelector配置
原理是当页面load事件触发后，检查当前页面是否有对应的元素
> 通过配置checker.seletors来指定需要检查的元素列表

```JSON
{
  "title": "钱包首页",
  "description": "钱包首页h5部分",
  "url": "https://m.qianbao.qq.com/pages/qianbaoHome",
  "checker": {
    "seletors": [".goods-item:nth-child(3)", ".mbgame-floor .game-item-pre:nth-child(3)"]
  }
}
```

### recorder脚本录制
#### 脚本录制方式：
1. [headless-recorder](https://github.com/checkly/headless-recorder)
开源Chrome扩展，录制的脚本简单清晰，便于修改

2. [Chrome Recorder](https://developer.chrome.com/docs/devtools/recorder/)
Chrome内置功能，录制后需调整的代码相对多一些

#### 配置需执行的脚本：
> 通过配置checker.recorder来指定需要执行的的测试脚本

```JSON
{
  "title": "实名认证-个人信息",
  "description": "实名认证-个人信息",
  "url": "https://h5.qianbao.qq.com/auth/userinfo?frompage=index",
  "fullPage": true,
  "checker": {
    "recorder":[{
      "description":"chrome-recorder功能测试",
      "filePath":"auth-userinfo/chrome-recorder.js"
    },{
      "description":"headless-recorder功能测试",
      "filePath":"auth-userinfo/headless-recorder.js"
    }]
  }
},
```
#### 脚本格式
脚本需要导出play方法，检查器会执行此方法
> 录制的脚本统一保存在recorder-scripts目录下，如下为脚本例子

```JavaScript
module.exports.play = async (page) => {
  // TODO 执行UI某些操作
  // 不满足条件时 抛出错误
  throw new Error('Could not find element for selectors');
};
```

## Whistle指定环境功能
如果我们需要指定测试环境，或对页面有相对复杂的代理需求，可以指定相应的whistle配置文件

配置文件格式如下，其中exports.name需固定为supernova，来确保所测试的页面不会受到之前页面规则的影响。
> 通过配置whistleFilePath字段指向whistle-rules目录内的规则文件。

```JSON
{
  "title": "钱包首页",
  "description": "钱包首页h5部分",
  "url": "https://m.qianbao.qq.com/pages/qianbaoHome",
  "whistleFilePath":"qianbao-home.whistle.js"
}
```
> 如下是qianbao-home.whistle.js规则文件例子，保存在whistle-rules目录下

```JavaScript
exports.name = 'supernova';
exports.rules = `
m.qianbao.qq.com 11.160.161.108
`;
```


## 开发及部署问题

### 开发时 M1 Macbook 无法安装canvas
`
brew install pkg-config cairo pango libpng jpeg giflib librsvg
`

### Error while loading libatk-bridge-2.0.so.0
> https://github.com/puppeteer/puppeteer/issues/1598
> sudo yum install -y libatk-bridge2.0-0 libgtk-3.0
> sudo yum install atk java-atk-wrapper at-spi2-atk gtk3 libXt

### linux截图乱码
> yum -y install fontconfig
> 将 mac 上的字体文件(/System/Library/Fonts/PingFang.ttc) 复制到 /usr/share/fonts/mac/
> fc-cache 更新缓存
> fc-list 查看字体列表

### 更新Debian基础镜像
```
docker pull debian:stable-slim@sha256:a1801b843b1bfaf77c501e7a6d3f709401a1e0c83863037fa3aab063a7fdb9dc
docker login --username alvincao --password ${token} mirrors.tencent.com
docker tag 5d0da3dc9764 mirrors.tencent.com/moggyteam/debian:stable-slim
docker push mirrors.tencent.com/moggyteam/debian:stable-slim
```

