const xlsx = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'TamilNadu_Sports_Data.xlsx');

try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    console.log('Sheets:', workbook.SheetNames);
    workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(`Sheet "${name}": ${data.length} rows`);
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        }
    });
} catch (e) {
    console.error(e);
}
