const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'TamilNadu_Sports_Data.xlsx');

try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = 'Soapy football';

    if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const updatedData = data.map(item => ({
            ...item,
            Category: 'Soapy Football'
        }));

        const newSheet = xlsx.utils.json_to_sheet(updatedData);
        workbook.Sheets[sheetName] = newSheet;

        xlsx.writeFile(workbook, EXCEL_PATH);
        console.log(`Successfully updated category in sheet: ${sheetName}`);
    } else {
        console.error(`Sheet "${sheetName}" not found in Excel file.`);
    }
} catch (e) {
    console.error('Error updating Excel:', e);
}
