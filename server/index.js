require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const port = 5500;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

mongoose.connect('mongodb://localhost:27017/tn_sports').then(() => console.log('DB Connected'));

const Record = mongoose.model('Record', new mongoose.Schema({
  id: String, District: String, Category: String, Address: String, Phone: String, Name: String, lat: Number, lng: Number, completed: { type: Boolean, default: false }
}));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('UPLOAD REQUEST RECEIVED');
    if (!req.file) return res.json({ count: 0, error: 'No file' });

    console.log('Processing file:', req.file.originalname);
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    let combinedData = [];

    workbook.SheetNames.forEach(name => {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
      console.log(`Sheet ${name}: ${data.length} rows`);
      if (data.length > 0) {
        combinedData = [...combinedData, ...data.map((item, idx) => {
          const rowName = item['Name'] || item['Name '] || `Facility ${idx + 1}`;
          let rowCategory = item['Category'];

          if (!rowCategory || rowCategory === 'Others' || rowCategory.includes('/') || rowCategory === 'Academy') {
            const lcName = rowName.toLowerCase();
            if (name === 'Soapy football' || lcName.includes('soapy')) rowCategory = 'Soapy Football';
            else if (lcName.includes('pickle')) rowCategory = 'Pickleball';
            else if (lcName.includes('shuttle')) rowCategory = 'Shuttle';
            else if (lcName.includes('badminton')) rowCategory = 'Badminton';
            else if (lcName.includes('cricket')) rowCategory = 'Cricket';
            else if (lcName.includes('tennis')) rowCategory = 'Tennis';
            else if (lcName.includes('hockey')) rowCategory = 'Hockey';
            else if (lcName.includes('basketball')) rowCategory = 'Basketball';
            else if (lcName.includes('volleyball')) rowCategory = 'Volleyball';
            else if (lcName.includes('swimming')) rowCategory = 'Swimming';
            else if (lcName.includes('football')) rowCategory = 'Football';
            else if (lcName.includes('turf')) rowCategory = 'Turf';
            else if (lcName.includes('school')) rowCategory = 'School';
            else if (lcName.includes('class')) rowCategory = 'Class';
            else if (lcName.includes('academy')) rowCategory = 'Academy';
            else rowCategory = 'Others';
          }

          return {
            id: (item['S.No'] || `${name}-${idx}`).toString(),
            District: item['District'] || item['District Name'] || name,
            Category: rowCategory,
            Address: item['Address'] || 'N/A',
            Phone: (item['Phone'] || 'N/A').toString(),
            Name: rowName,
            completed: false
          };
        })];
      }
    });

    console.log('TOTAL:', combinedData.length);
    await Record.deleteMany({});
    if (combinedData.length > 0) await Record.insertMany(combinedData);
    res.json({ count: combinedData.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/records', async (req, res) => res.json(await Record.find()));
app.patch('/api/records/:id', async (req, res) => res.json(await Record.findByIdAndUpdate(req.params.id, req.body, { new: true })));

app.listen(port, () => console.log('SERVER ON 5500'));
