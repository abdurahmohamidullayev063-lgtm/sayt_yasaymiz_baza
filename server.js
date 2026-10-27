const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas ulanish manzili
const MONGO_URI = 'mongodb+srv://a99684865_db_user:SAYT_YASAYMIZ@cluster0.40uva5s.mongodb.net/sayt_yasaymiz?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas ga muvaffaqiyatli ulandi!'))
  .catch(err => console.log('Xatolik yuz berdi:', err));

// MongoDB sxemasi (Barcha ma'lumotlar bulutda saqlanadi)
const BusinessSchema = new mongoose.Schema({
  clients: { type: Array, default: [] },
  workers: { type: Array, default: [] },
  transactions: { type: Array, default: [] }
});

const Business = mongoose.model('Business', BusinessSchema);

// Bazadan ma'lumotni olish yoki yaratish funksiyasi
async function getDB() {
  let doc = await Business.findOne();
  if (!doc) {
    doc = new Business({ clients: [], workers: [], transactions: [] });
    await doc.save();
  }
  return doc;
}

// Boshqaruv paneli (Dizayn va Interfeys)
app.get('/', async (req, res) => {
  try {
    const db = await getDB();
    
    // 1. Jami mijozlardan tushgan pul
    let clientIncome = 0;
    db.clients.forEach(c => clientIncome += Number(c.price || 0));

    // 2. Qo'shimcha kirimlar va chiqimlar
    let extraIncome = 0;
    let totalExpenses = 0;

    db.transactions.forEach(t => {
      if (t.type === 'income') extraIncome += Number(t.amount || 0);
      if (t.type === 'expense') totalExpenses += Number(t.amount || 0);
    });

    const totalIncome = clientIncome + extraIncome;
    const netBalance = totalIncome - totalExpenses;

    res.send(`
      <!DOCTYPE html>
      <html lang="uz">
      <head>
          <meta charset="UTF-8">
          <title>Sayt Yasaymiz - Professional Boshqaruv Markazi</title>
          <style>
              * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              body { background: #0f172a; color: #f8fafc; padding: 20px; }
              .container { max-width: 1200px; margin: auto; }
              header { text-align: center; margin-bottom: 30px; }
              header h1 { color: #38bdf8; font-size: 28px; margin-bottom: 5px; }
              header p { color: #94a3b8; font-size: 14px; }

              .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
              .card { background: #1e293b; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border-left: 5px solid #38bdf8; }
              .card.green { border-left-color: #22c55e; }
              .card.red { border-left-color: #ef4444; }
              .card.purple { border-left-color: #a855f7; }
              .card h3 { color: #94a3b8; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }
              .card p { font-size: 24px; font-weight: bold; color: #f8fafc; }

              .forms-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
              form { background: #1e293b; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 12px; }
              form h3 { color: #f1f5f9; font-size: 16px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 5px; }
              input, select { padding: 10px 12px; font-size: 14px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; outline: none; }
              input:focus, select:focus { border-color: #38bdf8; }
              button { padding: 11px; background: #38bdf8; color: #0f172a; border: none; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: 0.2s; }
              button:hover { background: #0ea5e9; }
              button.red { background: #ef4444; color: white; }
              button.red:hover { background: #dc2626; }
              button.green { background: #22c55e; color: white; }
              button.green:hover { background: #16a34a; }

              .section-title { font-size: 18px; margin: 25px 0 15px 0; color: #e2e8f0; border-left: 4px solid #38bdf8; padding-left: 10px; }
              .table-container { background: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; text-align: left; }
              th, td { padding: 12px 15px; border-bottom: 1px solid #334155; font-size: 14px; }
              th { background: #334155; color: #f8fafc; font-weight: 600; }
              tr:hover { background: #26334d; }
              .badge-income { color: #22c55e; font-weight: bold; }
              .badge-expense { color: #ef4444; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>🚀 Sayt Yasaymiz - Biznes & Moliya Paneli</h1>
                  <p>Barcha buyurtmalar, ishchilar dolyasi, pul qo'shish va yechish jarayonlarini boshqarish markazi</p>
              </header>
              
              <div class="stats">
                  <div class="card">
                      <h3>Jami Kirim (Aylanma)</h3>
                      <p>${totalIncome.toLocaleString()} so'm</p>
                  </div>
                  <div class="card red">
                      <h3>Jami Chiqim (Yechilgan Pul)</h3>
                      <p>${totalExpenses.toLocaleString()} so'm</p>
                  </div>
                  <div class="card green">
                      <h3>Sof Balans (Qolgan Pul)</h3>
                      <p>${netBalance.toLocaleString()} so'm</p>
                  </div>
                  <div class="card purple">
                      <h3>Jami Ishchilar / Mijozlar</h3>
                      <p>${db.workers.length} ta / ${db.clients.length} ta</p>
                  </div>
              </div>

              <div class="forms-grid">
                  <form action="/add-client" method="POST">
                      <h3>💼 Yangi Mijoz va Sayt</h3>
                      <input type="text" name="name" placeholder="Mijoz ismi (masalan: Fayz Cafe)" required>
                      <input type="text" name="phone" placeholder="Telefon raqami" required>
                      <input type="text" name="project" placeholder="Sayt turi (E-commerce, Landing)" required>
                      <input type="number" name="price" placeholder="Kelishilgan summa" required>
                      <button type="submit" class="green">Mijozni Qo'shish</button>
                  </form>

                  <form action="/add-transaction" method="POST">
                      <h3>💵 Pul Qo'shish / Yechish (Kassa)</h3>
                      <select name="type" required>
                          <option value="income">➕ Pul Qo'shish (Kirim)</option>
                          <option value="expense">➖ Pul Yechish / Chiqim</option>
                      </select>
                      <input type="text" name="title" placeholder="Sababi (Masalan: Avans, Harajat, Bonus)" required>
                      <input type="number" name="amount" placeholder="Summasi" required>
                      <button type="submit">Tranzaksiyani Saqlash</button>
                  </form>

                  <form action="/add-worker" method="POST">
                      <h3>👷 Yangi Ishchi (Aziz va b.)</h3>
                      <input type="text" name="workerName" placeholder="Ishchi ismi (Aziz)" required>
                      <input type="text" name="role" placeholder="Mutaxassisligi (Frontend, Backend)" required>
                      <input type="number" name="sharePercent" placeholder="Dolya foizi (masalan: 30)" required>
                      <button type="submit">Ishchini Qo'shish</button>
                  </form>
              </div>

              <h3 class="section-title">👥 Ishchilar va Hisob-kitoblar (Dolya)</h3>
              <div class="table-container">
                  <table>
                      <tr>
                          <th>Ishchi Ismi</th>
                          <th>Roli</th>
                          <th>Ulush Foizi (%)</th>
                          <th>Olishi Kerak bo'lgan Pul</th>
                      </tr>
                      ${db.workers.map(w => {
                          let workerMoney = totalIncome * (Number(w.sharePercent || 0) / 100);
                          return `
                              <tr>
                                  <td><b>${w.workerName}</b></td>
                                  <td>${w.role}</td>
                                  <td>${w.sharePercent}%</td>
                                  <td style="color: #38bdf8; font-weight: bold;">${workerMoney.toLocaleString()} so'm</td>
                              </tr>
                          `;
                      }).join('')}
                  </table>
              </div>

              <h3 class="section-title">📊 Kassa Tarixi (Pul Qo'shish va Yechishlar)</h3>
              <div class="table-container">
                  <table>
                      <tr>
                          <th>Turi</th>
                          <th>Sababi / Izoh</th>
                          <th>Summasi</th>
                      </tr>
                      ${db.transactions.map(t => `
                          <tr>
                              <td>${t.type === 'income' ? '<span class="badge-income">➕ Kirim (Pul qo\'shildi)</span>' : '<span class="badge-expense">➖ Chiqim (Pul yechildi)</span>'}</td>
                              <td>${t.title}</td>
                              <td class="${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${Number(t.amount).toLocaleString()} so'm</td>
                          </tr>
                      `).join('')}
                  </table>
              </div>

              <h3 class="section-title">📋 Sotilgan Saytlar va Mijozlar Tarixi</h3>
              <div class="table-container">
                  <table>
                      <tr>
                          <th>Mijoz / Obekt</th>
                          <th>Telefon</th>
                          <th>Sayt Turi</th>
                          <th>Summasi</th>
                      </tr>
                      ${db.clients.map(c => `
                          <tr>
                              <td><b>${c.name}</b></td>
                              <td>${c.phone}</td>
                              <td>${c.project}</td>
                              <td style="color: #22c55e; font-weight: bold;">${Number(c.price).toLocaleString()} so'm</td>
                          </tr>
                      `).join('')}
                  </table>
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Xatolik yuz berdi: " + err.message);
  }
});

// Mijoz qo'shish
app.post('/add-client', async (req, res) => {
  try {
    const { name, phone, project, price } = req.body;
    let db = await getDB();
    db.clients.push({ id: Date.now(), name, phone, project, price: Number(price) });
    db.markModified('clients');
    await db.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Xatolik: " + err.message);
  }
});

// Pul qo'shish yoki yechish
app.post('/add-transaction', async (req, res) => {
  try {
    const { type, title, amount } = req.body;
    let db = await getDB();
    db.transactions.push({ id: Date.now(), type, title, amount: Number(amount) });
    db.markModified('transactions');
    await db.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Xatolik: " + err.message);
  }
});

// Ishchi qo'shish
app.post('/add-worker', async (req, res) => {
  try {
    const { workerName, role, sharePercent } = req.body;
    let db = await getDB();
    db.workers.push({ id: Date.now(), workerName, role, sharePercent: Number(sharePercent) });
    db.markModified('workers');
    await db.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Xatolik: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Professional Moliya Paneli MongoDB bilan ${PORT}-portda ishga tushdi!`);
});