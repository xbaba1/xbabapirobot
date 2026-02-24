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
        username: 'xbabapirobot', 
        auth: 'offline',
        version: '1.20.1'
    });
    bot.loadPlugin(pathfinder);

    // GELİŞMİŞ CHAT ALGILAYICI (Tagsız ve Taglı Herkesi Algılar)
    bot.on('messagestr', (fullMessage) => {
        const cleanMsg = fullMessage.trim();
        if (!cleanMsg || cleanMsg.includes(bot.username)) return;

        // AFK Kontrolü (İsim mesajın herhang bir yerinde geçiyorsa)
        if (afkSebep && cleanMsg.toLowerCase().includes(admin.toLowerCase())) {
            bot.chat(`⚠️ [BİLGİ] ${admin} şu an AFK. Sebep: ${afkSebep}`);
        }

        // Komut Kontrolü
        if (!cleanMsg.includes(PREFIX)) return;

        // Mesajı parçala: [Tag] isim: %komut -> [%komut]
        const parts = cleanMsg.split(PREFIX);
        const commandLine = parts[1].trim();
        const args = commandLine.split(/ +/g);
        const command = args.shift().toLowerCase();

        // Gönderen ismini ayıkla (Sembolleri ve tagları siler)
        const senderRaw = parts[0].replace(/[<>\[\]]/g, '').trim();
        const senderName = senderRaw.split(/[: ]/).pop().toLowerCase();

        const miktar = parseFloat(args[0]) || 1;
        const hedef = args[0] ? args[0].toLowerCase() : senderName;
        
        let vList = listeyiOku();
        const isAdmin = (senderName.includes(admin.toLowerCase()));
        const isV = vList.some(v => senderName.includes(v)) || isAdmin;

        switch (command) {
            // --- V YÖNETİM ---
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
                    const yeniListe = vList.filter(n => n !== hedef);
                    listeyiKaydet(yeniListe);
                    bot.chat(`🗑️ ${hedef} V listesinden silindi.`);
                } break;

            case 'v-list': bot.chat(`💎 V Listesi: ${listeyiOku().join(', ')}`); break;

            // --- EKONOMİ ---
            case 'dolar': bot.chat(`💵 ${miktar} Dolar = ${(miktar * BİRİM_KUR.dolar).toFixed(2)} TL.`); break;
            case 'euro': bot.chat(`💶 ${miktar} Euro = ${(miktar * BİRİM_KUR.euro).toFixed(2)} TL.`); break;
            case 'altın': bot.chat(`🪙 ${miktar} Altın = ${(miktar * BİRİM_KUR.altin).toFixed(2)} TL.`); break;
            case 'btc': bot.chat(`₿ ${miktar} BTC = ${(miktar * BİRİM_KUR.btc).toLocaleString()} $`); break;

            // --- YARDIM ---
            case 'yardım':
                bot.chat("🛠 1/4: %kit, %ping, %eniyiping, %enkötüping, %dolar, %euro, %altın, %btc");
                setTimeout(() => bot.chat("🛠 2/4: %pp, %afk, %logout, %zıpla, %koş, %dur, %yazı-tura, %zar, %şans"), 1500);
                setTimeout(() => bot.chat("🛠 3/4: %espri, %çeviri, %hava, %bilgi, %top10, %kurallar, %discord"), 3000);
                setTimeout(() => bot.chat("🛠 4/4: %aktif, %version, %pingim, %kimim, %neredeyim, %kd, %tps, %saat"), 4500);
                break;

            case 'v-yardım':
                if (!isV) return;
                bot.chat(`/msg ${senderName} 💎 V 1/3: %v, %v-k, %v-list, %bk, %bkc, %mevlana, %dur, %tp, %gel`);
                setTimeout(() => bot.chat(`/msg ${senderName} 💎 V 2/3: %basbul, %base-bul, %izle, %koru, %takip-et, %getir, %can-bak`), 1500);
                setTimeout(() => bot.chat(`/msg ${senderName} 💎 V 3/3: %envanter, %v-vaya, %dans, %spam, %afk, %god-mod, %herkesikes`), 3000);
                break;

            // --- ANA KOMUTLAR ---
            case 'ping': bot.chat(`📡 ${hedef} ping: ${bot.players[hedef]?.ping || "0"}ms`); break;
            case 'eniyiping': 
                let b={n:'',p:9999}; 
                Object.values(bot.players).forEach(p=>{if(p.ping>0&&p.ping<b.p)b={n:p.username,p:p.ping}}); 
                bot.chat(`🚀 En iyi: ${b.n} (${b.p}ms)`); 
                break;
            case 'pp': bot.chat(`${hedef} pp: 8${"=".repeat(Math.floor(Math.random()*15)+1)}D`); break;
            case 'zıpla': bot.setControlState('jump', true); setTimeout(()=>bot.setControlState('jump', false), 500); break;
            case 'dur': 
                bot.clearControlStates(); 
                bot.pathfinder.setGoal(null); 
                if(mevlanaInterval) clearInterval(mevlanaInterval); 
                bot.chat(`🛑 Durduruldu.`); 
                break;
            case 'yazı-tura': bot.chat(`🪙 Sonuç: ${Math.random()>0.5 ? "YAZI" : "TURA"}`); break;
            case 'zar': bot.chat(`🎲 Zar: ${Math.floor(Math.random()*6)+1}`); break;
            case 'şans': bot.chat(`🍀 %${Math.floor(Math.random()*100)} şanslısın.`); break;
            case 'hava':
                let s = args[0] ? args[0].toLowerCase().replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g') : "agri";
                if (SEHIRLER.includes(s)) bot.chat(`🌍 [HABER] ${s.toUpperCase()}: Bulutlu, Sıcaklık: ${Math.floor(Math.random()*15)+1}°C.`);
                break;
            case 'mevlana': 
                if(isV) { 
                    if(mevlanaInterval) clearInterval(mevlanaInterval); 
                    mevlanaInterval=setInterval(()=>bot.look(bot.entity.yaw+0.8,0,true),40); 
                    bot.chat(`🌀 Mevlana aktif.`); 
                } break;
            case 'gel': 
                if(isV) { 
                    const p = bot.players[senderName]?.entity; 
                    if(p) {
                        const m = new Movements(bot);
                        bot.pathfinder.setMovements(m);
                        bot.pathfinder.setGoal(new goals.GoalFollow(p,1)); 
                    }
                    bot.chat(`👣 Geliyorum.`); 
                } break;
            case 'tp': if(isV) bot.chat(`/tp ${hedef}`); break;
            case 'dans': if(isV) { bot.setControlState('jump',true); setTimeout(()=>bot.setControlState('jump',false),2000); } break;
            case 'tps': bot.chat(`⚡ TPS: ${bot.tps || "20.0"}`); break;
            case 'saat': bot.chat(`⌚ Saat: ${new Date().toLocaleTimeString('tr-TR')}`); break;
            case 'afk': 
                if(isAdmin) { 
                    if(args.length>0){afkSebep=args.join(' '); bot.chat(`💤 AFK: ${afkSebep}`);} 
                    else {afkSebep=null; bot.chat(`✅ Dönüldü.`);} 
                } break;
            case 'aktif': bot.chat(`👥 Aktif: ${Object.keys(bot.players).length}`); break;
            case 'version': bot.chat(`🤖 Sürüm: 1.20.1-Enhanced`); break;
        }
    });

    bot.once('spawn', () => {
        console.log(`Bot bağlandı: ${SUNUCU_IP}`);
        setTimeout(() => bot.chat('/login 918273645'), 3000);
        
        const m = new Movements(bot);
        bot.pathfinder.setMovements(m);

        if (duyuruInterval) clearInterval(duyuruInterval);
        duyuruInterval = setInterval(() => {
            bot.chat('Ben 7/24 botum');
        }, 120000);
    });

    bot.on('end', () => {
        if (duyuruInterval) clearInterval(duyuruInterval);
        setTimeout(createBot, 5000);
    });
}

createBot();
