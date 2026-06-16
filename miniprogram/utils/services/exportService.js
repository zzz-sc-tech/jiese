// 守心小程序 - 数据导出服务模块
// 支持导出为 CSV 和图片

const storage = require('../storage');
const dateUtil = require('../date');

const exportService = {
  // 导出打卡记录为 CSV
  exportCheckinsCSV() {
    const checkins = storage.get('jiese_checkins', []);
    const goals = storage.get('jiese_goals', []);

    if (checkins.length === 0) {
      return { code: 1, message: '没有打卡记录' };
    }

    // 创建目标ID到名称的映射
    const goalMap = {};
    goals.forEach(g => {
      goalMap[g.id] = g.name;
    });

    // CSV 头部
    let csv = '﻿'; // BOM for Excel
    csv += '日期,目标,时间,类型,日记,心情\n';

    // CSV 数据
    checkins.forEach(c => {
      const date = c.date;
      const goalName = goalMap[c.goalId] || '未知目标';
      const time = c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : '';
      const type = c.count ? `计数(${c.count})` : '单次';
      const diary = c.diary ? `"${c.diary.replace(/"/g, '""')}"` : '';
      const mood = c.mood || '';

      csv += `${date},${goalName},${time},${type},${diary},${mood}\n`;
    });

    return { code: 0, data: csv };
  },

  // 导出统计数据为 CSV
  exportStatsCSV() {
    const goals = storage.get('jiese_goals', []);
    const allStats = storage.get('jiese_goal_stats', {});
    const global = storage.get('jiese_global_stats', {});

    if (goals.length === 0) {
      return { code: 1, message: '没有目标数据' };
    }

    // CSV 头部
    let csv = '﻿';
    csv += '目标名称,类型,累计天数,连续天数,最长连续\n';

    // CSV 数据
    goals.forEach(g => {
      const stat = allStats[g.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      const type = g.type === 'single' ? '单次' : g.type === 'count' ? '计数' : '时长';
      csv += `${g.name},${type},${stat.totalDays},${stat.currentStreak},${stat.longestStreak}\n`;
    });

    // 全局统计
    csv += '\n全局统计\n';
    csv += `累计打卡天数,${global.totalDays || 0}\n`;
    csv += `最长连续天数,${global.longestStreak || 0}\n`;
    csv += `成就数量,${(global.achievements || []).length}\n`;

    return { code: 0, data: csv };
  },

  // 保存文件到本地
  async saveToFile(content, filename) {
    try {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${filename}`;

      fs.writeFileSync(filePath, content, 'utf8');

      // 保存到相册或分享
      await wx.shareFileMessage({
        filePath: filePath,
        fileName: filename
      });

      return { code: 0, message: '导出成功' };
    } catch (err) {
      console.error('导出失败:', err);
      return { code: 1, message: '导出失败' };
    }
  },

  // 复制到剪贴板
  async copyToClipboard(content) {
    try {
      await wx.setClipboardData({ data: content });
      return { code: 0, message: '已复制到剪贴板' };
    } catch (err) {
      return { code: 1, message: '复制失败' };
    }
  },

  // 生成分享图片数据（返回 Canvas 绘制函数）
  generateShareData() {
    const global = storage.get('jiese_global_stats', {});
    const goals = storage.get('jiese_goals', []);
    const allStats = storage.get('jiese_goal_stats', {});
    const pets = storage.get('jiese_pets', []);

    return {
      totalDays: global.totalDays || 0,
      longestStreak: global.longestStreak || 0,
      goalCount: goals.length,
      achievementCount: (global.achievements || []).length,
      petCount: pets.length,
      topGoals: goals.slice(0, 3).map(g => {
        const stat = allStats[g.id] || { totalDays: 0 };
        return { name: g.name, icon: g.icon, days: stat.totalDays };
      })
    };
  }
};

module.exports = exportService;
