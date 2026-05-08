const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'TamilNadu_Sports_Data.xlsx');
const MONGO_URI = 'mongodb://localhost:27017/tn_sports';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const Record = mongoose.model('Record', new mongoose.Schema({
      id: String, District: String, Category: String, Address: String, Phone: String, Name: String, lat: Number, lng: Number, completed: { type: Boolean, default: false }
    }));

    console.log('Reading Excel file:', EXCEL_PATH);
    const workbook = xlsx.readFile(EXCEL_PATH);
    let combinedData = [];

    workbook.SheetNames.forEach(name => {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
      console.log(`Sheet ${name}: ${data.length} rows`);
      if (data.length > 0) {
        combinedData = [...combinedData, ...data.map((item, idx) => ({
          id: (item['S.No'] || `${name}-${idx}`).toString(),
          District: item['District'] || item['District Name'] || name,
          Category: item['Category'] || 'Others',
          Address: item['Address'] || 'N/A',
          Phone: (item['Phone'] || 'N/A').toString(),
          Name: item['Name'] || `Facility ${idx + 1}`,
          completed: false
        }))];
      }
    });

    console.log('Total records to insert:', combinedData.length);

    console.log('Clearing old records...');
    await Record.deleteMany({});

    console.log('Inserting new records...');
    if (combinedData.length > 0) {
      await Record.insertMany(combinedData);
    }

    console.log('Success! Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
