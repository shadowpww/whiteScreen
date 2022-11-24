/**
 * 对whistle的操作和启动
 */
import { execSync } from 'child_process' ;
import { WHISTLE_PORT } from '../config/constant' ;

// 启动whistle
export function start() {
  // 清空配置文件
  execSync(`sudo w2 start -p ${WHISTLE_PORT}`);
}

// 清空所有的规则
export function clearRules() {
  // 清空配置文件
  execSync('sudo rm -rf /root/.WhistleAppData/.whistle/rules/*');
  execSync('sudo w2 stop');
  execSync(`sudo w2 start -p ${WHISTLE_PORT}`);
}

export function useRuleFile(fileName: String) {
  execSync(`sudo w2 use --force whistle-rules/${fileName}`);
}

// 切换配置文件
export function toggleRuleFile(fileName?: String) {
  // clearRules();
  useRuleFile(fileName || 'empty.whistle.js');
}
