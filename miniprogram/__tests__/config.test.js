// 守心小程序 - 配置模块单元测试

const {
  QUOTES,
  GOAL_PRESETS,
  GOAL_TEMPLATES,
  ACHIEVEMENTS,
  CHALLENGE_MEDALS,
  PET_TYPES,
  PET_SKILLS,
  ITEM_TYPES,
  COSTUME_TYPES,
  BG_TYPES,
  PET_ACHIEVEMENTS,
  LEVEL_EXP,
  STAGE_THRESHOLDS
} = require('../utils/services/config');

console.log('=== 测试配置模块 ===');

// 测试语录库
console.log('\n--- 语录库 ---');
console.assert(QUOTES.length > 0, '语录库不应为空');
console.assert(QUOTES.every(q => q.content && q.author && q.category), '每条语录应有内容、作者、分类');
console.log(`✅ 语录库: ${QUOTES.length} 条`);

// 测试预设图标
console.log('\n--- 预设图标 ---');
console.assert(GOAL_PRESETS.length > 0, '预设图标不应为空');
console.assert(GOAL_PRESETS.every(p => p.icon && p.color), '每个预设应有图标和颜色');
console.log(`✅ 预设图标: ${GOAL_PRESETS.length} 个`);

// 测试目标模板
console.log('\n--- 目标模板 ---');
console.assert(GOAL_TEMPLATES.length > 0, '目标模板不应为空');
console.assert(GOAL_TEMPLATES.every(t => t.id && t.name && t.icon && t.type), '每个模板应有完整信息');
console.log(`✅ 目标模板: ${GOAL_TEMPLATES.length} 个`);

// 测试成就定义
console.log('\n--- 成就定义 ---');
console.assert(ACHIEVEMENTS.length > 0, '成就定义不应为空');
console.assert(ACHIEVEMENTS.every(a => a.id && a.name && a.desc && a.days !== undefined), '每个成就应有完整信息');
console.log(`✅ 成就定义: ${ACHIEVEMENTS.length} 个`);

// 测试挑战勋章
console.log('\n--- 挑战勋章 ---');
console.assert(CHALLENGE_MEDALS.length > 0, '挑战勋章不应为空');
console.assert(CHALLENGE_MEDALS.every(m => m.id && m.name && m.icon), '每个勋章应有完整信息');
console.log(`✅ 挑战勋章: ${CHALLENGE_MEDALS.length} 个`);

// 测试宠物类型
console.log('\n--- 宠物类型 ---');
const petTypeKeys = Object.keys(PET_TYPES);
console.assert(petTypeKeys.length > 0, '宠物类型不应为空');
console.assert(petTypeKeys.every(k => PET_TYPES[k].name && PET_TYPES[k].stages), '每个宠物应有名称和阶段');
console.log(`✅ 宠物类型: ${petTypeKeys.length} 种`);

// 测试宠物技能
console.log('\n--- 宠物技能 ---');
const petSkillKeys = Object.keys(PET_SKILLS);
console.assert(petSkillKeys.length > 0, '宠物技能不应为空');
console.log(`✅ 宠物技能: ${petSkillKeys.length} 个`);

// 测试道具类型
console.log('\n--- 道具类型 ---');
const itemKeys = Object.keys(ITEM_TYPES);
console.assert(itemKeys.length > 0, '道具类型不应为空');
console.assert(itemKeys.every(k => ITEM_TYPES[k].name && ITEM_TYPES[k].icon && ITEM_TYPES[k].exp !== undefined), '每个道具应有完整信息');
console.log(`✅ 道具类型: ${itemKeys.length} 种`);

// 测试装扮类型
console.log('\n--- 装扮类型 ---');
const costumeKeys = Object.keys(COSTUME_TYPES);
console.assert(costumeKeys.length > 0, '装扮类型不应为空');
console.log(`✅ 装扮类型: ${costumeKeys.length} 种`);

// 测试背景类型
console.log('\n--- 背景类型 ---');
const bgKeys = Object.keys(BG_TYPES);
console.assert(bgKeys.length > 0, '背景类型不应为空');
console.log(`✅ 背景类型: ${bgKeys.length} 种`);

// 测试宠物成就
console.log('\n--- 宠物成就 ---');
console.assert(PET_ACHIEVEMENTS.length > 0, '宠物成就不应为空');
console.log(`✅ 宠物成就: ${PET_ACHIEVEMENTS.length} 个`);

// 测试等级经验表
console.log('\n--- 等级经验表 ---');
console.assert(LEVEL_EXP.length === 30, '应该有30级');
console.assert(LEVEL_EXP[0] === 0, '第1级经验应为0');
console.assert(LEVEL_EXP[29] > LEVEL_EXP[0], '第30级经验应大于第1级');
console.log(`✅ 等级经验表: ${LEVEL_EXP.length} 级`);

// 测试阶段阈值
console.log('\n--- 阶段阈值 ---');
console.assert(STAGE_THRESHOLDS.baby.min === 1, 'baby阶段从1级开始');
console.assert(STAGE_THRESHOLDS.grow.min === 11, 'grow阶段从11级开始');
console.assert(STAGE_THRESHOLDS.adult.min === 21, 'adult阶段从21级开始');
console.log('✅ 阶段阈值正确');

console.log('\n🎉 所有配置测试通过！');
