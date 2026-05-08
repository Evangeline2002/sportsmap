const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'TamilNadu_Sports_Data.xlsx');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'records.json');

// Ensure directory exists
const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    let combinedData = [];

    workbook.SheetNames.forEach(name => {
        if (name === 'Master_Data') return;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
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

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combinedData, null, 2));
    console.log(`Success! Generated ${combinedData.length} records in ${OUTPUT_PATH}`);
} catch (e) {
    console.error(e);
}
