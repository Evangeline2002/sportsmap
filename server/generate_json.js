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
            combinedData = [...combinedData, ...data.map((item, idx) => {
                const rowName = item['Name'] || item['Name '] || `Facility ${idx + 1}`;
                let rowCategory = item['Category'];

                if (!rowCategory || rowCategory === 'Others') {
                    if (rowName.toLowerCase().includes('pickle')) rowCategory = 'Pickleball';
                    else if (rowName.toLowerCase().includes('shuttle') || rowName.toLowerCase().includes('badminton')) rowCategory = 'Shuttle';
                    else if (name === 'Soapy football') rowCategory = 'Soapy Football';
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

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combinedData, null, 2));
    console.log(`Success! Generated ${combinedData.length} records in ${OUTPUT_PATH}`);
} catch (e) {
    console.error(e);
}
