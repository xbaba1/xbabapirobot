const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
const path = require('path');

// --- RENDER 7/24 AYARI ---
const express = require('express'); 
const app = express();
const port = process.env.PORT || 10000; 

app.get('/', (req, res) => res.send('xbabapirobot 7/24 Aktif! Port: ' + port));
app.listen(port, '0.0.0.0', () => {
    console.log(`Web sunucusu ${port} portunda baslatildi.`);
});

// --- AYARLAR ---
const SUNUCU_IP = 'mdbam.aternos.me'; 
const admin = 'xbabapiro'; 
const PREFIX = '%'; 

const BİRİM_KUR = { dolar: 43.50, euro: 51.79, altin: 6778.73, btc: 94230 };

let bot;
let mevlanaInterval = null;
let afkSebep = null;
let duyuruInterval = null;

const SEHIRLER = ["adana", "ankara", "istanbul", "izmir", "antalya", "bursa", "eskisehir", "konya", "samsun", "trabzon", "agri"];

function listeyiOku() {
    try {
        const p = path.join(__dirname, 'v-list.txt');
        if (!fs.existsSync(p)) return [admin.toLowerCase()];
        const veri = fs.readFileSync(p, 'utf8');
        return veri.split(',').map(n => n.trim().toLowerCase()).filter(n => n !== "");
    } catch (e) { return [admin.toLowerCase()]; }
}

function listeyiKaydet(liste) {
    const temizListe = [...new Set(liste.map(n => n.toLowerCase()))];
    fs.writeFileSync(path.join(__dirname, 'v-list.txt'), temizListe.join(','));
}

function createBot() {
    bot = mineflayer.createBot({ 
        host: SUNUCU_IP, 
        username: 'xbabapirobot', 
        auth: 'offline',
        version: '1.20.1'
    });
    bot.loadPlugin(pathfinder);

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        
        if (afkSebep && message.toLowerCase().includes(admin.toLowerCase())) {
            bot.chat(`⚠️ [BİLGİ] ${admin} şu an AFK. Sebep: ${afkSebep}`);
        }

        if (!message.startsWith(PREFIX)) return;

        const args = message.slice(PREFIX.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const miktar = parseFloat(args[0]) || 1;
        const hedef = args[0] ? args[0].toLowerCase() : username.toLowerCase();
        
        let vList = listeyiOku();
        const isAdmin = (username.toLowerCase() === admin.toLowerCase());
        const isV = vList.includes(username.toLowerCase()) || isAdmin;

        switch (command) {
            // --- EKONOMİ ---
            case 'dolar': bot.chat(`💵 ${miktar} Dolar = ${(miktar * BİRİM_KUR.dolar).toFixed(2)} TL.`); break;
            case 'euro': bot.chat(`💶 ${miktar} Euro = ${(miktar * BİRİM_KUR.euro).toFixed(2)} TL.`); break;
            case 'altın': bot.chat(`🪙 ${miktar} Altın = ${(miktar * BİRİM_KUR.altin).toFixed(2)} TL.`); break;
            case 'btc': bot.chat(`₿ ${miktar} BTC = ${(miktar * BİRİM_KUR.btc).toLocaleString()} $`); break;

            // --- YARDIM ---
            case 'yardım':
                bot.chat("🛠 1/4: %ping, %eniyiping, %enkötüping, %dolar, %euro, %altın, %btc");
                setTimeout(() => bot.chat("🛠 2/4: %pp, %afk, %zıpla, %dur, %yazı-tura, %zar, %şans"), 1500);
                setTimeout(() => bot.chat("🛠 3/4: %espri, %hava, %aktif, %version, %saat"), 3000);
                setTimeout(() => bot.chat("🛠 4/4: %tps, %discord, %aktif, %kimim"), 4500);
                break;

            case 'v-yardım':
                if (!isV) return;
                bot.chat(`/msg ${username} 💎 V: %v, %v-k, %v-list, %mevlana, %dur, %tp, %gel, %izle, %koru, %dans`);
                break;

            // --- BİLGİ & EĞLENCE ---
            case 'ping': bot.chat(`📡 ${hedef} ping: ${bot.players[hedef]?.ping || "0"}ms`); break;
            case 'eniyiping': 
                let eni={n:'',p:9999}; 
                Object.values(bot.players).forEach(p=>{if(p.ping>0 && p.ping<eni.p)eni={n:p.username,p:p.ping}}); 
                bot.chat(`🚀 En iyi: ${eni.n} (${eni.p}ms)`); 
                break;
            case 'enkötüping': 
                let enk={n:'',p:-1}; 
                Object.values(bot.players).forEach(p=>{if(p.ping>enk.p)enk={n:p.username,p:p.ping}}); 
                bot.chat(`🐢 En kötü: ${enk.n} (${enk.p}ms)`); 
                break;
            case 'pp': bot.chat(`${hedef} pp: 8${"=".repeat(Math.floor(Math.random()*15)+1)}D`); break;
            case 'hava': 
                let s = args[0] ? args[0].toLowerCase() : "agri";
                bot.chat(`☁️ ${s.toUpperCase()} için hava: Güneşli 24°C`);
                break;
            case 'yazı-tura': bot.chat(`🪙 Sonuç: ${Math.random()>0.5 ? "YAZI" : "TURA"}`); break;
            case 'zar': bot.chat(`🎲 Zar: ${Math.floor(Math.random()*6)+1}`); break;
            case 'şans': bot.chat(`🍀 %${Math.floor(Math.random()*100)} şanslısın.`); break;
            case 'saat': bot.chat(`⌚ Saat: ${new Date().toLocaleTimeString('tr-TR')}`); break;
            case 'tps': bot.chat(`⚡ TPS: ${bot.tps || "20.0"}`); break;
            case 'espri': bot.chat("Adamın biri gülmüş, saksıya koymuşlar."); break;
            case 'aktif': bot.chat(`👥 Aktif: ${Object.keys(bot.players).length}`); break;

            // --- V-LIST VE YETKİLER ---
            case 'v': if(isAdmin) { vList.push(hedef); listeyiKaydet(vList); bot.chat(`✅ ${hedef} eklendi.`); } break;
            case 'v-k': if(isAdmin) { const yeni = vList.filter(n => n !== hedef); listeyiKaydet(yeni); bot.chat(`🗑️ ${hedef} silindi.`); } break;
            case 'v-list': bot.chat(`💎 V Listesi: ${listeyiOku().join(', ')}`); break;
            case 'mevlana': 
                if(isV) { 
                    if(mevlanaInterval) clearInterval(mevlanaInterval); 
                    mevlanaInterval=setInterval(()=>bot.look(bot.entity.yaw+0.8,0,true),40); 
                    bot.chat(`🌀 Mevlana aktif.`); 
                } break;
            case 'dur': 
                bot.clearControlStates(); 
                bot.pathfinder.setGoal(null); 
                if(mevlanaInterval) clearInterval(mevlanaInterval); 
                bot.chat(`🛑 Durduruldu.`); 
                break;
            case 'gel': 
                if(isV) { 
                    const p=bot.players[username]?.entity; 
                    if(p) bot.pathfinder.setGoal(new goals.GoalFollow(p,1)); 
                    bot.chat(`👣 Geliyorum.`); 
                } break;
            case 'zıpla': bot.setControlState('jump', true); setTimeout(()=>bot.setControlState('jump', false), 500); break;
            case 'dans': if(isV) { bot.setControlState('jump',true); setTimeout(()=>bot.setControlState('jump',false),2000); } break;
            case 'afk': 
                if(isAdmin) { 
                    if(args.length>0){afkSebep=args.join(' '); bot.chat(`💤 AFK: ${afkSebep}`);} 
                    else {afkSebep=null; bot.chat(`✅ Dönüldü.`);} 
                } break;
        }
    });

    bot.once('spawn', () => {
        console.log('Bot bağlandı: ' + SUNUCU_IP);
        setTimeout(() => bot.chat('/login 918273645'), 3000);

        if (duyuruInterval) clearInterval(duyuruInterval);
        duyuruInterval = setInterval(() => {
            bot.chat('Ben 7/24 botum');
        }, 10000); 
    });

    bot.on('end', () => {
        if (duyuruInterval) clearInterval(duyuruInterval);
        setTimeout(createBot, 5000);
    });
}
createBot();
