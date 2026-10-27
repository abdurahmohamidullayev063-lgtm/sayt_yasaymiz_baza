const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend fayllarini ulash uchun
app.use(express.static(path.join(__dirname)));

// MongoDB Atlas ulanish havolasi (Sizning parolingiz bilan)
const MONGO_URI = 'mongodb+srv://a99684865_db_user:SAYT_YASAYMIZ@cluster0.40uva5s.mongodb.net/sayt_yasaymiz?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas ga muvaffaqiyatli ulandi!'))
  .catch(err => console.log('Xatolik yuz berdi:', err));

// Ma'lumotlar sxemasi
const DataSchema = new mongoose.Schema({
  data: Object
});
const Record = mongoose.model('Record', DataSchema);

// Ma'lumotlarni olish
app.get('/api/data', async (req, res) => {
  try {
    let record = await Record.findOne();
    if (!record) {
      record = new Record({ data: { clients: [], transactions: [], workers: [] } });
      await record.save();
    }
    res.json(record.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ma'lumotlarni saqlash / yangilash
app.post('/api/data', async (req, res) => {
  try {
    let record = await Record.findOne();
    if (!record) {
      record = new Record({ data: req.body });
    } else {
      record.data = req.body;
      record.markModified('data');
    }
    await record.save();
    res.json({ success: true, data: record.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi!`);
});