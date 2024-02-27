const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const attendanceRoutes = require('./routes/attendance');
const qrCodeRoutes = require('./routes/qrCode');

app.use(bodyParser.json());
app.use(cors());
app.use('/api/yoklama', yoklamaRoutes);


app.use('/api/qr', qrCodeRoutes);

app.post('/api/yoklama', (req, res) => {
    const ogrenciId = req.body.ogrenciId;
    console.log('Yoklama alındı:', ogrenciId);
    // Burada yoklama işlemini veritabanına kaydetme işlemi yapılacak.
    res.status(200).send({ message: 'Yoklama başarıyla alındı' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
});
