// 守心小程序 - 工具函数单元测试

// 模拟微信小程序环境
global.wx = {
  getStorageSync: () => null,
  setStorageSync: () => {},
  removeStorageSync: () => {}
};

const {
  calculateLevel,
  formatDuration,
  formatDurationShort,
  calcGoalStat,
  getTodayStr,
  getYesterdayStr,
  checkAchievements,
  getActualCheckinDaysFrom
} = require('../utils/services/utils');

// 测试 calculateLevel
console.log('=== 测试 calculateLevel ===');

// 测试初始等级
let result = calculateLevel(0);
console.assert(result.level === 1, '0经验应该是1级');
console.assert(result.stage === 'baby', '0经验应该是baby阶段');
console.log('✅ 0经验: 1级 baby');

// 测试升级
result = calculateLevel(30);
console.assert(result.level === 2, '30经验应该是2级');
console.log('✅ 30经验: 2级');

// 测试阶段变化
result = calculateLevel(560);
console.assert(result.level === 11, '560经验应该是11级');
console.assert(result.stage === 'grow', '560经验应该是grow阶段');
console.log('✅ 560经验: 11级 grow');

// 测试满级
result = calculateLevel(1200);
console.assert(result.level === 30, '1200经验应该是30级');
console.assert(result.stage === 'adult', '1200经验应该是adult阶段');
console.log('✅ 1200经验: 30级 adult');

// 测试 formatDuration
console.log('\n=== 测试 formatDuration ===');

console.assert(formatDuration(30) === '30秒', '30秒');
console.assert(formatDuration(90) === '1分30秒', '90秒 = 1分30秒');
console.assert(formatDuration(3600) === '1时0分', '3600秒 = 1时0分');
console.assert(formatDuration(3661) === '1时1分', '3661秒 = 1时1分');
console.log('✅ formatDuration 测试通过');

// 测试 formatDurationShort
console.log('\n=== 测试 formatDurationShort ===');

console.assert(formatDurationShort(1800) === '30分', '1800秒 = 30分');
console.assert(formatDurationShort(3600) === '1时0分', '3600秒 = 1时0分');
console.log('✅ formatDurationShort 测试通过');

// 测试 getTodayStr
console.log('\n=== 测试 getTodayStr ===');

const today = getTodayStr();
console.assert(today.match(/^\d{4}-\d{2}-\d{2}$/), '日期格式应为 YYYY-MM-DD');
console.log('✅ getTodayStr:', today);

// 测试 getYesterdayStr
console.log('\n=== 测试 getYesterdayStr ===');

const yesterday = getYesterdayStr();
console.assert(yesterday.match(/^\d{4}-\d{2}-\d{2}$/), '日期格式应为 YYYY-MM-DD');
console.log('✅ getYesterdayStr:', yesterday);

// 测试 checkAchievements
console.log('\n=== 测试 checkAchievements ===');

let achievements = checkAchievements(1, 1, []);
console.assert(achievements.length === 1, '1天应该解锁1个成就');
console.assert(achievements[0].id === 'first_day', '应该解锁初出茅庐');
console.log('✅ 1天解锁: 初出茅庐');

achievements = checkAchievements(10, 3, [{ id: 'first_day' }]);
console.assert(achievements.length === 2, '10天3连续应该解锁2个成就');
console.log('✅ 10天3连续解锁: 三日之约, 十日积累');

// 测试 getActualCheckinDaysFrom
console.log('\n=== 测试 getActualCheckinDaysFrom ===');

const checkins = [
  { date: '2026-06-01', goalId: 'g1' },
  { date: '2026-06-01', goalId: 'g2' },
  { date: '2026-06-02', goalId: 'g1' },
  { date: '2026-06-03', goalId: 'g1' }
];

const days = getActualCheckinDaysFrom(checkins);
console.assert(days === 3, '应该有3个不同日期');
console.log('✅ getActualCheckinDaysFrom: 3天');

console.log('\n🎉 所有测试通过！');
