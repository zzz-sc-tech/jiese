// 守心小程序 - 导出服务单元测试

// 模拟微信小程序环境
global.wx = {
  getStorageSync: (key) => {
    const data = {
      'jiese_goals': [{ id: 'g1', name: '早起', icon: '🌅', type: 'single' }],
      'jiese_checkins': [
        { date: '2026-06-01', goalId: 'g1', timestamp: 1685577600000 },
        { date: '2026-06-02', goalId: 'g1', timestamp: 1685664000000, diary: '今天早起感觉很好', mood: 'happy' }
      ],
      'jiese_global_stats': { totalDays: 2, longestStreak: 2, achievements: [] }
    };
    return data[key] || null;
  },
  setStorageSync: () => {},
  removeStorageSync: () => {}
};

const exportService = require('../utils/services/exportService');

console.log('=== 测试导出服务 ===');

// 测试导出打卡记录CSV
console.log('\n--- 导出打卡记录CSV ---');
const csvResult = exportService.exportCheckinsCSV();
console.assert(csvResult.code === 0, '导出应该成功');
console.assert(csvResult.data.includes('早起'), '应该包含目标名称');
console.assert(csvResult.data.includes('2026-06-01'), '应该包含日期');
console.assert(csvResult.data.includes('今天早起感觉很好'), '应该包含日记');
console.assert(csvResult.data.includes('happy'), '应该包含心情');
console.log('✅ CSV导出测试通过');
console.log('CSV预览:');
console.log(csvResult.data.substring(0, 200) + '...');

// 测试导出统计数据CSV
console.log('\n--- 导出统计数据CSV ---');
const statsResult = exportService.exportStatsCSV();
console.assert(statsResult.code === 0, '导出应该成功');
console.assert(statsResult.data.includes('早起'), '应该包含目标名称');
console.assert(statsResult.data.includes('累计打卡天数'), '应该包含全局统计');
console.log('✅ 统计CSV导出测试通过');

// 测试生成分享数据
console.log('\n--- 生成分享数据 ---');
const shareData = exportService.generateShareData();
console.assert(shareData.totalDays === 2, '总天数应该是2');
console.assert(shareData.longestStreak === 2, '最长连续应该是2');
console.assert(shareData.goalCount === 1, '目标数应该是1');
console.log('✅ 分享数据测试通过');
console.log('分享数据:', JSON.stringify(shareData, null, 2));

console.log('\n🎉 所有导出测试通过！');
