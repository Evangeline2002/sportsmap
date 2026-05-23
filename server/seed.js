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
