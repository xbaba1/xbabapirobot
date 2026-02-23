const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
const path = require('path');

// --- RENDER PORT VE 7/24 AYARI (DÜZELTİLDİ) ---
const express = require('express'); 
const app = express();
const port = process.env.PORT || 10000; 

app.get('/', (req, res) => res.send('Bot 7/24 Aktif! Port: ' + port));
app.listen(port, '0.0.0.0', () => {
    console.log(`Web sunucusu ${port} portunda baslatildi.`);
});

// --- AYARLAR ---
const SUNUCU_IP = 'newfag.xyz'; 
const admin = 'xbabapiro'; 
const PREFIX = '%'; 

// VERDİĞİN ASIL BİRİM FİYATLARI
const BİRİM_KUR = { dolar: 43.50, euro: 51.79, altin: 6778.73, btc: 94230 };

let kitBakimda = false;
let bot;
let mevlanaInterval = null;
let afkSebep = null;

const SEHIRLER = ["adana", "adiyaman", "afyonkarahisar", "agri", "amasya", "ankara", "antalya", "artvin", "aydin", "balikesir", "bilecik", "bingol", "bitlis", "bolu", "burdur", "bursa", "canakkale", "cankiri", "corum", "denizli", "diyarbakir", "edirne", "elazig", "erzincan", "erzurum", "eskisehir", "gaziantep", "giresun", "gumushane", "hakkari", "hatay", "isparta", "mersin", "istanbul", "izmir", "kars", "kastamonu", "kayseri", "kirklareli", "kirsehir", "kocaeli", "konya", "kutahya", "malatya", "manisa", "kahramanmaras", "mardin", "mugla", "mus", "nevsehir", "nigde", "ordu", "rize", "sakarya", "samsun", "siirt", "sinop", "sivas", "tekirdag", "tokat", "trabzon", "tunceli", "sanliurfa", "usak", "van", "yozgat", "zonguldak", "aksaray", "bayburt", "karaman", "kirikkale", "batman", "sirnak", "bartin", "ardahan", "igdir", "yalova", "karabuk", "kilis", "osmaniye", "duzce"];

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
        username: 'xbabapiro', 
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
            case 'v': 
                if(isAdmin) { 
                    if(vList.includes(hedef)) {
                        bot.chat(`⚠️ ${hedef} zaten V listesinde!`);
                    } else {
                        vList.push(hedef);
                        listeyiKaydet(vList);
                        bot.chat(`✅ ${hedef} V listesine eklendi.`);
                    }
                } break;

            case 'v-k': 
                if(isAdmin) { 
                    if(hedef === admin.toLowerCase()) return;
                    if(!vList.includes(hedef)) {
                        bot.chat(`❌ ${hedef} zaten V listesinde değil!`);
                    } else {
                        const yeniListe = vList.filter(n => n !== hedef);
                        listeyiKaydet(yeniListe);
                        bot.chat(`🗑️ ${hedef} V listesinden silindi.`);
                    }
                } break;

            case 'v-list': 
                bot.chat(`💎 V Listesi: ${listeyiOku().join(', ')}`); 
                break;

            case 'dolar': bot.chat(`💵 ${miktar} Dolar = ${(miktar * BİRİM_KUR.dolar).toFixed(2)} TL.`); break;
            case 'euro': bot.chat(`💶 ${miktar} Euro = ${(miktar * BİRİM_KUR.euro).toFixed(2)} TL.`); break;
            case 'altın': bot.chat(`🪙 ${miktar} Altın = ${(miktar * BİRİM_KUR.altin).toFixed(2)} TL.`); break;
            case 'btc': bot.chat(`₿ ${miktar} BTC = ${(miktar * BİRİM_KUR.btc).toLocaleString()} $`); break;

            case 'yardım':
                bot.chat("🛠 1/4: %kit, %ping, %eniyiping, %enkötüping, %dolar, %euro, %altın, %btc");
                setTimeout(() => bot.chat("🛠 2/4: %pp, %afk, %zıpla, %dur, %yazı-tura, %zar, %şans"), 1500);
                setTimeout(() => bot.chat("🛠 3/4: %hava, %aktif, %version, %saat"), 3000);
                break;

            case 'v-yardım':
                if (!isV) return;
                bot.chat(`/msg ${username} 💎 V: %v, %v-k, %v-list, %mevlana, %dur, %tp, %gel, %izle, %koru`);
                break;

            case 'ping': bot.chat(`📡 ${hedef} ping: ${bot.players[hedef]?.ping || "0"}ms`); break;
            case 'eniyiping': 
                let b={n:'',p:9999}; 
                Object.values(bot.players).forEach(p=>{if(p.ping>0&&p.ping<b.p)b={n:p.username,p:p.ping}}); 
                bot.chat(`🚀 En iyi: ${b.n} (${b.p}ms)`); 
                break;
            case 'pp': bot.chat(`${hedef} pp: 8${"=".repeat(Math.floor(Math.random()*15)+1)}D`); break;
            case 'zıpla': bot.setControlState('jump', true); setTimeout(()=>bot.setControlState('jump', false), 500); break;
            case 'dur': bot.clearControlStates(); bot.pathfinder.setGoal(null); if(mevlanaInterval) clearInterval(mevlanaInterval); bot.chat(`🛑 Durduruldu.`); break;
            case 'yazı-tura': bot.chat(`🪙 Sonuç: ${Math.random()>0.5 ? "YAZI" : "TURA"}`); break;
            case 'zar': bot.chat(`🎲 Zar: ${Math.floor(Math.random()*6)+1}`); break;
            case 'şans': bot.chat(`🍀 %${Math.floor(Math.random()*100)} şanslısın.`); break;
            case 'mevlana': if(isV) { if(mevlanaInterval) clearInterval(mevlanaInterval); mevlanaInterval=setInterval(()=>bot.look(bot.entity.yaw+0.8,0,true),40); bot.chat(`🌀 Mevlana aktif.`); } break;
            case 'gel': if(isV) { const p=bot.players[username]?.entity; if(p) bot.pathfinder.setGoal(new goals.GoalFollow(p,1)); bot.chat(`👣 Geliyorum.`); } break;
            case 'tp': if(isV) bot.chat(`/tp ${hedef}`); break;
            case 'izle': if(isV) bot.chat(`/msg ${username} 👀 ${hedef} izleniyor.`); break;
            case 'koru': if(isV) bot.chat(`/msg ${username} 🛡️ ${hedef} korumada.`); break;
            case 'saat': bot.chat(`⌚ Saat: ${new Date().toLocaleTimeString('tr-TR')}`); break;
            case 'afk': if(isAdmin) { if(args.length>0){afkSebep=args.join(' '); bot.chat(`💤 AFK: ${afkSebep}`);} else {afkSebep=null; bot.chat(`✅ Dönüldü.`);} } break;
            case 'aktif': bot.chat(`👥 Aktif: ${Object.keys(bot.players).length}`); break;
            case 'version': bot.chat(`🤖 Sürüm: 1.20.1-Enhanced`); break;
        }
    });

    // --- FİLTREYİ AŞMAK İÇİN GÜNCELLENEN KISIM ---
    bot.once('spawn', () => {
        console.log('Bot başarıyla doğdu!');
        // Hem login yap hem de 1 saniye sonra küçük bir hareket yap ki filtre atmasın
        setTimeout(() => {
            bot.chat('/login 918273645');
            setTimeout(() => {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 400);
            }, 1000);
        }, 1500); // 1.5 saniye sonra login (süreyi aştınız hatasını önlemek için)
    });

    bot.on('error', (err) => console.log('Bot Hatası: ', err));
    bot.on('kicked', (reason) => console.log('Bot Sunucudan Atıldı: ', reason));
    bot.on('end', () => {
        console.log('Bağlantı kesildi, 5 saniye sonra tekrar denenecek...');
        setTimeout(createBot, 5000);
    });
}
createBot();
