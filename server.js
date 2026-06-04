const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 提供静态文件（前端页面）
app.use(express.static(path.join(__dirname)));

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GOODS_FILE = path.join(DATA_DIR, 'goods.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

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

// ============ API 路由 ============

// --- 用户注册 ---
app.post('/api/users', (req, res) => {
    const { phone, password, name, relation } = req.body;
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
        password, // 实际项目中需要加密
        name: name || '',
        relation: relation || '', // 'elder' 老年人 / 'child' 子女
        createdAt: new Date().toISOString()
    };
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
        relation: user.relation
    });
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

// --- 获取待代付订单（子女查看） ---
app.get('/api/orders/pending', (req, res) => {
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const pending = orders.filter(o => o.status === 'pending');
    res.json(pending);
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

// ============ 启动服务器 ============
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('数据文件存储在 ./data/ 目录');
});