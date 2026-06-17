// 守心小程序 - 配置模块
// 包含所有常量、预设、模板等配置数据

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
  { content: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《中庸》', category: '修身' },
  { content: '富贵不能淫，贫贱不能移，威武不能屈，此之谓大丈夫。', author: '孟子', category: '修身' },
  // ===== 坚忍 =====
  { content: '天行健，君子以自强不息。地势坤，君子以厚德载物。', author: '《周易》', category: '坚忍' },
  { content: '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。', author: '苏轼', category: '坚忍' },
  { content: '路漫漫其修远兮，吾将上下而求索。', author: '屈原', category: '坚忍' },
  { content: '千磨万击还坚劲，任尔东西南北风。', author: '郑燮', category: '坚忍' },
  { content: '我走得很慢，但我从不后退。', author: '林肯', category: '坚忍' },
  { content: '那些杀不死你的，终将使你变得更强大。', author: '尼采', category: '坚忍' },
  { content: '锲而舍之，朽木不折；锲而不舍，金石可镂。', author: '荀子', category: '坚忍' },
  { content: '行百里者半九十。', author: '《战国策》', category: '坚忍' },
  // ===== 省思 =====
  { content: '人的一切痛苦，本质上都是对自己无能的愤怒。', author: '王小波', category: '省思' },
  { content: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采', category: '省思' },
  { content: '你的时间有限，不要为别人而活。', author: '乔布斯', category: '省思' },
  { content: 'Stay hungry, Stay foolish.', author: '乔布斯', category: '省思' },
  { content: '逝者如斯夫，不舍昼夜。', author: '孔子', category: '省思' },
  { content: '盛年不重来，一日难再晨。及时当勉励，岁月不待人。', author: '陶渊明', category: '省思' },
  // ===== 智慧 =====
  { content: '知之为知之，不知为不知，是知也。', author: '孔子', category: '智慧' },
  { content: '学而不思则罔，思而不学则殆。', author: '孔子', category: '智慧' },
  { content: '三人行，必有我师焉。择其善者而从之，其不善者而改之。', author: '孔子', category: '智慧' },
  { content: '己所不欲，勿施于人。', author: '孔子', category: '智慧' },
  { content: '满招损，谦受益。', author: '《尚书》', category: '智慧' },
  { content: '勿以恶小而为之，勿以善小而不为。', author: '刘备', category: '智慧' },
  { content: '天下难事，必作于易；天下大事，必作于细。', author: '老子', category: '智慧' },

  // ===== 高格调语录 =====
  { content: '万物皆有裂痕，那是光照进来的地方。', author: '莱昂纳德·科恩', category: '省思' },
  { content: '你生而有翼，为何甘愿匍匐前行？', author: '鲁米', category: '坚忍' },
  { content: '我们都在阴沟里，但仍有人仰望星空。', author: '奥斯卡·王尔德', category: '省思' },
  { content: '人生天地之间，若白驹过隙，忽然而已。', author: '庄子', category: '省思' },
  { content: '不乱于心，不困于情，不畏将来，不念过往。', author: '丰子恺', category: '修身' },
  { content: '山中无甲子，寒尽不知年。', author: '《增广贤文》', category: '修身' },
  { content: '浮世三千，吾爱有三：日月与卿。日为朝，月为暮，卿为朝朝暮暮。', author: '《暮光之城》', category: '省思' },
  { content: '人生如逆旅，我亦是行人。', author: '苏轼', category: '省思' },
  { content: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', author: '苏轼', category: '坚忍' },
  { content: '回首向来萧瑟处，归去，也无风雨也无晴。', author: '苏轼', category: '省思' },
  { content: '人间有味是清欢。', author: '苏轼', category: '智慧' },
  { content: '此心光明，亦复何言。', author: '王阳明', category: '修身' },
  { content: '你未看此花时，此花与汝心同归于寂；你来看此花时，则此花颜色一时明白起来。', author: '王阳明', category: '智慧' },
  { content: '知行合一。', author: '王阳明', category: '智慧' },
  { content: '立志而圣则圣矣，立志而贤则贤矣。', author: '王阳明', category: '坚忍' },
  { content: '破山中贼易，破心中贼难。', author: '王阳明', category: '修身' },
  { content: '天地本宽，而鄙者自隘；风花雪月本闲，而扰攘者自冗。', author: '《菜根谭》', category: '修身' },
  { content: '宠辱不惊，看庭前花开花落；去留无意，望天上云卷云舒。', author: '《菜根谭》', category: '修身' },
  { content: '风来疏竹，风过而竹不留声；雁渡寒潭，雁去而潭不留影。', author: '《菜根谭》', category: '修身' },
  { content: '岁月本长，而忙者自促；天地本宽，而鄙者自隘。', author: '《菜根谭》', category: '修身' },
  { content: '花看半开，酒饮微醺。', author: '《菜根谭》', category: '智慧' },
  { content: '人生到处知何似，应似飞鸿踏雪泥。', author: '苏轼', category: '省思' },
  { content: '世事一场大梦，人生几度秋凉。', author: '苏轼', category: '省思' },
  { content: '且将新火试新茶，诗酒趁年华。', author: '苏轼', category: '省思' },
  { content: '休对故人思故国，且将新火试新茶。', author: '苏轼', category: '省思' },
  { content: '一点浩然气，千里快哉风。', author: '苏轼', category: '坚忍' },
  { content: '莫听穿林打叶声，何妨吟啸且徐行。', author: '苏轼', category: '坚忍' },
  { content: '人生如梦，一尊还酹江月。', author: '苏轼', category: '省思' },
  { content: '大江东去，浪淘尽，千古风流人物。', author: '苏轼', category: '省思' },
  { content: '但愿人长久，千里共婵娟。', author: '苏轼', category: '省思' },
  { content: '人生自是有情痴，此恨不关风与月。', author: '欧阳修', category: '省思' },
  { content: '泪眼问花花不语，乱红飞过秋千去。', author: '欧阳修', category: '省思' },
  { content: '庭院深深深几许，杨柳堆烟，帘幕无重数。', author: '欧阳修', category: '省思' },
  { content: '夜月一帘幽梦，春风十里柔情。', author: '秦观', category: '省思' },
  { content: '两情若是久长时，又岂在朝朝暮暮。', author: '秦观', category: '省思' },
  { content: '金风玉露一相逢，便胜却人间无数。', author: '秦观', category: '省思' },
  { content: '此情无计可消除，才下眉头，却上心头。', author: '李清照', category: '省思' },
  { content: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。', author: '李清照', category: '省思' },
  { content: '知否，知否？应是绿肥红瘦。', author: '李清照', category: '省思' },
  { content: '试问卷帘人，却道海棠依旧。', author: '李清照', category: '省思' },
  { content: '众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。', author: '辛弃疾', category: '省思' },
  { content: '醉里挑灯看剑，梦回吹角连营。', author: '辛弃疾', category: '坚忍' },
  { content: '了却君王天下事，赢得生前身后名。', author: '辛弃疾', category: '坚忍' },
  { content: '想当年，金戈铁马，气吞万里如虎。', author: '辛弃疾', category: '坚忍' },
  { content: '最喜小儿亡赖，溪头卧剥莲蓬。', author: '辛弃疾', category: '省思' },
  { content: '稻花香里说丰年，听取蛙声一片。', author: '辛弃疾', category: '省思' },
  { content: '明月别枝惊鹊，清风半夜鸣蝉。', author: '辛弃疾', category: '省思' },
  { content: '少年不识愁滋味，爱上层楼。爱上层楼，为赋新词强说愁。', author: '辛弃疾', category: '省思' },
  { content: '而今识尽愁滋味，欲说还休。欲说还休，却道天凉好个秋。', author: '辛弃疾', category: '省思' },
  { content: '落花人独立，微雨燕双飞。', author: '晏几道', category: '省思' },
  { content: '当时明月在，曾照彩云归。', author: '晏几道', category: '省思' },
  { content: '从别后，忆相逢，几回魂梦与君同。', author: '晏几道', category: '省思' },
  { content: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德', category: '省思' },
  { content: '等闲变却故人心，却道故人心易变。', author: '纳兰性德', category: '省思' },
  { content: '赌书消得泼茶香，当时只道是寻常。', author: '纳兰性德', category: '省思' },
  { content: '一生一代一双人，争教两处销魂。', author: '纳兰性德', category: '省思' },
  { content: '浮生若梦，为欢几何？', author: '李白', category: '省思' },
  { content: '今人不见古时月，今月曾经照古人。', author: '李白', category: '省思' },
  { content: '长风破浪会有时，直挂云帆济沧海。', author: '李白', category: '坚忍' },
  { content: '天生我材必有用，千金散尽还复来。', author: '李白', category: '坚忍' },
  { content: '仰天大笑出门去，我辈岂是蓬蒿人。', author: '李白', category: '坚忍' },
  { content: '安能摧眉折腰事权贵，使我不得开心颜。', author: '李白', category: '修身' },
  { content: '抽刀断水水更流，举杯消愁愁更愁。', author: '李白', category: '省思' },
  { content: '花间一壶酒，独酌无相亲。', author: '李白', category: '省思' },
  { content: '举杯邀明月，对影成三人。', author: '李白', category: '省思' },
  { content: '相看两不厌，只有敬亭山。', author: '李白', category: '省思' },
  { content: '众鸟高飞尽，孤云独去闲。', author: '李白', category: '省思' },
  { content: '此夜曲中闻折柳，何人不起故园情。', author: '李白', category: '省思' },
  { content: '春风不相识，何事入罗帏。', author: '李白', category: '省思' },
  { content: '云想衣裳花想容，春风拂槛露华浓。', author: '李白', category: '省思' },
  { content: '一枝红艳露凝香，云雨巫山枉断肠。', author: '李白', category: '省思' },
  { content: '解释春风无限恨，沉香亭北倚阑干。', author: '李白', category: '省思' },
  { content: '美人卷珠帘，深坐颦蛾眉。', author: '李白', category: '省思' },
  { content: '但见泪痕湿，不知心恨谁。', author: '李白', category: '省思' },
  { content: '落日五湖游，烟波处处愁。', author: '李白', category: '省思' },
  { content: '浮沉千古事，谁与问东流。', author: '李白', category: '省思' },
  { content: '天地有正气，杂然赋流形。', author: '文天祥', category: '修身' },
  { content: '人生自古谁无死？留取丹心照汗青。', author: '文天祥', category: '坚忍' },
  { content: '臣心一片磁针石，不指南方不肯休。', author: '文天祥', category: '坚忍' },
  { content: '时穷节乃见，一一垂丹青。', author: '文天祥', category: '修身' },
  { content: '风檐展书读，古道照颜色。', author: '文天祥', category: '修身' },
  { content: '是气所磅礴，凛烈万古存。', author: '文天祥', category: '修身' },
  { content: '当其贯日月，生死安足论。', author: '文天祥', category: '坚忍' },
  { content: '地维赖以立，天柱赖以尊。', author: '文天祥', category: '修身' },
  { content: '三纲实系命，道义为之根。', author: '文天祥', category: '修身' },
  { content: '皇路当清夷，含和吐明庭。', author: '文天祥', category: '修身' },
  { content: '时穷节乃见，一一垂丹青。', author: '文天祥', category: '修身' },
  { content: '在齐太史简，在晋董狐笔。', author: '文天祥', category: '修身' },
  { content: '在秦张良椎，在汉苏武节。', author: '文天祥', category: '修身' },
  { content: '为严将军头，为嵇侍中血。', author: '文天祥', category: '修身' },
  { content: '为张睢阳齿，为颜常山舌。', author: '文天祥', category: '修身' },
  { content: '或为辽东帽，清操厉冰雪。', author: '文天祥', category: '修身' },
  { content: '或为出师表，鬼神泣壮烈。', author: '文天祥', category: '修身' },
  { content: '或为渡江楫，慷慨吞胡羯。', author: '文天祥', category: '修身' },
  { content: '或为击贼笏，逆竖头破裂。', author: '文天祥', category: '修身' },
  { content: '是气所磅礴，凛烈万古存。', author: '文天祥', category: '修身' },
  { content: '当其贯日月，生死安足论。', author: '文天祥', category: '坚忍' },
  { content: '地维赖以立，天柱赖以尊。', author: '文天祥', category: '修身' },
  { content: '三纲实系命，道义为之根。', author: '文天祥', category: '修身' },
  { content: '皇路当清夷，含和吐明庭。', author: '文天祥', category: '修身' },
  { content: '时穷节乃见，一一垂丹青。', author: '文天祥', category: '修身' }
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

// 目标模板配置
const GOAL_TEMPLATES = [
  // 健康生活
  { id: 'tpl_morning', name: '早起', icon: '🌅', color: '#E88D67', type: 'single', category: '健康生活', desc: '每天早起，拥抱美好一天' },
  { id: 'tpl_sleep', name: '早睡', icon: '🌙', color: '#8B9DC3', type: 'single', category: '健康生活', desc: '规律作息，健康生活' },
  { id: 'tpl_exercise', name: '运动', icon: '🏃', color: '#5B9A6F', type: 'single', category: '健康生活', desc: '坚持运动，强身健体' },
  { id: 'tpl_water', name: '喝水', icon: '💧', color: '#5BAEBF', type: 'count', targetCount: 8, category: '健康生活', desc: '每天8杯水，保持健康' },
  { id: 'tpl_meal', name: '三餐', icon: '🍽️', color: '#E8B86D', type: 'count', targetCount: 3, category: '健康生活', desc: '按时吃饭，规律饮食' },
  { id: 'tpl_yoga', name: '瑜伽', icon: '🧘‍♀️', color: '#9B72CF', type: 'single', category: '健康生活', desc: '每天瑜伽，身心平衡' },
  { id: 'tpl_walk', name: '散步', icon: '🚶', color: '#7BC47F', type: 'single', category: '健康生活', desc: '饭后散步，促进消化' },
  // 学习成长
  { id: 'tpl_read', name: '阅读', icon: '📖', color: '#6B8DD6', type: 'single', category: '学习成长', desc: '每天阅读30分钟' },
  { id: 'tpl_study', name: '学习', icon: '📚', color: '#9B72CF', type: 'single', category: '学习成长', desc: '坚持学习，不断进步' },
  { id: 'tpl_english', name: '背单词', icon: '🔤', color: '#5BAEBF', type: 'single', category: '学习成长', desc: '每天背单词，日积月累' },
  { id: 'tpl_practice', name: '练字', icon: '✍️', color: '#2C3E2D', type: 'single', category: '学习成长', desc: '静心练字，修身养性' },
  { id: 'tpl_code', name: '编程', icon: '💻', color: '#5BAEBF', type: 'single', category: '学习成长', desc: '每天写代码，提升技能' },
  { id: 'tpl_skill', name: '学技能', icon: '🎯', color: '#E87461', type: 'single', category: '学习成长', desc: '学习新技能，拓展能力' },
  // 心灵修养
  { id: 'tpl_meditate', name: '冥想', icon: '🧘', color: '#9B72CF', type: 'single', category: '心灵修养', desc: '静心冥想，放松身心' },
  { id: 'tpl_journal', name: '写日记', icon: '📝', color: '#D4A04A', type: 'single', category: '心灵修养', desc: '记录生活，反思成长' },
  { id: 'tpl_grateful', name: '感恩', icon: '🙏', color: '#E8B86D', type: 'single', category: '心灵修养', desc: '每天记录3件感恩的事' },
  { id: 'tpl_breathe', name: '深呼吸', icon: '🌬️', color: '#5BAEBF', type: 'single', category: '心灵修养', desc: '每天深呼吸，放松身心' },
  // 兴趣爱好
  { id: 'tpl_music', name: '练琴', icon: '🎵', color: '#D46B8C', type: 'single', category: '兴趣爱好', desc: '坚持练习，享受音乐' },
  { id: 'tpl_draw', name: '画画', icon: '🎨', color: '#B8A0D4', type: 'single', category: '兴趣爱好', desc: '发挥创意，艺术表达' },
  { id: 'tpl_cook', name: '做饭', icon: '👨‍🍳', color: '#E8B86D', type: 'single', category: '兴趣爱好', desc: '自己动手，享受美食' },
  { id: 'tpl_clean', name: '整理', icon: '🧹', color: '#5BAEBF', type: 'single', category: '兴趣爱好', desc: '整洁环境，清爽心情' },
  { id: 'tpl_photo', name: '摄影', icon: '📷', color: '#6B8DD6', type: 'single', category: '兴趣爱好', desc: '记录美好瞬间' },
  { id: 'tpl_garden', name: '养花', icon: '🌱', color: '#7BC47F', type: 'single', category: '兴趣爱好', desc: '照料花草，亲近自然' }
];

// 成就定义
const ACHIEVEMENTS = [
  // 连续打卡成就
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
  // 累计打卡成就
  { id: 'total_10', name: '十日积累', desc: '累计打卡10天', days: 10, type: 'total' },
  { id: 'total_50', name: '半百之志', desc: '累计打卡50天', days: 50, type: 'total' },
  { id: 'total_100', name: '百日修行', desc: '累计打卡100天', days: 100, type: 'total' },
  { id: 'total_200', name: '二百里程', desc: '累计打卡200天', days: 200, type: 'total' },
  { id: 'total_365', name: '一年有成', desc: '累计打卡365天', days: 365, type: 'total' },
  // 多目标成就
  { id: 'multi_2', name: '双管齐下', desc: '同时进行2个目标', days: 2, type: 'goals' },
  { id: 'multi_3', name: '三心二意', desc: '同时进行3个目标', days: 3, type: 'goals' },
  { id: 'multi_5', name: '多才多艺', desc: '同时进行5个目标', days: 5, type: 'goals' },
  // 时段成就
  { id: 'early_bird', name: '早起鸟儿', desc: '在早晨6点前打卡', days: 1, type: 'time' },
  { id: 'night_owl', name: '夜猫子', desc: '在晚上11点后打卡', days: 1, type: 'time' }
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

// 宠物系统配置
const PET_TYPES = {
  pet_seedling: { name: '小树苗', icon: '🌱', desc: '象征自律成长', stages: { baby: { icon: '🌱', name: '幼年树苗' }, grow: { icon: '🌿', name: '成长小树' }, adult: { icon: '🌳', name: '参天大树' } } },
  pet_cat: { name: '小猫咪', icon: '🐱', desc: '温柔陪伴你成长', stages: { baby: { icon: '🐱', name: '幼年猫咪' }, grow: { icon: '🐈', name: '优雅猫咪' }, adult: { icon: '🦁', name: '狮王猫咪' } } },
  pet_dog: { name: '小柴犬', icon: '🐶', desc: '忠诚守护你的目标', stages: { baby: { icon: '🐶', name: '幼年柴犬' }, grow: { icon: '🐕', name: '活力柴犬' }, adult: { icon: '🐺', name: '狼王柴犬' } } },
  pet_rabbit: { name: '小兔子', icon: '🐰', desc: '活力满满的伙伴', stages: { baby: { icon: '🐰', name: '幼年兔子' }, grow: { icon: '🐇', name: '跳跃兔子' }, adult: { icon: '🦌', name: '灵兔仙子' } } },
  pet_panda: { name: '小熊猫', icon: '🐼', desc: '国宝级萌宠', stages: { baby: { icon: '🐼', name: '幼年熊猫' }, grow: { icon: '🐻', name: '憨厚熊猫' }, adult: { icon: '🐻‍❄️', name: '冰雪熊猫' } } },
  pet_dragon: { name: '小飞龙', icon: '🐲', desc: '守护你的梦想', stages: { baby: { icon: '🐲', name: '幼年飞龙' }, grow: { icon: '🐉', name: '成长飞龙' }, adult: { icon: '🐲', name: '神圣巨龙' } } },
  pet_fox: { name: '小狐狸', icon: '🦊', desc: '聪明伶俐的伙伴', stages: { baby: { icon: '🦊', name: '幼年狐狸' }, grow: { icon: '🦊', name: '灵狐' }, adult: { icon: '🦊', name: '九尾灵狐' } } },
  pet_penguin: { name: '小企鹅', icon: '🐧', desc: '坚持到底的象征', stages: { baby: { icon: '🐧', name: '幼年企鹅' }, grow: { icon: '🐧', name: '绅士企鹅' }, adult: { icon: '🐧', name: '帝王企鹅' } } },
  pet_hamster: { name: '小仓鼠', icon: '🐹', desc: '勤劳的小可爱', stages: { baby: { icon: '🐹', name: '幼年仓鼠' }, grow: { icon: '🐹', name: '活力仓鼠' }, adult: { icon: '🐹', name: '黄金仓鼠' } } },
  pet_turtle: { name: '小乌龟', icon: '🐢', desc: '稳扎稳打的智者', stages: { baby: { icon: '🐢', name: '幼年乌龟' }, grow: { icon: '🐢', name: '灵龟' }, adult: { icon: '🐢', name: '神龟' } } },
  pet_butterfly: { name: '小蝴蝶', icon: '🦋', desc: '破茧成蝶的蜕变', stages: { baby: { icon: '🐛', name: '毛毛虫' }, grow: { icon: '🪱', name: '蛹' }, adult: { icon: '🦋', name: '彩蝶' } } },
  pet_unicorn: { name: '小独角兽', icon: '🦄', desc: '梦想与奇迹的化身', stages: { baby: { icon: '🦄', name: '幼年独角兽' }, grow: { icon: '🦄', name: '银角独角兽' }, adult: { icon: '🦄', name: '彩虹独角兽' } } }
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

// 道具配置
const ITEM_TYPES = {
  feed: { name: '普通饲料', icon: '🌾', exp: 10, desc: '每日打卡获得' },
  fruit: { name: '营养果实', icon: '🍎', exp: 20, desc: '连续打卡3天获得' },
  candy: { name: '能量糖果', icon: '🍬', exp: 15, desc: '完成番茄钟获得' },
  crystal: { name: '魔法水晶', icon: '💎', exp: 50, desc: '完成4个番茄钟获得' },
  star: { name: '星光碎片', icon: '⭐', exp: 100, desc: '连续打卡7天获得' },
  rainbow: { name: '彩虹宝箱', icon: '🌈', exp: 200, desc: '完成挑战获得' }
};

// 装扮配置
const COSTUME_TYPES = {
  hat_1: { name: '小礼帽', icon: '🎩', part: 'hat', desc: '优雅绅士' },
  hat_2: { name: '皇冠', icon: '👑', part: 'hat', desc: '王者风范' },
  hat_3: { name: '花环', icon: '💐', part: 'hat', desc: '清新自然' },
  hat_4: { name: '巫师帽', icon: '🧙', part: 'hat', desc: '神秘魔法' },
  hat_5: { name: '生日帽', icon: '🎉', part: 'hat', desc: '欢乐庆祝' },
  hat_6: { name: '蝴蝶结', icon: '🎀', part: 'hat', desc: '俏皮可爱' },
  hat_7: { name: '恶魔角', icon: '😈', part: 'hat', desc: '调皮捣蛋' },
  hat_8: { name: '天使环', icon: '😇', part: 'hat', desc: '纯洁善良' },
  hat_9: { name: '厨师帽', icon: '👨‍🍳', part: 'hat', desc: '美食达人' },
  hat_10: { name: '博士帽', icon: '🎓', part: 'hat', desc: '学识渊博' },
  hat_11: { name: '王冠', icon: '♛', part: 'hat', desc: '尊贵典雅' },
  hat_12: { name: '樱花', icon: '🌸', part: 'hat', desc: '浪漫唯美' },
  glasses_1: { name: '墨镜', icon: '🕶️', part: 'glasses', desc: '酷炫十足' },
  glasses_2: { name: '圆框眼镜', icon: '👓', part: 'glasses', desc: '文艺范儿' },
  glasses_3: { name: '爱心眼镜', icon: '😍', part: 'glasses', desc: '满眼都是爱' },
  glasses_4: { name: '星星眼镜', icon: '🤩', part: 'glasses', desc: '闪闪发光' }
};

// 背景配置
const BG_TYPES = {
  bg_white: { name: '纯白', icon: '⬜', desc: '简约纯净', gradient: 'linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%)' },
  bg_cream: { name: '奶油白', icon: '🍦', desc: '温暖柔和', gradient: 'linear-gradient(180deg, #fffdf7 0%, #fef9ef 100%)' },
  bg_mint: { name: '薄荷绿', icon: '🌿', desc: '清新自然', gradient: 'linear-gradient(180deg, #f0faf6 0%, #e8f5f0 100%)' },
  bg_sky: { name: '天空蓝', icon: '☁️', desc: '清爽明亮', gradient: 'linear-gradient(180deg, #f0f7ff 0%, #e8f2ff 100%)' },
  bg_pink: { name: '樱花粉', icon: '🌸', desc: '温柔浪漫', gradient: 'linear-gradient(180deg, #fff5f7 0%, #fef0f2 100%)' },
  bg_lavender: { name: '薰衣草', icon: '💜', desc: '优雅恬静', gradient: 'linear-gradient(180deg, #f8f5ff 0%, #f2eeff 100%)' }
};

// 每日一问
const DAILY_QUESTIONS = [
  // 感悟类
  { question: '如果今天是你生命的最后一天，你会怎么过？', category: '感悟' },
  { question: '十年后的你会感谢今天做了什么？', category: '未来' },
  { question: '今天你做的哪个决定最能代表真实的自己？', category: '自我' },
  { question: '如果可以给今天的自己一个建议，你会说什么？', category: '反思' },
  { question: '今天你最想记住的一个瞬间是什么？', category: '记忆' },

  // 成长类
  { question: '今天你克服了什么困难？', category: '勇气' },
  { question: '今天你学到了什么可以教给别人的东西？', category: '分享' },
  { question: '今天你做了什么让自己感到骄傲的小事？', category: '成就' },
  { question: '今天你如何走出舒适区了？', category: '突破' },
  { question: '今天你对自己的哪个习惯感到满意？', category: '习惯' },

  // 生活类
  { question: '今天你最享受的一顿饭是什么？', category: '美食' },
  { question: '今天你听到的最动听的声音是什么？', category: '感官' },
  { question: '今天你看到的最美的一幕是什么？', category: '美好' },
  { question: '今天你最放松的时刻是什么时候？', category: '放松' },
  { question: '今天你最投入做的一件事是什么？', category: '专注' },

  // 人际类
  { question: '今天谁让你感到温暖？', category: '温暖' },
  { question: '今天你想对谁说声谢谢？', category: '感恩' },
  { question: '今天你如何让别人的一天变得更好？', category: '善良' },
  { question: '今天你最想和谁分享你的快乐？', category: '分享' },
  { question: '今天谁的话对你产生了影响？', category: '影响' },

  // 创意类
  { question: '如果今天是一首歌，它会是什么旋律？', category: '创意' },
  { question: '如果用一种颜色形容今天，你会选什么？', category: '想象' },
  { question: '如果今天发生的事写成故事，标题是什么？', category: '故事' },
  { question: '如果可以重播今天的一个片段，你会选哪个？', category: '回放' },
  { question: '如果今天有一种味道，那会是什么？', category: '通感' }
];

// 习惯小贴士
const HABIT_TIPS = [
  // 科学方法
  { tip: '两分钟法则：新习惯不超过2分钟就能完成', category: '技巧' },
  { tip: '习惯叠加：在旧习惯后立即开始新习惯', category: '技巧' },
  { tip: '环境设计：把好习惯的工具放在显眼处', category: '技巧' },
  { tip: '身份认同：告诉自己"我是一个坚持的人"', category: '心理' },
  { tip: '诱惑绑定：只在做某事时才允许自己享受另一件事', category: '技巧' },

  // 心理建设
  { tip: '错过一天不等于失败，重要的是不要连续错过两天', category: '心态' },
  { tip: '进步不是线性的，允许自己有波动', category: '心态' },
  { tip: '专注于系统，而不是目标', category: '心态' },
  { tip: '庆祝每一个小胜利，它们会累积成大成就', category: '激励' },
  { tip: '你不需要完美，只需要比昨天好一点', category: '激励' },

  // 实用建议
  { tip: '找一个"问责伙伴"，互相监督打卡', category: '社交' },
  { tip: '设置视觉提醒，比如在镜子上贴便利贴', category: '环境' },
  { tip: '记录你的感受，而不只是行动', category: '记录' },
  { tip: '给自己设定小奖励，完成目标后犒劳自己', category: '激励' },
  { tip: '把大目标分解成可执行的小步骤', category: '方法' },

  // 深度思考
  { tip: '问自己：这个习惯对我意味着什么？', category: '意义' },
  { tip: '找到习惯的内在价值，而不仅仅是外在奖励', category: '意义' },
  { tip: '记住你为什么开始，这会给你坚持的力量', category: '初心' },
  { tip: '习惯是身份的体现，你想成为什么样的人？', category: '身份' },
  { tip: '每一天都是新的开始，不要被过去束缚', category: '心态' }
];

// 习惯养成指南
const HABIT_GUIDES = [
  {
    id: 'guide_start',
    title: '如何开始养成习惯',
    icon: '🚀',
    steps: [
      '选择一个具体、可衡量的目标',
      '从极小的行动开始（2分钟规则）',
      '设定固定的时间和地点',
      '记录你的行动',
      '给自己设定奖励'
    ]
  },
  {
    id: 'guide_streak',
    title: '如何保持连续打卡',
    icon: '🔥',
    steps: [
      '不要中断两天',
      '设置提醒，避免忘记',
      '找到你的 accountability partner',
      '可视化你的进步',
      '原谅偶尔的失败'
    ]
  },
  {
    id: 'guide_break',
    title: '如何突破瓶颈期',
    icon: '💪',
    steps: [
      '接受瓶颈是正常的',
      '回顾你的初心',
      '调整你的目标',
      '尝试新的方法',
      '给自己休息的时间'
    ]
  },
  {
    id: 'guide_balance',
    title: '如何平衡多个目标',
    icon: '⚖️',
    steps: [
      '优先级排序',
      '不要同时开始太多',
      '使用习惯链串联目标',
      '定期回顾和调整',
      '学会说不'
    ]
  }
];

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

// 等级经验表（30级）
const LEVEL_EXP = [
  0, 30, 60, 100, 150, 200, 260, 330, 400, 480,
  560, 640, 720, 800, 850, 900, 930, 960, 980, 1000,
  1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180, 1200
];

// 阶段等级阈值
const STAGE_THRESHOLDS = {
  baby: { min: 1, max: 10 },
  grow: { min: 11, max: 20 },
  adult: { min: 21, max: 30 }
};

module.exports = {
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
  STAGE_THRESHOLDS,
  DAILY_QUESTIONS,
  HABIT_TIPS,
  HABIT_GUIDES
};
