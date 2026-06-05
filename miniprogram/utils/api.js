const storage = require('./storage');
const dateUtil = require('./date');

// 语录库
const QUOTES = [
  // ===== 自律 =====
  { content: '自律给我自由。', author: '康德', category: '自律' },
  { content: '所谓自由，不是随心所欲，而是自我主宰。', author: '康德', category: '自律' },
  { content: '不能制约自己的人，不能称之为自由的人。', author: '毕达哥拉斯', category: '自律' },
  { content: '谁不能主宰自己，永远是一个奴隶。', author: '歌德', category: '自律' },
  { content: '胜人者有力，自胜者强。', author: '老子', category: '自律' },
  { content: '征服自己需要更大的勇气，其胜利也是所有胜利中最光荣的胜利。', author: '柏拉图', category: '自律' },
  { content: '一个人知道自己为什么而活，就可以忍受任何一种生活。', author: '尼采', category: '自律' },
  { content: '吾日三省吾身：为人谋而不忠乎？与朋友交而不信乎？传不习乎？', author: '曾子', category: '自律' },
  { content: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈', category: '自律' },
  { content: '能控制住自己情绪的人，比能拿下一座城池的将军更伟大。', author: '拿破仑', category: '自律' },
  { content: '君子食无求饱，居无求安，敏于事而慎于言，就有道而正焉。', author: '孔子', category: '自律' },
  { content: '欲虽不可去，求可节也。', author: '荀子', category: '自律' },
  { content: '不奋发，则心日颓靡；不检束，则心日恣肆。', author: '朱熹', category: '自律' },

  // ===== 修身 =====
  { content: '静以修身，俭以养德。非淡泊无以明志，非宁静无以致远。', author: '诸葛亮', category: '修身' },
  { content: '不以物喜，不以己悲。居庙堂之高则忧其民，处江湖之远则忧其君。', author: '范仲淹', category: '修身' },
  { content: '知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。', author: '《大学》', category: '修身' },
  { content: '君子慎独，不欺暗室。卑以自牧，含章可贞。', author: '《礼记》', category: '修身' },
  { content: '见贤思齐焉，见不贤而内自省也。', author: '孔子', category: '修身' },
  { content: '吾十有五而志于学，三十而立，四十而不惑，五十而知天命。', author: '孔子', category: '修身' },
  { content: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《中庸》', category: '修身' },
  { content: '富贵不能淫，贫贱不能移，威武不能屈，此之谓大丈夫。', author: '孟子', category: '修身' },
  { content: '养心莫善于寡欲。其为人也寡欲，虽有不存焉者，寡矣。', author: '孟子', category: '修身' },
  { content: '知人者智，自知者明。胜人者有力，自胜者强。', author: '老子', category: '修身' },
  { content: '自知之明是最难得的知识。', author: '苏格拉底', category: '修身' },
  { content: '未经审视的人生不值得过。', author: '苏格拉底', category: '修身' },
  { content: '优于别人，并不高贵，真正的高贵应该是优于过去的自己。', author: '海明威', category: '修身' },
  { content: '当我真正开始爱自己，我才认识到，所有的痛苦和情感的折磨，都只是在提醒我：活着，不要违背自己的本心。', author: '卓别林', category: '修身' },
  { content: '正心以为本，修身以为基。', author: '司马光', category: '修身' },
  { content: '莫见乎隐，莫显乎微，故君子慎其独也。', author: '《中庸》', category: '修身' },

  // ===== 克己 =====
  { content: '克己复礼为仁。一日克己复礼，天下归仁焉。', author: '孔子', category: '克己' },
  { content: '五色令人目盲，五音令人耳聋，五味令人口爽，驰骋畋猎令人心发狂。', author: '老子', category: '克己' },
  { content: '怒时光景难看，一发遂不可制，故不如慎之于始也。', author: '曾国藩', category: '克己' },
  { content: '嗜欲正浓时，能斩断；怒气正盛时，能按纳。此皆学问得力处。', author: '曾国藩', category: '克己' },
  { content: '治怒之道在于忍，治惧之道在于勇。忍非怯懦，勇非鲁莽。', author: '朱熹', category: '克己' },
  { content: '小不忍则乱大谋。', author: '孔子', category: '克己' },
  { content: '欲虽不可去，求可节也。欲虽不可尽，近可尽也。', author: '荀子', category: '克己' },

  // ===== 坚忍 =====
  { content: '天行健，君子以自强不息。地势坤，君子以厚德载物。', author: '《周易》', category: '坚忍' },
  { content: '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。', author: '苏轼', category: '坚忍' },
  { content: '路漫漫其修远兮，吾将上下而求索。', author: '屈原', category: '坚忍' },
  { content: '千磨万击还坚劲，任尔东西南北风。', author: '郑燮', category: '坚忍' },
  { content: '我走得很慢，但我从不后退。', author: '林肯', category: '坚忍' },
  { content: '生活总是让我们遍体鳞伤，但到后来，那些受伤的地方一定会变成我们最强壮的地方。', author: '海明威', category: '坚忍' },
  { content: '那些杀不死你的，终将使你变得更强大。', author: '尼采', category: '坚忍' },
  { content: '锲而舍之，朽木不折；锲而不舍，金石可镂。', author: '荀子', category: '坚忍' },
  { content: '行百里者半九十。', author: '《战国策》', category: '坚忍' },
  { content: '精诚所至，金石为开。', author: '《后汉书》', category: '坚忍' },
  { content: '人生没有白走的路，每一步都算数。', author: '李宗盛', category: '坚忍' },
  { content: '成功的花，人们只惊慕她现时的明艳，然而当初她的芽儿，浸透了奋斗的泪泉，洒遍了牺牲的血雨。', author: '冰心', category: '坚忍' },
  { content: '故天将降大任于是人也，必先苦其心志，劳其筋骨，饿其体肤，空乏其身，行拂乱其所为。', author: '孟子', category: '坚忍' },

  // ===== 省思 =====
  { content: '人的一切痛苦，本质上都是对自己无能的愤怒。', author: '王小波', category: '省思' },
  { content: '我们登上并非我们所选择的舞台，演出并非我们所选择的剧本。', author: '爱比克泰德', category: '省思' },
  { content: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采', category: '省思' },
  { content: '你的时间有限，不要为别人而活。不要被教条所限，不要活在别人的观念里。', author: '乔布斯', category: '省思' },
  { content: 'Stay hungry, Stay foolish.', author: '乔布斯', category: '省思' },
  { content: '成功不是最终结果，失败也不是致命的。真正重要的是继续前进的勇气。', author: '丘吉尔', category: '省思' },
  { content: '逝者如斯夫，不舍昼夜。', author: '孔子', category: '省思' },
  { content: '盛年不重来，一日难再晨。及时当勉励，岁月不待人。', author: '陶渊明', category: '省思' },
  { content: '往者不可谏，来者犹可追。', author: '《论语》', category: '省思' },
  { content: '生于忧患，死于安乐。', author: '孟子', category: '省思' },
  { content: '忧劳可以兴国，逸豫可以亡身。', author: '欧阳修', category: '省思' },
  { content: '由俭入奢易，由奢入俭难。', author: '司马光', category: '省思' },
  { content: '真正的勇士，敢于直面惨淡的人生，敢于正视淋漓的鲜血。', author: '鲁迅', category: '省思' },

  // ===== 定力 =====
  { content: '非淡泊无以明志，非宁静无以致远。', author: '诸葛亮', category: '定力' },
  { content: '致虚极，守静笃。万物并作，吾以观复。', author: '老子', category: '定力' },
  { content: '上善若水，水善利万物而不争，处众人之所恶，故几于道。', author: '老子', category: '定力' },
  { content: '宠辱不惊，看庭前花开花落；去留无意，望天上云卷云舒。', author: '洪应明', category: '定力' },
  { content: '菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。', author: '六祖慧能', category: '定力' },
  { content: '身是菩提树，心如明镜台。时时勤拂拭，勿使惹尘埃。', author: '神秀', category: '定力' },
  { content: '非风动，非幡动，仁者心动。', author: '六祖慧能', category: '定力' },
  { content: '一切有为法，如梦幻泡影，如露亦如电，应作如是观。', author: '《金刚经》', category: '定力' },
  { content: '恬淡虚无，真气从之；精神内守，病安从来。', author: '《黄帝内经》', category: '定力' },
  { content: '不乱于心，不困于情，不畏将来，不念过往。如此，安好。', author: '丰子恺', category: '定力' },
  { content: '心静则明，水止乃能照物；品超斯远，云飞而不碍空。', author: '王永彬', category: '定力' },
  { content: '天地间真滋味，惟静者能尝得出；天地间真机括，惟静者能看得透。', author: '吕坤', category: '定力' },

  // ===== 慎独 =====
  { content: '所谓诚其意者，毋自欺也。如恶恶臭，如好好色，此之谓自谦。故君子必慎其独也。', author: '《大学》', category: '慎独' },
  { content: '莫见乎隐，莫显乎微，故君子慎其独也。', author: '《中庸》', category: '慎独' },
  { content: '暗室不欺心，独处不欺己。', author: '《格言联璧》', category: '慎独' },
  { content: '兰生幽谷，不为莫服而不芳；舟在江海，不为莫乘而不浮。', author: '《淮南子》', category: '慎独' },
  { content: '梨虽无主，我心有主。', author: '许衡', category: '慎独' },
  { content: '天知地知你知我知，何谓无知。', author: '杨震', category: '慎独' },
  { content: '内不欺己，外不欺人，上不欺天，君子所以慎独也。', author: '金缨', category: '慎独' },
  { content: '慎独则心安，主敬则身强，求仁则人悦，习劳则神钦。', author: '曾国藩', category: '慎独' },

  // ===== 智慧 =====
  { content: '知之为知之，不知为不知，是知也。', author: '孔子', category: '智慧' },
  { content: '学而不思则罔，思而不学则殆。', author: '孔子', category: '智慧' },
  { content: '三人行，必有我师焉。择其善者而从之，其不善者而改之。', author: '孔子', category: '智慧' },
  { content: '己所不欲，勿施于人。', author: '孔子', category: '智慧' },
  { content: '满招损，谦受益。', author: '《尚书》', category: '智慧' },
  { content: '良药苦口利于病，忠言逆耳利于行。', author: '《史记》', category: '智慧' },
  { content: '勿以恶小而为之，勿以善小而不为。', author: '刘备', category: '智慧' },
  { content: '出淤泥而不染，濯清涟而不妖。', author: '周敦颐', category: '智慧' },
  { content: '善不积不足以成名，恶不积不足以灭身。', author: '《周易》', category: '智慧' },
  { content: '天下难事，必作于易；天下大事，必作于细。', author: '老子', category: '智慧' }
];

// 预设目标图标和颜色
const GOAL_PRESETS = [
  { icon: '🌅', color: '#E88D67' },
  { icon: '🏃', color: '#5B9A6F' },
  { icon: '📖', color: '#6B8DD6' },
  { icon: '🧘', color: '#9B72CF' },
  { icon: '💪', color: '#E8B86D' },
  { icon: '✍️', color: '#5BAEBF' },
  { icon: '🎵', color: '#D46B8C' },
  { icon: '🌿', color: '#7BC47F' },
  { icon: '💤', color: '#8B9DC3' },
  { icon: '🎯', color: '#E87461' },
  { icon: '📝', color: '#D4A04A' },
  { icon: '🏋️', color: '#C45B5B' },
  { icon: '🎨', color: '#B8A0D4' },
  { icon: '💻', color: '#5BAEBF' },
  { icon: '🍎', color: '#E88D67' },
  { icon: '💰', color: '#D4A04A' },
  { icon: '🎸', color: '#D46B8C' },
  { icon: '📚', color: '#6B8DD6' },
  { icon: '🏃‍♀️', color: '#7BC47F' },
  { icon: '🙏', color: '#9B72CF' },
  { icon: '⏰', color: '#5B9A6F' },
  { icon: '🌟', color: '#E8B86D' },
  { icon: '🎬', color: '#8B9DC3' },
  { icon: '🧹', color: '#5BAEBF' }
];

// 目标类型
// single: 单次打卡（早起、早睡），每天一次
// count: 多次计数打卡（三餐），每天可多次，有目标次数
// duration: 时长打卡（学习），记录时长，绑定计时器

// 成就定义
const ACHIEVEMENTS = [
  { id: 'first_day', name: '初出茅庐', desc: '完成第一次打卡', days: 1, type: 'streak' },
  { id: 'three_days', name: '三日之约', desc: '连续打卡3天', days: 3, type: 'streak' },
  { id: 'one_week', name: '一周坚持', desc: '连续打卡7天', days: 7, type: 'streak' },
  { id: 'two_weeks', name: '两周不辍', desc: '连续打卡14天', days: 14, type: 'streak' },
  { id: 'habit_formed', name: '习惯养成', desc: '连续打卡21天', days: 21, type: 'streak' },
  { id: 'one_month', name: '月度之星', desc: '连续打卡30天', days: 30, type: 'streak' },
  { id: 'two_months', name: '双月达人', desc: '连续打卡60天', days: 60, type: 'streak' },
  { id: 'quarter', name: '季度楷模', desc: '连续打卡90天', days: 90, type: 'streak' },
  { id: 'century', name: '百日征程', desc: '连续打卡100天', days: 100, type: 'streak' },
  { id: 'half_year', name: '半载坚守', desc: '连续打卡180天', days: 180, type: 'streak' },
  { id: 'one_year', name: '年度传奇', desc: '连续打卡365天', days: 365, type: 'streak' },
  { id: 'total_10', name: '十日积累', desc: '累计打卡10天', days: 10, type: 'total' },
  { id: 'total_50', name: '半百之志', desc: '累计打卡50天', days: 50, type: 'total' },
  { id: 'total_100', name: '百日修行', desc: '累计打卡100天', days: 100, type: 'total' },
  { id: 'total_200', name: '二百里程', desc: '累计打卡200天', days: 200, type: 'total' },
  { id: 'total_365', name: '一年有成', desc: '累计打卡365天', days: 365, type: 'total' }
];

// 挑战勋章定义
const CHALLENGE_MEDALS = [
  { id: 'challenge_7', name: '七日勇士', desc: '完成7天挑战', days: 7, icon: '🥉' },
  { id: 'challenge_21', name: '习惯先锋', desc: '完成21天挑战', days: 21, icon: '🥈' },
  { id: 'challenge_30', name: '月度冠军', desc: '完成30天挑战', days: 30, icon: '🥇' },
  { id: 'challenge_60', name: '双月精英', desc: '完成60天挑战', days: 60, icon: '🏅' },
  { id: 'challenge_90', name: '季度之星', desc: '完成90天挑战', days: 90, icon: '🎖️' },
  { id: 'challenge_180', name: '半载传奇', desc: '完成180天挑战', days: 180, icon: '👑' },
  { id: 'challenge_365', name: '年度王者', desc: '完成365天挑战', days: 365, icon: '💎' },
  { id: 'challenge_first', name: '挑战新手', desc: '完成第一个挑战', days: 0, icon: '🌟' },
  { id: 'challenge_3', name: '挑战达人', desc: '累计完成3个挑战', days: 0, icon: '🔥' },
  { id: 'challenge_5', name: '挑战大师', desc: '累计完成5个挑战', days: 0, icon: '⚡' }
];

// ========== 宠物系统配置 ==========
const PET_TYPES = {
  pet_seedling: {
    name: '小树苗',
    icon: '🌱',
    desc: '象征自律成长',
    stages: {
      baby: { icon: '🌱', name: '幼年树苗' },
      grow: { icon: '🌿', name: '成长小树' },
      adult: { icon: '🌳', name: '参天大树' }
    }
  },
  pet_cat: {
    name: '小猫咪',
    icon: '🐱',
    desc: '温柔陪伴你成长',
    stages: {
      baby: { icon: '🐱', name: '幼年猫咪' },
      grow: { icon: '🐈', name: '优雅猫咪' },
      adult: { icon: '🦁', name: '狮王猫咪' }
    }
  },
  pet_dog: {
    name: '小柴犬',
    icon: '🐶',
    desc: '忠诚守护你的目标',
    stages: {
      baby: { icon: '🐶', name: '幼年柴犬' },
      grow: { icon: '🐕', name: '活力柴犬' },
      adult: { icon: '🐺', name: '狼王柴犬' }
    }
  },
  pet_rabbit: {
    name: '小兔子',
    icon: '🐰',
    desc: '活力满满的伙伴',
    stages: {
      baby: { icon: '🐰', name: '幼年兔子' },
      grow: { icon: '🐇', name: '跳跃兔子' },
      adult: { icon: '🦌', name: '灵兔仙子' }
    }
  },
  pet_panda: {
    name: '小熊猫',
    icon: '🐼',
    desc: '国宝级萌宠',
    stages: {
      baby: { icon: '🐼', name: '幼年熊猫' },
      grow: { icon: '🐻', name: '憨厚熊猫' },
      adult: { icon: '🐻‍❄️', name: '冰雪熊猫' }
    }
  },
  pet_dragon: {
    name: '小飞龙',
    icon: '🐲',
    desc: '守护你的梦想',
    stages: {
      baby: { icon: '🐲', name: '幼年飞龙' },
      grow: { icon: '🐉', name: '成长飞龙' },
      adult: { icon: '🐲', name: '神圣巨龙' }
    }
  },
  pet_fox: {
    name: '小狐狸',
    icon: '🦊',
    desc: '聪明伶俐的伙伴',
    stages: {
      baby: { icon: '🦊', name: '幼年狐狸' },
      grow: { icon: '🦊', name: '灵狐' },
      adult: { icon: '🦊', name: '九尾灵狐' }
    }
  },
  pet_penguin: {
    name: '小企鹅',
    icon: '🐧',
    desc: '坚持到底的象征',
    stages: {
      baby: { icon: '🐧', name: '幼年企鹅' },
      grow: { icon: '🐧', name: '绅士企鹅' },
      adult: { icon: '🐧', name: '帝王企鹅' }
    }
  },
  pet_hamster: {
    name: '小仓鼠',
    icon: '🐹',
    desc: '勤劳的小可爱',
    stages: {
      baby: { icon: '🐹', name: '幼年仓鼠' },
      grow: { icon: '🐹', name: '活力仓鼠' },
      adult: { icon: '🐹', name: '黄金仓鼠' }
    }
  },
  pet_turtle: {
    name: '小乌龟',
    icon: '🐢',
    desc: '稳扎稳打的智者',
    stages: {
      baby: { icon: '🐢', name: '幼年乌龟' },
      grow: { icon: '🐢', name: '灵龟' },
      adult: { icon: '🐢', name: '神龟' }
    }
  },
  pet_butterfly: {
    name: '小蝴蝶',
    icon: '🦋',
    desc: '破茧成蝶的蜕变',
    stages: {
      baby: { icon: '🐛', name: '毛毛虫' },
      grow: { icon: '🪱', name: '蛹' },
      adult: { icon: '🦋', name: '彩蝶' }
    }
  },
  pet_unicorn: {
    name: '小独角兽',
    icon: '🦄',
    desc: '梦想与奇迹的化身',
    stages: {
      baby: { icon: '🦄', name: '幼年独角兽' },
      grow: { icon: '🦄', name: '银角独角兽' },
      adult: { icon: '🦄', name: '彩虹独角兽' }
    }
  }
};

// 道具配置
const ITEM_TYPES = {
  feed: { name: '普通饲料', icon: '🌾', exp: 10, desc: '每日打卡获得' },
  fruit: { name: '营养果实', icon: '🍎', exp: 20, desc: '连续打卡3天获得' },
  candy: { name: '能量糖果', icon: '🍬', exp: 15, desc: '完成番茄钟获得' },
  crystal: { name: '魔法水晶', icon: '💎', exp: 50, desc: '完成4个番茄钟获得' },
  star: { name: '星光碎片', icon: '⭐', exp: 100, desc: '连续打卡7天获得' },
  rainbow: { name: '彩虹宝箱', icon: '🌈', exp: 200, desc: '完成挑战获得' }
};

// 宠物技能配置
const PET_SKILLS = {
  pet_seedling: { name: '光合作用', desc: '每日打卡额外获得1个饲料', icon: '☀️', type: 'extra_feed' },
  pet_cat: { name: '猫的报恩', desc: '打卡有20%概率获得双倍道具', icon: '🍀', type: 'double_item', chance: 0.2 },
  pet_dog: { name: '忠诚守护', desc: '连续打卡天数+1', icon: '🛡️', type: 'streak_bonus', value: 1 },
  pet_rabbit: { name: '跳跃活力', desc: '番茄钟经验+20%', icon: '⚡', type: 'exp_boost', value: 0.2 },
  pet_panda: { name: '国宝福气', desc: '随机事件触发率+10%', icon: '🎋', type: 'luck_boost', value: 0.1 },
  pet_dragon: { name: '龙之祝福', desc: '所有经验+10%', icon: '🐲', type: 'global_exp_boost', value: 0.1 },
  pet_fox: { name: '狐之智慧', desc: '投喂暴击率15%（3倍经验）', icon: '📚', type: 'crit_feed', chance: 0.15 },
  pet_penguin: { name: '极地耐力', desc: '挑战完成奖励+50%', icon: '❄️', type: 'challenge_boost', value: 0.5 },
  pet_hamster: { name: '勤劳储备', desc: '每日首次投喂不消耗道具', icon: '💰', type: 'free_feed' },
  pet_turtle: { name: '龟之坚韧', desc: '失败挑战不重置进度', icon: '🐢', type: 'challenge_protect' },
  pet_butterfly: { name: '蝶之蜕变', desc: '进化所需经验-30%', icon: '🦋', type: 'evolution_discount', value: 0.3 },
  pet_unicorn: { name: '彩虹祝福', desc: '每天随机获得1个道具', icon: '🌈', type: 'daily_random_item' }
};

// 装扮配置
const COSTUME_TYPES = {
  hat_1: { name: '小礼帽', icon: '🎩', part: 'hat', desc: '优雅绅士' },
  hat_2: { name: '皇冠', icon: '👑', part: 'hat', desc: '王者风范' },
  hat_3: { name: '花环', icon: '💐', part: 'hat', desc: '清新自然' },
  hat_4: { name: '巫师帽', icon: '🧙', part: 'hat', desc: '神秘魔法' },
  scarf_1: { name: '红围巾', icon: '🧣', part: 'scarf', desc: '温暖舒适' },
  scarf_2: { name: '领结', icon: '🎀', part: 'scarf', desc: '俏皮可爱' },
  glasses_1: { name: '墨镜', icon: '🕶️', part: 'glasses', desc: '酷炫十足' },
  glasses_2: { name: '圆框眼镜', icon: '👓', part: 'glasses', desc: '文艺范儿' }
};

// 背景配置
const BG_TYPES = {
  bg_forest: { name: '魔法森林', icon: '🌲', desc: '宁静的森林', gradient: 'linear-gradient(180deg, #2d5016 0%, #4a7c2e 50%, #8bc34a 100%)' },
  bg_beach: { name: '阳光海滩', icon: '🏖️', desc: '温暖的海滩', gradient: 'linear-gradient(180deg, #87ceeb 0%, #f0e68c 50%, #deb887 100%)' },
  bg_space: { name: '星际太空', icon: '🚀', desc: '神秘的宇宙', gradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2d2d6e 100%)' },
  bg_garden: { name: '梦幻花园', icon: '🌸', desc: '浪漫的花园', gradient: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)' },
  bg_mountain: { name: '云端山峰', icon: '⛰️', desc: '高耸的山峰', gradient: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)' },
  bg_night: { name: '星空夜晚', icon: '🌙', desc: '宁静的夜晚', gradient: 'linear-gradient(180deg, #1a237e 0%, #283593 50%, #3949ab 100%)' }
};

// 宠物成就配置
const PET_ACHIEVEMENTS = [
  { id: 'pet_first', name: '初次相遇', desc: '领养第一只宠物', icon: '🤝', condition: 'adopt_first' },
  { id: 'pet_two', name: '双宠之家', desc: '同时拥有两只宠物', icon: '🐾', condition: 'have_two' },
  { id: 'pet_level_10', name: '小有成就', desc: '宠物达到10级', icon: '📈', condition: 'level_10' },
  { id: 'pet_level_20', name: '茁壮成长', desc: '宠物达到20级', icon: '🌟', condition: 'level_20' },
  { id: 'pet_level_30', name: '满级达成', desc: '宠物达到30级', icon: '🏆', condition: 'level_30' },
  { id: 'pet_evolve_1', name: '初次进化', desc: '宠物第一次进化', icon: '✨', condition: 'evolve_once' },
  { id: 'pet_evolve_2', name: '完全体', desc: '宠物进化到最终形态', icon: '🦋', condition: 'evolve_full' },
  { id: 'pet_feed_100', name: '爱心满满', desc: '累计投喂100次', icon: '❤️', condition: 'feed_100' },
  { id: 'pet_all_types', name: '收藏家', desc: '解锁所有宠物类型', icon: '📚', condition: 'all_types' },
  { id: 'pet_costume', name: '时尚达人', desc: '给宠物穿上装扮', icon: '👗', condition: 'wear_costume' },
  { id: 'pet_diary_30', name: '成长记录', desc: '累计30条日记', icon: '📖', condition: 'diary_30' },
  { id: 'pet_interact_50', name: '亲密伙伴', desc: '与宠物互动50次', icon: '💕', condition: 'interact_50' }
];

// 等级经验表（30级）- 一周全勤约1000经验可满级
const LEVEL_EXP = [
  0, 30, 60, 100, 150, 200, 260, 330, 400, 480,        // 1-10
  560, 640, 720, 800, 850, 900, 930, 960, 980, 1000,    // 11-20
  1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180, 1200  // 21-30
];

// 阶段等级阈值
const STAGE_THRESHOLDS = {
  baby: { min: 1, max: 10 },
  grow: { min: 11, max: 20 },
  adult: { min: 21, max: 30 }
};

// ========== 宠物数据操作 ==========
function getPets() {
  return storage.get('jiese_pets', []);
}

function savePets(pets) {
  storage.set('jiese_pets', pets);
}

// 兼容旧版本单宠物数据
function migratePetData() {
  const oldPet = storage.get('jiese_pet', null);
  if (oldPet) {
    const pets = getPets();
    if (pets.length === 0) {
      pets.push(oldPet);
      savePets(pets);
    }
    storage.remove('jiese_pet');
  }
}

function getPetItems() {
  return storage.get('jiese_pet_items', {
    feed: 0,
    fruit: 0,
    candy: 0,
    crystal: 0,
    star: 0,
    rainbow: 0
  });
}

function savePetItems(items) {
  storage.set('jiese_pet_items', items);
}

// 计算等级和阶段
function calculateLevel(exp) {
  let level = 1;
  for (let i = 0; i < LEVEL_EXP.length; i++) {
    if (exp >= LEVEL_EXP[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  let stage = 'baby';
  if (level >= STAGE_THRESHOLDS.adult.min) {
    stage = 'adult';
  } else if (level >= STAGE_THRESHOLDS.grow.min) {
    stage = 'grow';
  }

  const currentLevelExp = LEVEL_EXP[level - 1] || 0;
  const nextLevelExp = level < 30 ? LEVEL_EXP[level] : LEVEL_EXP[29];
  const levelProgress = level < 30
    ? (exp - currentLevelExp) / (nextLevelExp - currentLevelExp)
    : 1;

  return {
    level,
    stage,
    currentExp: exp,
    nextLevelExp: nextLevelExp,
    levelProgress: Math.min(1, Math.max(0, levelProgress))
  };
}

// ========== 内部数据操作 ==========
function getGoals() {
  return storage.get('jiese_goals', []);
}

function saveGoals(goals) {
  storage.set('jiese_goals', goals);
}

function getGoalStats() {
  return storage.get('jiese_goal_stats', {});
}

function saveGoalStats(stats) {
  storage.set('jiese_goal_stats', stats);
}

function getCheckins() {
  return storage.get('jiese_checkins', []);
}

function saveCheckins(list) {
  storage.set('jiese_checkins', list);
}

// 时长记录（用于 duration 类型目标）
function getDurationSessions() {
  return storage.get('jiese_duration_sessions', []);
}

function saveDurationSessions(list) {
  storage.set('jiese_duration_sessions', list);
}

function getChallenges() {
  return storage.get('jiese_challenges', []);
}

function saveChallenges(list) {
  storage.set('jiese_challenges', list);
}

function getGlobalStats() {
  return storage.get('jiese_global_stats', {
    totalDays: 0, longestStreak: 0, achievements: []
  });
}

function saveGlobalStats(data) {
  storage.set('jiese_global_stats', data);
}

function checkAchievements(totalDays, streak, existing) {
  const ids = (existing || []).map(a => a.id);
  const result = [];
  for (const a of ACHIEVEMENTS) {
    const val = a.type === 'streak' ? streak : totalDays;
    if (val >= a.days && !ids.includes(a.id)) {
      result.push({ id: a.id, name: a.name, desc: a.desc, unlockedAt: new Date().toISOString() });
    }
  }
  return result;
}

// 计算单个目标的打卡统计
function calcGoalStat(goalId, checkins) {
  const goalCheckins = checkins
    .filter(c => c.goalId === goalId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (goalCheckins.length === 0) {
    return { totalDays: 0, currentStreak: 0, longestStreak: 0, lastCheckinDate: '' };
  }

  // 使用唯一日期计算天数（count 类型同一天有多条记录）
  const uniqueDates = [...new Set(goalCheckins.map(c => c.date))].sort();
  const totalDays = uniqueDates.length;
  const lastCheckinDate = uniqueDates[uniqueDates.length - 1];

  // 计算连续天数（从今天或昨天往回数）
  const today = dateUtil.today();
  const yesterday = dateUtil.yesterday();
  let currentStreak = 0;

  const reversedDates = [...uniqueDates].reverse();
  const lastDate = reversedDates[0];

  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < reversedDates.length; i++) {
      const prevDate = new Date(reversedDates[i - 1]);
      const currDate = new Date(reversedDates[i]);
      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 计算最长连续
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { totalDays, currentStreak, longestStreak, lastCheckinDate };
}

// ========== 对外接口 ==========
const api = {
  // 获取预设图标列表
  getGoalPresets() {
    return GOAL_PRESETS;
  },

  // 获取总打卡次数
  getTotalCheckins() {
    const checkins = getCheckins();
    return checkins.length;
  },

  // 获取实际打卡天数（去重后的天数）
  getActualCheckinDays() {
    const checkins = getCheckins();
    const uniqueDates = new Set(checkins.map(c => c.date));
    return uniqueDates.size;
  },

  // ========== 宠物系统接口 ==========

  // 获取宠物类型列表
  getPetTypes() {
    return PET_TYPES;
  },

  // 获取道具类型列表
  getItemTypes() {
    return ITEM_TYPES;
  },

  // 获取所有宠物信息
  getPetsInfo() {
    migratePetData();
    const pets = getPets();
    const petsInfo = pets.map(pet => {
      const petType = PET_TYPES[pet.petId];
      const levelInfo = calculateLevel(pet.exp);
      const stageInfo = petType.stages[levelInfo.stage];
      return {
        ...pet,
        ...levelInfo,
        typeName: petType.name,
        typeIcon: petType.icon,
        typeDesc: petType.desc,
        stageName: stageInfo.name,
        stageIcon: stageInfo.icon
      };
    });
    return { code: 0, data: petsInfo };
  },

  // 获取单个宠物信息
  getPetInfo(petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return { code: 0, data: null };

    const petType = PET_TYPES[pet.petId];
    const levelInfo = calculateLevel(pet.exp);
    const stageInfo = petType.stages[levelInfo.stage];

    return {
      code: 0,
      data: {
        ...pet,
        petIndex,
        ...levelInfo,
        typeName: petType.name,
        typeIcon: petType.icon,
        typeDesc: petType.desc,
        stageName: stageInfo.name,
        stageIcon: stageInfo.icon
      }
    };
  },

  // 领养宠物
  async adoptPet(petId, name) {
    migratePetData();
    const pets = getPets();
    if (pets.length >= 2) {
      return { code: 1, message: '最多只能养2只宠物' };
    }

    if (!PET_TYPES[petId]) {
      return { code: 2, message: '无效的宠物类型' };
    }

    const pet = {
      petId,
      name: name || PET_TYPES[petId].name,
      exp: 0,
      adoptTime: Date.now(),
      lastFeedTime: Date.now()
    };

    pets.push(pet);
    savePets(pets);
    return { code: 0, data: pet };
  },

  // 获取道具列表
  getItems() {
    const items = getPetItems();
    const itemTypes = ITEM_TYPES;

    const itemList = Object.entries(items).map(([id, count]) => ({
      id,
      count,
      ...itemTypes[id]
    }));

    return { code: 0, data: itemList };
  },

  // 使用道具投喂宠物
  async feedPet(itemId, petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) {
      return { code: 1, message: '请先领养宠物' };
    }

    const items = getPetItems();
    if (!items[itemId] || items[itemId] <= 0) {
      return { code: 2, message: '道具不足' };
    }

    const itemConfig = ITEM_TYPES[itemId];
    if (!itemConfig) {
      return { code: 3, message: '无效的道具' };
    }

    // 计算升级前的等级
    const beforeLevel = calculateLevel(pet.exp);

    // 增加经验值
    pet.exp += itemConfig.exp;
    pet.lastFeedTime = Date.now();

    // 计算升级后的等级
    const afterLevel = calculateLevel(pet.exp);

    // 减少道具
    items[itemId]--;
    savePetItems(items);
    savePets(pets);

    // 判断是否升级或进化
    const leveledUp = afterLevel.level > beforeLevel.level;
    const evolved = afterLevel.stage !== beforeLevel.stage;

    return {
      code: 0,
      data: {
        pet,
        petIndex,
        levelInfo: afterLevel,
        gainedExp: itemConfig.exp,
        leveledUp,
        evolved,
        oldStage: beforeLevel.stage,
        newStage: afterLevel.stage
      }
    };
  },

  // 发放道具（打卡/番茄钟时调用）
  async grantItem(itemId, count = 1) {
    const items = getPetItems();
    items[itemId] = (items[itemId] || 0) + count;
    savePetItems(items);

    return {
      code: 0,
      data: {
        itemId,
        count,
        totalCount: items[itemId]
      }
    };
  },

  // 获取宠物信息（简化版，用于显示）
  getPetSimple(petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return null;

    const petType = PET_TYPES[pet.petId];
    const levelInfo = calculateLevel(pet.exp);
    const stageInfo = petType.stages[levelInfo.stage];

    return {
      ...pet,
      petIndex,
      level: levelInfo.level,
      stage: levelInfo.stage,
      stageIcon: stageInfo.icon,
      stageName: stageInfo.name,
      levelProgress: levelInfo.levelProgress
    };
  },

  // 删除宠物
  async deletePet(petIndex) {
    migratePetData();
    const pets = getPets();
    if (petIndex < 0 || petIndex >= pets.length) {
      return { code: 1, message: '无效的宠物索引' };
    }
    pets.splice(petIndex, 1);
    savePets(pets);
    return { code: 0 };
  },

  // 创建目标
  async createGoal(name, icon, color, type, targetCount) {
    const goals = getGoals();
    const id = 'goal_' + Date.now();
    const preset = GOAL_PRESETS[goals.length % GOAL_PRESETS.length];
    const goal = {
      id,
      name: name || '新目标',
      icon: icon || preset.icon,
      color: color || preset.color,
      type: type || 'single', // single | count | duration
      targetCount: type === 'count' ? (targetCount || 3) : 0,
      createdAt: Date.now()
    };
    goals.push(goal);
    saveGoals(goals);
    return { code: 0, data: goal };
  },

  // 更新目标
  async updateGoal(goalId, updates) {
    const goals = getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return { code: 1, message: '目标不存在' };
    goals[idx] = { ...goals[idx], ...updates };
    saveGoals(goals);
    return { code: 0, data: goals[idx] };
  },

  // 删除目标
  async deleteGoal(goalId) {
    let goals = getGoals();
    goals = goals.filter(g => g.id !== goalId);
    saveGoals(goals);
    // 同时删除该目标的打卡记录
    let checkins = getCheckins();
    checkins = checkins.filter(c => c.goalId !== goalId);
    saveCheckins(checkins);
    // 删除时长记录
    let sessions = getDurationSessions();
    sessions = sessions.filter(s => s.goalId !== goalId);
    saveDurationSessions(sessions);
    // 删除关联挑战
    let challenges = getChallenges();
    challenges = challenges.filter(c => c.goalId !== goalId);
    saveChallenges(challenges);
    return { code: 0 };
  },

  // 获取所有目标
  async getGoals() {
    return { code: 0, data: getGoals() };
  },

  // 对某个目标打卡（single 类型：每天一次）
  async checkin(goalId) {
    const today = dateUtil.today();
    const checkins = getCheckins();

    // 检查该目标今日是否已打卡
    if (checkins.some(c => c.date === today && c.goalId === goalId)) {
      return { code: 1, message: '今日已打卡' };
    }

    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 记录打卡
    checkins.push({ date: today, goalId, timestamp: Date.now() });
    saveCheckins(checkins);

    return this._afterCheckin(goal, checkins);
  },

  // count 类型打卡：每天可多次，记录次数
  async checkinCount(goalId) {
    const today = dateUtil.today();
    const checkins = getCheckins();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 统计今日已打卡次数
    const todayCount = checkins.filter(c => c.date === today && c.goalId === goalId).length;
    if (goal.targetCount > 0 && todayCount >= goal.targetCount) {
      return { code: 1, message: `今日已完成${goal.targetCount}次` };
    }

    checkins.push({ date: today, goalId, timestamp: Date.now(), count: todayCount + 1 });
    saveCheckins(checkins);

    return this._afterCheckin(goal, checkins);
  },

  // duration 类型：保存一段时长记录
  async saveDuration(goalId, durationSeconds, startTimestamp, timerType) {
    const today = dateUtil.today();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 保存时长会话
    const sessions = getDurationSessions();
    sessions.push({
      id: 'ses_' + Date.now(),
      goalId,
      date: today,
      duration: durationSeconds, // 秒
      timerType: timerType || 'clock', // pomodoro | clock
      startTimestamp,
      endTimestamp: Date.now(),
      timestamp: Date.now()
    });
    saveDurationSessions(sessions);

    // 同时记录一条打卡（如果今天还没有打卡记录）
    const checkins = getCheckins();
    const todayHasCheckin = checkins.some(c => c.date === today && c.goalId === goalId);
    if (!todayHasCheckin) {
      checkins.push({ date: today, goalId, timestamp: Date.now() });
      saveCheckins(checkins);
    }

    return this._afterCheckin(goal, checkins);
  },

  // 打卡后的公共逻辑
  _afterCheckin(goal, checkins) {
    const goalStat = calcGoalStat(goal.id, checkins);
    const allStats = getGoalStats();
    allStats[goal.id] = goalStat;
    saveGoalStats(allStats);

    const global = getGlobalStats();
    const allGoalStats = Object.values(allStats);
    const totalDays = allGoalStats.reduce((sum, s) => sum + s.totalDays, 0);
    const maxStreak = Math.max(0, ...allGoalStats.map(s => s.currentStreak));
    const maxLongest = Math.max(0, ...allGoalStats.map(s => s.longestStreak));
    global.totalDays = totalDays;
    global.longestStreak = Math.max(global.longestStreak || 0, maxLongest);
    const newAchievements = checkAchievements(totalDays, maxStreak, global.achievements);
    global.achievements = [...(global.achievements || []), ...newAchievements];
    saveGlobalStats(global);

    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    // 静默发放宠物道具（无提示）
    const pets = getPets();
    if (pets.length > 0) {
      this.grantItem('feed', 1);
      const streak = goalStat.currentStreak;
      if (streak === 3) this.grantItem('fruit', 1);
      if (streak === 7) this.grantItem('star', 1);

      // 检查挑战完成
      const challenges = getChallenges();
      const goalChallenges = challenges.filter(c => c.goalId === goal.id && c.status === 'active');
      const now = new Date();
      goalChallenges.forEach(ch => {
        const startDate = new Date(ch.startDate);
        const completedDays = Math.min(
          Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
          ch.targetDays
        );
        if (completedDays >= ch.targetDays) {
          this.grantItem('rainbow', 1);
          ch.status = 'completed';
          ch.completedAt = Date.now();
        }
      });
      saveChallenges(challenges);

      // 随机事件
      this._triggerRandomEvent();
    }

    return {
      code: 0, message: '打卡成功',
      data: {
        goalId: goal.id,
        goalName: goal.name,
        totalDays: goalStat.totalDays,
        currentStreak: goalStat.currentStreak,
        longestStreak: goalStat.longestStreak,
        globalTotalDays: totalDays,
        quote,
        newAchievements
      }
    };
  },

  // 随机事件触发
  _triggerRandomEvent() {
    const rand = Math.random();
    if (rand < 0.2) {
      const items = ['feed', 'fruit', 'candy', 'star'];
      const weights = [4, 3, 2, 1];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = rand / 0.2 * totalWeight;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          this.grantItem(items[i], 1);
          break;
        }
      }
    }
  },

  // 获取今日各目标打卡状态
  async getTodayStatus() {
    const today = dateUtil.today();
    const goals = getGoals();
    const checkins = getCheckins();
    const todayCheckins = checkins.filter(c => c.date === today);
    const allStats = getGoalStats();
    const sessions = getDurationSessions();
    const todaySessions = sessions.filter(s => s.date === today);

    const goalStatuses = goals.map(goal => {
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      const type = goal.type || 'single';

      if (type === 'count') {
        // 多次计数：统计今日打卡次数
        const todayCount = todayCheckins.filter(c => c.goalId === goal.id).length;
        return {
          ...goal, ...stat, type,
          checked: todayCount > 0,
          todayCount,
          targetCount: goal.targetCount || 3,
          countDone: goal.targetCount > 0 && todayCount >= goal.targetCount
        };
      } else if (type === 'duration') {
        // 时长：统计今日总时长（秒）
        const goalSessions = todaySessions.filter(s => s.goalId === goal.id);
        const todayDuration = goalSessions.reduce((sum, s) => sum + s.duration, 0);
        return {
          ...goal, ...stat, type,
          checked: todayDuration > 0,
          todayDuration,
          todayDurationStr: this._formatDuration(todayDuration),
          sessionCount: goalSessions.length
        };
      } else {
        // 单次打卡
        const checked = todayCheckins.some(c => c.goalId === goal.id);
        return { ...goal, ...stat, type, checked };
      }
    });

    const allChecked = goals.length > 0 && goalStatuses.every(g => {
      if (g.type === 'count') return g.countDone;
      if (g.type === 'duration') return g.checked;
      return g.checked;
    });
    const anyChecked = goalStatuses.some(g => g.checked);

    return { code: 0, data: { goals: goalStatuses, allChecked, anyChecked } };
  },

  // 格式化时长秒数
  _formatDuration(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}时${m}分`;
    if (m > 0) return `${m}分${s}秒`;
    return `${m}分`;
  },

  // 获取某目标今日时长会话
  async getTodaySessions(goalId) {
    const today = dateUtil.today();
    const sessions = getDurationSessions();
    const todaySessions = sessions.filter(s => s.date === today && s.goalId === goalId);
    const totalDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      code: 0,
      data: {
        sessions: todaySessions,
        totalDuration,
        totalDurationStr: this._formatDuration(totalDuration)
      }
    };
  },

  // 获取时长类目标的统计数据（goalId 可选，指定则只返回该目标）
  async getDurationStats(days, goalId) {
    days = days || 14;
    const allGoals = getGoals();
    const durationGoals = allGoals.filter(g => g.type === 'duration');
    const sessions = getDurationSessions();
    const now = new Date();

    // 确定要统计的目标
    let targetGoals;
    if (goalId) {
      const g = allGoals.find(g => g.id === goalId);
      if (!g || g.type !== 'duration') {
        return { code: 0, data: { hasDurationGoals: false } };
      }
      targetGoals = [g];
    } else {
      if (durationGoals.length === 0) {
        return { code: 0, data: { hasDurationGoals: false } };
      }
      targetGoals = durationGoals;
    }

    // 筛选相关会话
    const relevantSessions = goalId
      ? sessions.filter(s => s.goalId === goalId)
      : sessions;

    // 最近 N 天每天的总时长
    const dailyTotals = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = dateUtil.format(d);
      const daySessions = relevantSessions.filter(s => s.date === ds);
      const totalSec = daySessions.reduce((sum, s) => sum + s.duration, 0);
      dailyTotals.push({
        date: ds,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        totalSeconds: totalSec,
        totalMinutes: Math.round(totalSec / 60),
        totalStr: this._formatDuration(totalSec)
      });
    }

    // 各目标的时长分布
    const goalDistribution = targetGoals.map(goal => {
      const goalSessions = relevantSessions.filter(s => s.goalId === goal.id);
      const totalSec = goalSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalDays = new Set(goalSessions.map(s => s.date)).size;
      const avgPerDay = totalDays > 0 ? Math.round(totalSec / totalDays) : 0;
      const recent7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = dateUtil.format(d);
        const daySec = goalSessions.filter(s => s.date === ds).reduce((sum, s) => sum + s.duration, 0);
        recent7.push({ date: ds, seconds: daySec, minutes: Math.round(daySec / 60) });
      }
      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        totalSeconds: totalSec,
        totalStr: this._formatDuration(totalSec),
        totalDays,
        avgPerDay,
        avgPerDayStr: this._formatDuration(avgPerDay),
        sessionCount: goalSessions.length,
        recent7
      };
    });

    const grandTotal = goalDistribution.reduce((sum, g) => sum + g.totalSeconds, 0);
    goalDistribution.forEach(g => {
      g.percent = grandTotal > 0 ? Math.round((g.totalSeconds / grandTotal) * 100) : 0;
    });

    // 分析
    const analysis = [];
    if (grandTotal > 0) {
      const dailyAvg = Math.round(grandTotal / days);
      analysis.push(`近${days}天日均投入 ${this._formatDuration(dailyAvg)}`);
      if (goalDistribution.length > 1) {
        const sorted = [...goalDistribution].sort((a, b) => b.totalSeconds - a.totalSeconds);
        analysis.push(`投入最多的是「${sorted[0].name}」，占比 ${sorted[0].percent}%`);
      }
      if (relevantSessions.length > 0) {
        const longest = relevantSessions.reduce((a, b) => a.duration > b.duration ? a : b);
        const goal = allGoals.find(g => g.id === longest.goalId);
        analysis.push(`最长单次 ${this._formatDuration(longest.duration)}（${goal ? goal.name : ''}）`);
      }
    }

    return {
      code: 0,
      data: {
        hasDurationGoals: true,
        grandTotal,
        grandTotalStr: this._formatDuration(grandTotal),
        days,
        dailyTotals,
        goalDistribution,
        showPie: !goalId && goalDistribution.length > 1,
        analysis
      }
    };
  },

  // 获取计数类目标的统计数据
  async getCountStats(days, goalId) {
    days = days || 14;
    const allGoals = getGoals();
    const checkins = getCheckins();
    const now = new Date();

    let targetGoals;
    if (goalId) {
      const g = allGoals.find(g => g.id === goalId);
      if (!g || g.type !== 'count') return { code: 0, data: { hasCountGoals: false } };
      targetGoals = [g];
    } else {
      targetGoals = allGoals.filter(g => g.type === 'count');
      if (targetGoals.length === 0) return { code: 0, data: { hasCountGoals: false } };
    }

    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = dateUtil.format(d);
      const dayCheckins = checkins.filter(c => c.date === ds && targetGoals.some(g => g.id === c.goalId));
      dailyData.push({
        date: ds,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        count: dayCheckins.length
      });
    }

    const goalDetails = targetGoals.map(goal => {
      const goalCheckins = checkins.filter(c => c.goalId === goal.id);
      const totalCheckins = goalCheckins.length;
      const uniqueDays = new Set(goalCheckins.map(c => c.date)).size;
      const recent7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = dateUtil.format(d);
        const cnt = goalCheckins.filter(c => c.date === ds).length;
        recent7.push({ date: ds, count: cnt });
      }
      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        targetCount: goal.targetCount || 3,
        totalCheckins,
        uniqueDays,
        avgPerDay: uniqueDays > 0 ? Math.round(totalCheckins / uniqueDays * 10) / 10 : 0,
        recent7
      };
    });

    return {
      code: 0,
      data: {
        hasCountGoals: true,
        days,
        dailyData,
        goalDetails
      }
    };
  },

  // 获取语录
  async getQuotes(count = 1) {
    const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
    return { code: 0, data: shuffled.slice(0, count) };
  },

  // 获取统计（支持按目标筛选）
  async getStats(goalId) {
    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const global = getGlobalStats();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = dateUtil.getDaysInMonth(year, month);
    const today = dateUtil.today();

    // 筛选打卡记录
    const filteredCheckins = goalId
      ? checkins.filter(c => c.goalId === goalId)
      : checkins;

    // 月度数据
    const monthlyData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayCheckins = filteredCheckins.filter(c => c.date === ds);
      monthlyData.push({
        date: ds,
        checked: dayCheckins.length > 0,
        count: dayCheckins.length
      });
    }

    // 周数据
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = dateUtil.format(d);
      const dayCheckins = filteredCheckins.filter(c => c.date === ds);
      weeklyData.push({
        date: ds,
        day: dateUtil.getWeekDay(d),
        checked: dayCheckins.length > 0,
        count: dayCheckins.length
      });
    }

    // 如果指定了目标，返回该目标的统计
    if (goalId) {
      const stat = allStats[goalId] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      return {
        code: 0,
        data: {
          ...stat,
          monthlyData,
          weeklyData,
          recentChallenges: getChallenges().filter(c => c.goalId === goalId).slice(0, 5)
        }
      };
    }

    // 全局统计
    const allGoalStats = Object.values(allStats);
    const totalDays = allGoalStats.reduce((sum, s) => sum + s.totalDays, 0);
    const maxCurrentStreak = Math.max(0, ...allGoalStats.map(s => s.currentStreak));
    const maxLongestStreak = Math.max(0, ...allGoalStats.map(s => s.longestStreak));

    // 各目标统计
    const goalStats = goals.map(goal => {
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      return { ...goal, ...stat };
    });

    return {
      code: 0,
      data: {
        totalDays,
        currentStreak: maxCurrentStreak,
        longestStreak: maxLongestStreak,
        achievements: global.achievements || [],
        monthlyData,
        weeklyData,
        goalStats,
        recentChallenges: getChallenges().slice(0, 5)
      }
    };
  },

  // 创建挑战（goalId 必填，一个目标绑定一个挑战）
  async createChallenge(targetDays, goalId) {
    if (!goalId) return { code: 1, message: '请选择关联目标' };
    const list = getChallenges();
    // 检查该目标是否已有活跃挑战
    const existing = list.find(c => c.goalId === goalId && c.status === 'active');
    if (existing) return { code: 1, message: '该目标已有进行中的挑战' };
    const ch = {
      _id: 'ch_' + Date.now(),
      targetDays,
      goalId,
      startDate: dateUtil.today(),
      status: 'active',
      createdAt: Date.now()
    };
    list.unshift(ch);
    saveChallenges(list);
    return { code: 0, data: ch };
  },

  // 获取挑战列表
  async getChallenges(goalId) {
    const list = getChallenges();
    if (goalId) {
      return { code: 0, data: list.filter(c => c.goalId === goalId) };
    }
    return { code: 0, data: list };
  },

  // 获取昨日总结
  async getYesterdaySummary() {
    const yesterday = dateUtil.yesterday();
    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const yesterdayCheckins = checkins.filter(c => c.date === yesterday);

    const goalResults = goals.map(goal => {
      const checked = yesterdayCheckins.some(c => c.goalId === goal.id);
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0 };
      return { id: goal.id, name: goal.name, icon: goal.icon, color: goal.color, checked, streak: stat.currentStreak };
    });

    const checkedCount = goalResults.filter(g => g.checked).length;
    const totalCount = goals.length;
    const allChecked = totalCount > 0 && checkedCount === totalCount;

    return {
      code: 0,
      data: {
        date: yesterday,
        checkedCount,
        totalCount,
        allChecked,
        goals: goalResults
      }
    };
  },

  // 获取周报数据
  async getWeeklyReport() {
    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const challenges = getChallenges();
    const now = new Date();

    // 获取本周日期范围（周一到周日）
    const dayOfWeek = now.getDay() || 7; // 周日为7
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push(dateUtil.format(d));
    }

    // 各目标本周打卡情况
    const goalReports = goals.map(goal => {
      const goalCheckins = checkins.filter(c => c.goalId === goal.id);
      const weekCheckins = weekDays.map(day => ({
        date: day,
        checked: goalCheckins.some(c => c.date === day)
      }));
      const weekCount = weekCheckins.filter(w => w.checked).length;
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };

      // 最近7天每天的精确打卡时间
      const recentDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = dateUtil.format(d);
        const dayCheckin = goalCheckins.find(c => c.date === ds);
        if (dayCheckin) {
          const t = new Date(dayCheckin.timestamp);
          const hour = t.getHours();
          const minute = t.getMinutes();
          const second = t.getSeconds();
          // 时段：凌晨0-5, 早晨6-8, 上午9-11, 中午12-13, 下午14-17, 晚上18-21, 深夜22-23
          let period = '深夜';
          if (hour >= 0 && hour < 6) period = '凌晨';
          else if (hour < 9) period = '早晨';
          else if (hour < 12) period = '上午';
          else if (hour < 14) period = '中午';
          else if (hour < 18) period = '下午';
          else if (hour < 22) period = '晚上';
          recentDays.push({
            date: ds,
            checked: true,
            hour, minute, second,
            timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
            period,
            // 用于图表定位：将一天24小时映射到0-100%
            hourPercent: Math.round(((hour * 3600 + minute * 60 + second) / 86400) * 100)
          });
        } else {
          recentDays.push({
            date: ds,
            checked: false,
            hour: null, minute: null, second: null,
            timeStr: '--:--:--',
            period: '',
            hourPercent: 0
          });
        }
      }

      // 时段统计
      const periodNames = ['凌晨', '早晨', '上午', '中午', '下午', '晚上', '深夜'];
      const periodCountsArr = periodNames.map(name => {
        const cnt = recentDays.filter(d => d.checked && d.period === name).length;
        return { name, count: cnt };
      });
      const mainPeriod = periodCountsArr.reduce((a, b) => a.count > b.count ? a : b);
      const timePattern = mainPeriod.count > 0 ? mainPeriod.name : '';

      return {
        ...goal,
        ...stat,
        weekCount,
        weekRate: Math.round((weekCount / 7) * 100),
        weekCheckins,
        recentDays,
        periodCounts: periodCountsArr,
        timePattern
      };
    });

    // 本周总打卡数
    const totalWeekCheckins = checkins.filter(c => weekDays.includes(c.date)).length;
    const totalPossible = goals.length * 7;
    const weekRate = totalPossible > 0 ? Math.round((totalWeekCheckins / totalPossible) * 100) : 0;

    // 挑战完成情况
    const activeChallenges = challenges.filter(c => c.status === 'active').map(ch => {
      const startDate = new Date(ch.startDate);
      const completedDays = Math.min(
        Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
        ch.targetDays
      );
      const progress = Math.min(100, Math.round((completedDays / ch.targetDays) * 100));
      const goal = goals.find(g => g.id === ch.goalId);
      return {
        ...ch,
        completedDays,
        progress,
        goalName: goal ? goal.name : '未知目标',
        goalIcon: goal ? goal.icon : '🎯'
      };
    });

    // 数据分析
    const analysis = [];
    if (weekRate >= 90) {
      analysis.push('本周打卡率极高，保持出色状态！');
    } else if (weekRate >= 70) {
      analysis.push('本周表现不错，继续坚持。');
    } else if (weekRate >= 50) {
      analysis.push('本周打卡过半，还有提升空间。');
    } else {
      analysis.push('本周打卡较少，下周加油！');
    }

    // 找出最佳目标
    if (goalReports.length > 0) {
      const best = goalReports.reduce((a, b) => a.weekRate > b.weekRate ? a : b);
      if (best.weekRate > 0) {
        analysis.push(`${best.name}完成率最高(${best.weekRate}%)，是你的强项。`);
      }
    }

    // 找出需改进的目标
    const weakGoals = goalReports.filter(g => g.weekRate < 50);
    if (weakGoals.length > 0) {
      analysis.push(`${weakGoals.map(g => g.name).join('、')}需要加强，建议设定提醒。`);
    }

    // 时段分析
    const allPeriodCounts = {};
    goalReports.forEach(g => {
      g.periodCounts.forEach(p => { allPeriodCounts[p.name] = (allPeriodCounts[p.name] || 0) + p.count; });
    });
    const sortedPeriods = Object.entries(allPeriodCounts).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
    if (sortedPeriods.length > 0) {
      const topPeriod = sortedPeriods[0][0];
      const topCount = sortedPeriods[0][1];
      analysis.push(`你最常在${topPeriod}打卡（${topCount}次），这是你的高效时段。`);
    }
    if (sortedPeriods.length > 1) {
      const earlyBird = (allPeriodCounts['早晨'] || 0) + (allPeriodCounts['上午'] || 0);
      const nightOwl = (allPeriodCounts['晚上'] || 0) + (allPeriodCounts['深夜'] || 0);
      if (earlyBird > nightOwl * 2) {
        analysis.push('你是早起型选手，早晨打卡习惯很好！');
      } else if (nightOwl > earlyBird * 2) {
        analysis.push('你偏向夜间打卡，建议尝试提前到早晨，效果可能更好。');
      }
    }

    // 找出每天最早和最晚打卡时间
    const allTimes = [];
    goalReports.forEach(g => {
      g.recentDays.filter(d => d.checked).forEach(d => {
        allTimes.push(d.hour * 3600 + d.minute * 60 + d.second);
      });
    });
    if (allTimes.length > 0) {
      const earliest = Math.min(...allTimes);
      const latest = Math.max(...allTimes);
      const fmtTime = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
      if (earliest !== latest) {
        analysis.push(`打卡时间范围：${fmtTime(earliest)} ~ ${fmtTime(latest)}。`);
      }
    }

    return {
      code: 0,
      data: {
        weekStart: weekDays[0],
        weekEnd: weekDays[6],
        totalWeekCheckins,
        weekRate,
        goalReports,
        activeChallenges,
        analysis
      }
    };
  },

  // 获取挑战统计数据
  async getChallengeStats() {
    const challenges = getChallenges();
    const now = new Date();

    // 统计数据
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const failedChallenges = challenges.filter(c => c.status === 'failed').length;

    // 计算总挑战天数
    let totalChallengeDays = 0;
    challenges.forEach(ch => {
      if (ch.status === 'completed') {
        totalChallengeDays += ch.targetDays;
      } else if (ch.status === 'active') {
        const startDate = new Date(ch.startDate);
        const completedDays = Math.min(
          Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
          ch.targetDays
        );
        totalChallengeDays += completedDays;
      }
    });

    // 当前进行中的挑战详情
    const activeList = challenges.filter(c => c.status === 'active').map(ch => {
      const startDate = new Date(ch.startDate);
      const completedDays = Math.min(
        Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
        ch.targetDays
      );
      const progress = Math.min(100, Math.round((completedDays / ch.targetDays) * 100));
      const goals = getGoals();
      const goal = goals.find(g => g.id === ch.goalId);
      return {
        ...ch,
        completedDays,
        progress,
        goalName: goal ? goal.name : '未知目标',
        goalIcon: goal ? goal.icon : '🎯',
        goalColor: goal ? goal.color : '#5B9A6F'
      };
    });

    return {
      code: 0,
      data: {
        totalChallenges,
        completedChallenges,
        activeChallenges,
        failedChallenges,
        totalChallengeDays,
        activeList
      }
    };
  },

  // 获取挑战勋章
  async getChallengeMedals() {
    const challenges = getChallenges();
    const goals = getGoals();
    const completedChallenges = challenges.filter(c => c.status === 'completed');

    // 统计每个勋章的获得情况
    const medalMap = {};

    completedChallenges.forEach(ch => {
      const goal = goals.find(g => g.id === ch.goalId);
      const goalName = goal ? goal.name : '未知目标';
      const goalIcon = goal ? goal.icon : '🎯';

      // 按天数匹配勋章
      CHALLENGE_MEDALS.forEach(medal => {
        if (medal.id.startsWith('challenge_') && medal.days > 0 && ch.targetDays >= medal.days) {
          if (!medalMap[medal.id]) {
            medalMap[medal.id] = {
              ...medal,
              count: 0,
              goals: []
            };
          }
          medalMap[medal.id].count++;
          medalMap[medal.id].goals.push({ goalName, goalIcon });
        }
      });

      // 完成第一个挑战
      if (!medalMap['challenge_first']) {
        medalMap['challenge_first'] = {
          ...CHALLENGE_MEDALS.find(m => m.id === 'challenge_first'),
          count: 0,
          goals: []
        };
      }
      medalMap['challenge_first'].count++;
      medalMap['challenge_first'].goals.push({ goalName, goalIcon });
    });

    // 累计完成3个和5个挑战
    if (completedChallenges.length >= 3) {
      const medal = CHALLENGE_MEDALS.find(m => m.id === 'challenge_3');
      medalMap['challenge_3'] = {
        ...medal,
        count: 1,
        goals: [{ goalName: '累计完成', goalIcon: '🏆' }]
      };
    }
    if (completedChallenges.length >= 5) {
      const medal = CHALLENGE_MEDALS.find(m => m.id === 'challenge_5');
      medalMap['challenge_5'] = {
        ...medal,
        count: 1,
        goals: [{ goalName: '累计完成', goalIcon: '🏆' }]
      };
    }

    // 只返回已获得的勋章
    const unlockedMedals = Object.values(medalMap).filter(m => m.count > 0);

    return {
      code: 0,
      data: {
        unlockedMedals,
        totalMedals: CHALLENGE_MEDALS.length,
        unlockedCount: unlockedMedals.length
      }
    };
  },

  // 获取某个目标的挑战情况
  async getGoalChallenges(goalId) {
    const challenges = getChallenges();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    const now = new Date();

    const goalChallenges = challenges.filter(c => c.goalId === goalId).map(ch => {
      const startDate = new Date(ch.startDate);
      let completedDays = 0;
      let progress = 0;

      if (ch.status === 'active') {
        completedDays = Math.min(
          Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
          ch.targetDays
        );
        progress = Math.min(100, Math.round((completedDays / ch.targetDays) * 100));
      } else if (ch.status === 'completed') {
        completedDays = ch.targetDays;
        progress = 100;
      }

      return {
        ...ch,
        completedDays,
        progress,
        goalName: goal ? goal.name : '未知目标',
        goalIcon: goal ? goal.icon : '🎯',
        goalColor: goal ? goal.color : '#5B9A6F'
      };
    });

    // 统计
    const totalChallenges = goalChallenges.length;
    const completedChallenges = goalChallenges.filter(c => c.status === 'completed').length;
    const activeChallenges = goalChallenges.filter(c => c.status === 'active').length;

    return {
      code: 0,
      data: {
        goalId,
        goalName: goal ? goal.name : '',
        goalIcon: goal ? goal.icon : '',
        totalChallenges,
        completedChallenges,
        activeChallenges,
        challenges: goalChallenges
      }
    };
  },

  // 获取所有挑战勋章定义
  getChallengeMedalDefs() {
    return CHALLENGE_MEDALS;
  }
};

module.exports = api;
