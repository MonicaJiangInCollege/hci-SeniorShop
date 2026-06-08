const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const axios = require('axios'); // 引入 axios 用于发起 HTTP 请求
require('dotenv').config();     // 引入 dotenv 来读取 .env 文件

// 百度语音 SDK
let AipSpeech;
try {
    AipSpeech = require('baidu-aip-sdk').speech;
} catch (e) {
    try {
        AipSpeech = require('baidu-aip').speech;
    } catch (e2) {
        AipSpeech = null;
    }
}
const baiduSpeechAppId = process.env.BAIDU_SPEECH_APP_ID;
const baiduSpeechApiKey = process.env.BAIDU_SPEECH_API_KEY;
const baiduSpeechSecretKey = process.env.BAIDU_SPEECH_SECRET_KEY;
let baiduSpeechClient = null;
if (AipSpeech && baiduSpeechAppId && baiduSpeechAppId !== 'your_app_id') {
    try {
        baiduSpeechClient = new AipSpeech(baiduSpeechAppId, baiduSpeechApiKey, baiduSpeechSecretKey);
    } catch (e) {
        console.warn('百度语音 SDK 初始化失败:', e.message);
    }
}

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增大请求体限制以支持音频base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// 提供静态文件（前端页面）
app.use(express.static(path.join(__dirname)));

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GOODS_FILE = path.join(DATA_DIR, 'goods.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BEHAVIOR_FILE = path.join(DATA_DIR, 'behavior.json');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// ============ 数据初始化 ============

function initGoods() {
    if (fs.existsSync(GOODS_FILE)) {
        return JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));
    }
    const goods = [
        { id: 1, name: '纯牛奶 1L', price: 19.9, category: 'food', description: '新鲜优质牛奶', image: 'https://picsum.photos/200/150?random=1' },
        { id: 2, name: '全麦面包', price: 12.8, category: 'food', description: '健康全麦配方', image: 'https://picsum.photos/200/150?random=2' },
        { id: 7, name: '鸡蛋 30枚', price: 32.5, category: 'food', description: '农家散养土鸡蛋', image: 'https://picsum.photos/200/150?random=7' },
        { id: 8, name: '东北大米 5kg', price: 49.9, category: 'food', description: '粒粒香甜软糯', image: 'https://picsum.photos/200/150?random=8' },
        { id: 9, name: '花生油 5L', price: 89.9, category: 'food', description: '压榨一级花生油', image: 'https://picsum.photos/200/150?random=9' },
        { id: 10, name: '红枣 500g', price: 18.8, category: 'food', description: '新疆若羌灰枣', image: 'https://picsum.photos/200/150?random=10' },
        { id: 11, name: '绿茶 250g', price: 56.0, category: 'food', description: '明前龙井清香回甘', image: 'https://picsum.photos/200/150?random=11' },
        { id: 12, name: '意大利面 500g', price: 15.6, category: 'food', description: '硬质小麦制作', image: 'https://picsum.photos/200/150?random=12' },
        { id: 3, name: '卷纸 10卷', price: 29.9, category: 'daily', description: '柔软舒适', image: 'https://picsum.photos/200/150?random=3' },
        { id: 4, name: '洗衣液 2kg', price: 35.0, category: 'daily', description: '深层去污', image: 'https://picsum.photos/200/150?random=4' },
        { id: 13, name: '洗洁精 1.5kg', price: 12.9, category: 'daily', description: '不伤手易冲洗', image: 'https://picsum.photos/200/150?random=13' },
        { id: 14, name: '垃圾袋 3卷', price: 9.9, category: 'daily', description: '加厚抽绳式', image: 'https://picsum.photos/200/150?random=14' },
        { id: 15, name: '抽纸 24包', price: 25.8, category: 'daily', description: '三层柔软不掉屑', image: 'https://picsum.photos/200/150?random=15' },
        { id: 16, name: '牙膏 120g', price: 15.5, category: 'daily', description: '清新口气防蛀', image: 'https://picsum.photos/200/150?random=16' },
        { id: 17, name: '肥皂 3块装', price: 11.8, category: 'daily', description: '天然植物配方', image: 'https://picsum.photos/200/150?random=17' },
        { id: 18, name: '保鲜膜 2卷', price: 8.5, category: 'daily', description: '食品级安全材质', image: 'https://picsum.photos/200/150?random=18' },
        { id: 5, name: '维生素片', price: 45.0, category: 'medicine', description: '每日营养补充', image: 'https://picsum.photos/200/150?random=5' },
        { id: 6, name: '创可贴', price: 8.0, category: 'medicine', description: '家庭常备', image: 'https://picsum.photos/200/150?random=6' },
        { id: 19, name: '钙片 60粒', price: 68.0, category: 'medicine', description: '中老年补钙佳品', image: 'https://picsum.photos/200/150?random=19' },
        { id: 20, name: '鱼油胶囊 30粒', price: 98.0, category: 'medicine', description: '深海鱼油护心脑', image: 'https://picsum.photos/200/150?random=20' },
        { id: 21, name: '体温计', price: 22.0, category: 'medicine', description: '电子精准测温', image: 'https://picsum.photos/200/150?random=21' },
        { id: 22, name: '口罩 50只', price: 19.9, category: 'medicine', description: '三层防护透气', image: 'https://picsum.photos/200/150?random=22' },
        { id: 23, name: '葡萄糖口服液 10支', price: 28.0, category: 'medicine', description: '快速补充能量', image: 'https://picsum.photos/200/150?random=23' },
        { id: 24, name: '护手霜 200ml', price: 35.0, category: 'medicine', description: '滋润保湿防裂', image: 'https://picsum.photos/200/150?random=24' },
    ];
    fs.writeFileSync(GOODS_FILE, JSON.stringify(goods, null, 2));
    return goods;
}

function initDataFile(filePath, defaultValue = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 初始化所有数据
initGoods();
initDataFile(USERS_FILE, []);
initDataFile(CARTS_FILE, []);
initDataFile(ORDERS_FILE, []);
initDataFile(BEHAVIOR_FILE, []);

// ============ 推荐算法 ============

/**
 * 获取用户行为数据
 */
function getUserBehavior(userId) {
    const behaviors = JSON.parse(fs.readFileSync(BEHAVIOR_FILE, 'utf8'));
    let behavior = behaviors.find(b => b.userId === userId);
    if (!behavior) {
        behavior = {
            userId,
            searchHistory: [],
            browseHistory: [],
            viewCounts: {}
        };
        behaviors.push(behavior);
        saveData(BEHAVIOR_FILE, behaviors);
    }
    return behavior;
}

/**
 * 获取全局热门商品（基于所有用户的购物车和订单数据）
 */
function getGlobalHotGoods(limit = 10) {
    const carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));

    const scoreMap = {}; // goodsId -> score

    // 购物车中的商品 +1分
    carts.forEach(cart => {
        cart.items.forEach(item => {
            scoreMap[item.goodsId] = (scoreMap[item.goodsId] || 0) + 1;
        });
    });

    // 订单中的商品 +3分
    orders.forEach(order => {
        order.items.forEach(item => {
            scoreMap[item.goodsId] = (scoreMap[item.goodsId] || 0) + 3;
        });
    });

    // 按分数排序，取 top N
    const sorted = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([goodsId]) => parseInt(goodsId));

    // 补足：如果热门商品不够，用老年用品补充
    if (sorted.length < limit) {
        const elderlyGoods = goods
            .filter(g => g.elderlyFriendly && !sorted.includes(g.id))
            .map(g => g.id);
        sorted.push(...elderlyGoods.slice(0, limit - sorted.length));
    }

    return sorted;
}

/**
 * 智能推荐核心算法
 * @param {string} userId - 用户ID
 * @param {number} limit - 返回推荐数量
 * @returns {Array} 推荐的商品列表
 */
function getRecommendations(userId, limit = 6) {
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));
    const behavior = getUserBehavior(userId);

    // 获取用户购物车中的商品ID（用于去重）
    const carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    const userCart = carts.find(c => c.userId === userId);
    const cartGoodsIds = userCart ? userCart.items.map(i => i.goodsId) : [];

    const hasHistory = behavior.searchHistory.length > 0 || behavior.browseHistory.length > 0;

    if (!hasHistory) {
        // === 冷启动：返回老年用品 + 热门商品 ===
        const hotIds = getGlobalHotGoods(limit * 2);
        const elderlyGoods = goods.filter(g => g.elderlyFriendly && !cartGoodsIds.includes(g.id));

        // 老年用品优先，不够用热门补
        const result = [];
        const seen = new Set();

        for (const g of elderlyGoods) {
            if (result.length >= limit) break;
            if (!seen.has(g.id)) {
                result.push(g);
                seen.add(g.id);
            }
        }

        for (const id of hotIds) {
            if (result.length >= limit) break;
            if (!seen.has(id) && !cartGoodsIds.includes(id)) {
                const g = goods.find(g => g.id === id);
                if (g) {
                    result.push(g);
                    seen.add(g.id);
                }
            }
        }

        return result;
    }

    // === 有行为数据：混合推荐打分 ===
    const WEIGHTS = {
        categoryPreference: 0.35,  // 品类偏好
        keywordMatch: 0.25,       // 关键词匹配
        collaborative: 0.20,      // 协同过滤（热门）
        elderlyFriendly: 0.20     // 老年适用
    };

    // 1. 统计品类偏好
    const categoryCount = {}; // { food: 5, daily: 2 }
    behavior.browseHistory.forEach(h => {
        if (h.category) {
            categoryCount[h.category] = (categoryCount[h.category] || 0) + 1;
        }
    });
    // 搜索关键词也映射到品类
    const allKeywords = behavior.searchHistory.map(h => h.keyword.toLowerCase());
    const categoryKeywords = {
        food: ['食品', '饮料', '牛奶', '面包', '鸡蛋', '大米', '油', '枣', '茶', '面', '吃', '喝', '零食', '水果', '菜'],
        daily: ['日用', '纸', '洗衣', '清洁', '牙膏', '肥皂', '垃圾', '保鲜', '家居', '用'],
        medicine: ['药', '保健', '钙', '维生素', '鱼油', '口罩', '体温', '葡萄糖', '护手', '医疗', '健康', '补']
    };

    allKeywords.forEach(kw => {
        for (const [cat, kws] of Object.entries(categoryKeywords)) {
            if (kws.some(k => kw.includes(k))) {
                categoryCount[cat] = (categoryCount[cat] || 0) + 2; // 搜索权重更高
            }
        }
    });

    // 计算最高品类次数
    const maxCategoryCount = Math.max(1, ...Object.values(categoryCount));

    // 2. 获取全局热门商品ID集合
    const hotGoodsIds = new Set(getGlobalHotGoods(20));

    // 3. 对每个商品打分（排除已在购物车中的）
    const scoredGoods = goods
        .filter(g => !cartGoodsIds.includes(g.id))
        .map(g => {
            let score = 0;

            // 3a. 品类偏好得分（归一化）
            const catCount = categoryCount[g.category] || 0;
            const categoryScore = catCount / maxCategoryCount;
            score += categoryScore * WEIGHTS.categoryPreference;

            // 3b. 关键词匹配得分
            let keywordScore = 0;
            const searchText = (g.name + ' ' + g.description + ' ' + (g.tags || []).join(' ')).toLowerCase();
            allKeywords.forEach(kw => {
                if (searchText.includes(kw)) {
                    keywordScore = Math.max(keywordScore, 0.8); // 精确匹配
                }
                // 部分匹配
                const kwChars = kw.split('');
                let matchCount = 0;
                kwChars.forEach(ch => {
                    if (searchText.includes(ch)) matchCount++;
                });
                const partialMatch = matchCount / kwChars.length;
                keywordScore = Math.max(keywordScore, partialMatch * 0.4);
            });
            score += keywordScore * WEIGHTS.keywordMatch;

            // 3c. 协同过滤得分
            const collabScore = hotGoodsIds.has(g.id) ? 1 : 0;
            score += collabScore * WEIGHTS.collaborative;

            // 3d. 老年适用得分
            const elderlyScore = g.elderlyFriendly ? 1 : 0;
            score += elderlyScore * WEIGHTS.elderlyFriendly;

            return { goods: g, score };
        });

    // 按分数降序排列，取 top N
    scoredGoods.sort((a, b) => b.score - a.score);
    return scoredGoods.slice(0, limit).map(item => item.goods);
}

// ============ API 路由 ============

// --- 用户注册 ---
app.post('/api/users', (req, res) => {
    const { phone, password, name, relation, parentPhone } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ error: '手机号和密码不能为空' });
    }
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    // 检查是否已注册
    if (users.find(u => u.phone === phone)) {
        return res.status(409).json({ error: '该手机号已注册' });
    }

    const newUser = {
        id: Date.now().toString(),
        phone,
        password,
        name: name || '',
        relation: relation || '',
        parentId: null, // 绑定的老人用户ID（仅子女账号有值）
        createdAt: new Date().toISOString()
    };

    // 如果是子女注册，通过父母手机号建立绑定关系
    if (relation === 'child' && parentPhone) {
        const parent = users.find(u => u.phone === parentPhone && u.relation === 'elder');
        if (!parent) {
            return res.status(400).json({ error: '未找到该手机号对应的老人账号，请先让父母注册' });
        }
        newUser.parentId = parent.id;
    }

    users.push(newUser);
    saveData(USERS_FILE, users);
    res.json({ message: '注册成功', userId: newUser.id });
});

// --- 用户登录 ---
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) {
        return res.status(401).json({ error: '手机号或密码错误' });
    }
    res.json({
        message: '登录成功',
        userId: user.id,
        name: user.name,
        relation: user.relation,
        parentId: user.parentId || null
    });
});

// ========== AI 导购接口（支持全场景 + 商品精准推荐 + 价格对比 + 购物清单） ==========
app.post('/api/ai-advice', async (req, res) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        console.error("错误: 环境变量 DEEPSEEK_API_KEY 未在 .env 文件中设置！");
        return res.status(500).json({ error: '服务器配置错误：缺少API密钥' });
    }

    const { items, context, question, chatHistory } = req.body;
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));

    // 构建完整商品目录（含子分类和详细描述）
    const fullGoodsCatalog = goods.map(g => {
        const subcat = g.subCategory ? ` [${g.subCategory}]` : '';
        const tags = g.tags && g.tags.length > 0 ? ` 标签:${g.tags.join(',')}` : '';
        const elderly = g.elderlyFriendly ? ' ⭐老年适用' : '';
        return `- [${g.id}] ${g.name} (¥${g.price})${subcat}${elderly} - ${g.description || ''}${tags}`;
    }).join('\n');

    // 构建当前页面商品信息
    let currentPageGoods = '';
    if (context && context.goodsList && context.goodsList.length > 0) {
        currentPageGoods = `\n当前页面展示的商品：\n${context.goodsList.map(g => `- ${g.name} (¥${g.price}) - ${g.description || ''}`).join('\n')}`;
    }

    // 构建购物车信息
    let cartInfo = '';
    if (items && items.length > 0) {
        cartInfo = `\n用户购物车中的商品：\n${items.map(i => `- ${i.name} (¥${i.price})`).join('\n')}`;
        cartInfo += `\n购物车合计：¥${items.reduce((s, i) => s + i.price, 0).toFixed(1)}`;
    }

    // 构建对话历史
    let historyText = '';
    if (chatHistory && chatHistory.length > 0) {
        historyText = '\n之前的对话：\n' + chatHistory.map(h => `${h.role === 'user' ? '用户' : '助手'}: ${h.content}`).join('\n');
    }

    // 检测用户意图，判断是否需要执行动作
    let detectedAction = null;
    if (question) {
        const q = question.toLowerCase().replace(/[，。！？、]/g, '');
        // 加购物车意图
        const addCartPatterns = [
            /我要买\s*(.+)/,
            /帮我加\s*(.+)/,
            /把\s*(.+)\s*加入购物车/,
            /加入购物车\s*(.+)/,
            /加\s*(.+)\s*到购物车/,
            /我要\s*(.+)/,
            /帮我买\s*(.+)/,
            /购买\s*(.+)/,
            /要\s*(.+)/,           // "要纯牛奶"
            /给我\s*(.+)/,         // "给我来点牛奶"
            /来点\s*(.+)/,         // "来点面包"
            /来份\s*(.+)/,         // "来份牛奶"
            /来个\s*(.+)/,         // "来个面包"
            /就买\s*(.+)/,         // "就买它了"（上下文已提到商品）
            /就要\s*(.+)/,         // "就要这个"
        ];
        for (const pattern of addCartPatterns) {
            const match = q.match(pattern);
            if (match && match[1]) {
                let productName = match[1].replace(/加入购物车|一下|一个|一份|一点|一些|好吗|吗|呢|呀|了/g, '').trim();
                // 在商品目录中查找匹配的商品
                const matchedGoods = goods.find(g =>
                    g.name.includes(productName) || productName.includes(g.name.split(' ')[0]) ||
                    g.name.includes(productName.split(' ')[0])
                );
                if (matchedGoods) {
                    detectedAction = {
                        type: 'add_to_cart',
                        goods: matchedGoods
                    };
                    break;
                }
            }
        }

        // 如果没有加购意图，检查是否是结算意图
        if (!detectedAction && (q.includes('结算') || q.includes('下单') || q.includes('付款') || q.includes('去结算') || q.includes('帮我付') || q.includes('付钱') || q.includes('提交订单') || q.includes('帮我付'))) {
            detectedAction = { type: 'checkout' };
        }

        // 检查是否是导航意图
        if (!detectedAction) {
            if (q.includes('食品饮料') || q.includes('食品') || q.includes('饮料')) {
                detectedAction = { type: 'navigate', target: 'food' };
            } else if (q.includes('日用品')) {
                detectedAction = { type: 'navigate', target: 'daily' };
            } else if (q.includes('药品') || q.includes('保健')) {
                detectedAction = { type: 'navigate', target: 'medicine' };
            } else if (q.includes('购物车') || q.includes('我选好的')) {
                detectedAction = { type: 'navigate', target: 'cart' };
            } else if (q.includes('随便看看')) {
                detectedAction = { type: 'navigate', target: 'browse' };
            } else if (q.includes('首页') || q.includes('返回')) {
                detectedAction = { type: 'navigate', target: 'home' };
            }
        }
    }

    let prompt = '';
    let systemPrompt = `你是一位亲切温暖的AI购物导购助手，专门帮助老年用户在线购物。

【商店完整商品目录】
${fullGoodsCatalog}

${currentPageGoods}
${cartInfo}
${historyText}

【回答规则】
1. 语气亲切温暖，用短句，适合老年人阅读
2. 回答不超过200字
3. 推荐商品时，必须使用以下格式标记商品名，方便用户点击：【商品名】
   例如：推荐您试试【纯牛奶 1L】，营养丰富
4. 如果用户问"有没有XX"，从商品目录中精确匹配回答
5. 如果用户问价格对比，列出同类商品价格并推荐最实惠的
6. 如果用户要求生成购物清单，列出商品后用【商品名】格式标记
7. 如果问题与购物无关，友好地引导回购物话题
8. 不要编造商品目录中没有的商品
9. 如果用户说"我要买XX"或"帮我加XX"，确认已帮用户加入购物车，并推荐搭配商品
10. 如果用户说"好呀"、"好的"、"行"等确认词，表示确认上文的加购操作`;

    // 如果有检测到的动作，在system prompt中告知
    if (detectedAction && detectedAction.type === 'add_to_cart') {
        systemPrompt += `\n\n【重要提示】用户要求把【${detectedAction.goods.name}】加入购物车，你已经在回复中确认了。请在回复中确认已加入购物车，并推荐相关搭配商品（用【商品名】格式）。`;
    }
    if (detectedAction && detectedAction.type === 'checkout') {
        systemPrompt += `\n\n【重要提示】用户要求结算，请确认订单信息并告知等待子女代付。`;
    }

    // 根据不同场景构建 prompt
    if (question) {
        prompt = `用户当前在${context ? context.scene : '购物'}页面。
用户的问题是：${question}

请根据商店商品目录回答用户的问题。如果涉及推荐，请用【商品名】格式标记商品名。`;
    } else if (items && Array.isArray(items) && items.length > 0) {
        prompt = `用户即将结算购物车，请分析购物车内容并给出建议：
1. 对这些商品选择的总体肯定
2. 是否有可以搭配的商品推荐（用【商品名】格式）
3. 是否有重复或不需要购买的商品
4. 语气亲切温暖，提醒一句家人的关爱`;
    } else {
        // 欢迎模式
        const foodCount = goods.filter(g => g.category === 'food').length;
        const dailyCount = goods.filter(g => g.category === 'daily').length;
        const medCount = goods.filter(g => g.category === 'medicine').length;

        prompt = `请主动打招呼，简要介绍商店有${foodCount}种食品饮料、${dailyCount}种日用品、${medCount}种药品保健。
告诉用户可以问你的问题类型：
- "有没有降血压的药？"
- "牛奶多少钱？"
- "帮我推荐适合老人的食品"
- "帮我列一周买菜清单"
语气亲切温暖，不超过120字。`;
    }

    try {
        const response = await axios.post(
            'https://api.deepseek.com/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 600
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            },
            { timeout: 15000 }
        );

        const advice = response.data.choices[0].message.content;

        // 解析 AI 回复中的【商品名】标记，匹配到实际商品
        const productMentions = [];
        const mentionRegex = /【(.+?)】/g;
        let match;
        while ((match = mentionRegex.exec(advice)) !== null) {
            const mentionedName = match[1].trim();
            // 模糊匹配商品
            const matched = goods.find(g =>
                g.name.includes(mentionedName) ||
                mentionedName.includes(g.name) ||
                g.name.includes(mentionedName.split(' ')[0])
            );
            if (matched) {
                productMentions.push({
                    text: mentionedName,
                    goods: matched
                });
            }
        }

        // 检测是否需要通知子女（药品购买或大额消费）
        let notifyChild = null;
        if (items && items.length > 0) {
            const hasMedicine = items.some(i => {
                const g = goods.find(g => g.name === i.name);
                return g && g.category === 'medicine';
            });
            const total = items.reduce((s, i) => s + i.price, 0);
            if (hasMedicine || total > 100) {
                notifyChild = {
                    reason: hasMedicine ? '药品购买' : '大额消费',
                    total,
                    items: items.map(i => i.name)
                };
            }
        }

        res.json({
            success: true,
            advice: advice,
            products: productMentions,
            notifyChild: notifyChild,
            action: detectedAction
        });

    } catch (error) {
        console.error('DeepSeek API 调用失败详情:', error.response?.data || error.message);
        res.status(500).json({ error: '获取AI建议失败，请稍后重试' });
    }
});

// --- 获取所有商品 ---
app.get('/api/goods', (req, res) => {
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));
    res.json(goods);
});

// --- 按分类获取商品 ---
app.get('/api/goods/:category', (req, res) => {
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));
    const filtered = goods.filter(g => g.category === req.params.category);
    res.json(filtered);
});

// --- 获取用户购物车 ---
app.get('/api/cart/:userId', (req, res) => {
    let carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    let cart = carts.find(c => c.userId === req.params.userId);
    if (!cart) {
        cart = { userId: req.params.userId, items: [] };
        carts.push(cart);
        saveData(CARTS_FILE, carts);
    }
    res.json(cart.items);
});

// --- 添加商品到购物车 ---
app.post('/api/cart/:userId/items', (req, res) => {
    const { goodsId, name, price } = req.body;
    let carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    let cart = carts.find(c => c.userId === req.params.userId);
    if (!cart) {
        cart = { userId: req.params.userId, items: [] };
        carts.push(cart);
    }
    cart.items.push({
        id: Date.now().toString(),
        goodsId,
        name,
        price,
        addedAt: new Date().toISOString()
    });
    saveData(CARTS_FILE, carts);
    res.json({ message: '已加入购物车', items: cart.items });
});

// --- 从购物车删除商品 ---
app.delete('/api/cart/:userId/items/:itemId', (req, res) => {
    let carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    let cart = carts.find(c => c.userId === req.params.userId);
    if (!cart) {
        return res.status(404).json({ error: '购物车不存在' });
    }
    cart.items = cart.items.filter(i => i.id !== req.params.itemId);
    saveData(CARTS_FILE, carts);
    res.json({ message: '已删除', items: cart.items });
});

// --- 创建订单 ---
app.post('/api/orders', (req, res) => {
    const { userId, items, total } = req.body;
    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: '订单信息不完整' });
    }
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const order = {
        id: 'ORD' + Date.now(),
        userId,
        items,
        total,
        status: 'pending', // pending -> paid -> completed
        payerId: null,
        createdAt: new Date().toISOString(),
        paidAt: null
    };
    orders.push(order);
    saveData(ORDERS_FILE, orders);

    // 清空购物车
    let carts = JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
    let cart = carts.find(c => c.userId === userId);
    if (cart) {
        cart.items = [];
        saveData(CARTS_FILE, carts);
    }

    res.json({ message: '订单已创建', order });
});

// --- 获取用户订单 ---
app.get('/api/orders/:userId', (req, res) => {
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const userOrders = orders.filter(o => o.userId === req.params.userId);
    res.json(userOrders);
});

// --- 获取待代付订单（子女查看，按绑定关系过滤） ---
app.get('/api/orders/pending', (req, res) => {
    const { childUserId } = req.query; // 子女用户ID
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    if (childUserId) {
        // 查找该子女绑定的老人ID
        const child = users.find(u => u.id === childUserId);
        if (!child || !child.parentId) {
            return res.json([]); // 未绑定老人，无订单
        }
        // 只返回绑定老人的待付订单
        const pending = orders.filter(o => o.userId === child.parentId && o.status === 'pending');
        return res.json(pending);
    }

    // 兼容：无 childUserId 时返回所有待付订单（向后兼容）
    const pending = orders.filter(o => o.status === 'pending');
    res.json(pending);
});

// --- 子女查看已代付的订单记录 ---
app.get('/api/orders/paid-by-child', (req, res) => {
    const { childUserId } = req.query;
    if (!childUserId) return res.json([]);

    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const child = users.find(u => u.id === childUserId);

    if (!child || !child.parentId) {
        return res.json([]);
    }

    // 返回绑定老人的已代付订单
    const paid = orders.filter(o => o.userId === child.parentId && o.status === 'paid');
    res.json(paid);
});

// --- 支付订单（子女代付） ---
app.post('/api/orders/:orderId/pay', (req, res) => {
    const { payerId } = req.body;
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order) {
        return res.status(404).json({ error: '订单不存在' });
    }
    if (order.status !== 'pending') {
        return res.status(400).json({ error: '订单状态不可支付' });
    }
    order.status = 'paid';
    order.payerId = payerId;
    order.paidAt = new Date().toISOString();
    saveData(ORDERS_FILE, orders);
    res.json({ message: '代付成功！', order });
});

// --- 商品搜索 ---
app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) {
        return res.json([]);
    }
    const goods = JSON.parse(fs.readFileSync(GOODS_FILE, 'utf8'));
    // 模糊匹配：名称、描述、分类、标签
    const results = goods.filter(g => {
        const searchText = (g.name + ' ' + g.description + ' ' + g.category + ' ' + (g.tags || []).join(' ')).toLowerCase();
        // 支持多关键词（空格分隔），全部匹配才返回
        const keywords = q.split(/\s+/);
        return keywords.every(kw => searchText.includes(kw));
    });
    res.json(results);
});

// --- 记录搜索行为 ---
app.post('/api/behavior/search', (req, res) => {
    const { userId, keyword } = req.body;
    if (!userId || !keyword) {
        return res.status(400).json({ error: '缺少参数' });
    }
    const behaviors = JSON.parse(fs.readFileSync(BEHAVIOR_FILE, 'utf8'));
    let behavior = behaviors.find(b => b.userId === userId);
    if (!behavior) {
        behavior = { userId, searchHistory: [], browseHistory: [], viewCounts: {} };
        behaviors.push(behavior);
    }
    behavior.searchHistory.push({
        keyword: keyword.trim(),
        time: new Date().toISOString()
    });
    // 只保留最近 50 条搜索记录
    if (behavior.searchHistory.length > 50) {
        behavior.searchHistory = behavior.searchHistory.slice(-50);
    }
    saveData(BEHAVIOR_FILE, behaviors);
    res.json({ message: '搜索记录已保存' });
});

// --- 记录浏览行为 ---
app.post('/api/behavior/browse', (req, res) => {
    const { userId, goodsId, category } = req.body;
    if (!userId) {
        return res.status(400).json({ error: '缺少用户ID' });
    }
    const behaviors = JSON.parse(fs.readFileSync(BEHAVIOR_FILE, 'utf8'));
    let behavior = behaviors.find(b => b.userId === userId);
    if (!behavior) {
        behavior = { userId, searchHistory: [], browseHistory: [], viewCounts: {} };
        behaviors.push(behavior);
    }
    // 记录浏览
    const browseEntry = {
        time: new Date().toISOString()
    };
    if (goodsId) browseEntry.goodsId = goodsId;
    if (category) browseEntry.category = category;
    behavior.browseHistory.push(browseEntry);

    // 更新浏览次数
    if (goodsId) {
        const key = String(goodsId);
        behavior.viewCounts[key] = (behavior.viewCounts[key] || 0) + 1;
    }

    // 只保留最近 100 条浏览记录
    if (behavior.browseHistory.length > 100) {
        behavior.browseHistory = behavior.browseHistory.slice(-100);
    }

    saveData(BEHAVIOR_FILE, behaviors);
    res.json({ message: '浏览记录已保存' });
});

// --- 获取个性化推荐 ---
app.get('/api/recommendations/:userId', (req, res) => {
    const { userId } = req.params;
    const recommendations = getRecommendations(userId, 6);
    res.json(recommendations);
});

// ========== 百度语音接口 ==========

// --- 语音识别（ASR）：base64 音频 → 文字 ---
app.post('/api/speech/asr', (req, res) => {
    if (!baiduSpeechClient) {
        return res.status(500).json({ error: '百度语音服务未配置，请在 .env 中设置 BAIDU_SPEECH_*' });
    }

    const { audioBase64 } = req.body;
    if (!audioBase64) {
        return res.status(400).json({ error: '缺少音频数据' });
    }

    // 百度语音识别：16000Hz, PCM/WAV, 中文
    baiduSpeechClient
        .recognize(Buffer.from(audioBase64, 'base64'), {
            devPid: 15372, // 中文普通话远场
        })
        .then(result => {
            if (result.result) {
                // result.result 是数组，拼接所有识别片段
                const text = result.result.join('');
                res.json({ success: true, text });
            } else if (result.err_no) {
                res.status(500).json({ error: `识别失败: ${result.err_msg}` });
            } else {
                res.status(500).json({ error: '识别结果为空' });
            }
        })
        .catch(err => {
            console.error('百度语音识别错误:', err);
            res.status(500).json({ error: '语音识别服务异常' });
        });
});

// --- 语音合成（TTS）：文字 → 语音音频 ---
app.post('/api/speech/tts', (req, res) => {
    if (!baiduSpeechClient) {
        return res.status(500).json({ error: '百度语音服务未配置，请在 .env 中设置 BAIDU_SPEECH_*' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: '缺少文本内容' });
    }

    // 限制文本长度（百度TTS单次最多1024字节）
    const safeText = text.substring(0, 500);

    baiduSpeechClient
        .synthesis(safeText)
        .then(result => {
            if (result.err_no === 0) {
                const audioBuffer = result.result;
                res.set('Content-Type', 'audio/mpeg');
                res.set('Content-Length', audioBuffer.length);
                res.send(audioBuffer);
            } else {
                res.status(500).json({ error: `合成失败: ${result.err_msg}` });
            }
        })
        .catch(err => {
            console.error('百度语音合成错误:', err);
            res.status(500).json({ error: '语音合成服务异常' });
        });
});

// ============ 启动服务器 ============
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`局域网访问: http://100.81.72.22:${PORT}`);
    console.log('数据文件存储在 ./data/ 目录');
});
