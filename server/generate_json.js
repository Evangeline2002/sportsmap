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

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combinedData, null, 2));
    console.log(`Success! Generated ${combinedData.length} records in ${OUTPUT_PATH}`);
} catch (e) {
    console.error(e);
}
