const fs = require('fs');
const path = require('path');

// Use hardcoded path to be absolute sure
const inputPath = 'c:/Users/ASUS/Desktop/Codes/bms-clientside/app/admin/dashboard/payments/page.tsx';
const outputPath = 'c:/Users/ASUS/Desktop/Codes/bms-clientside/app/admin/dashboard/payments/page_fixed.tsx';

try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const lines = data.split(/\r?\n/);
    console.log('Original line count:', lines.length);

    if (lines.length > 851) {
        const cleanLines = lines.slice(0, 851);
        const cleanContent = cleanLines.join('\n');
        fs.writeFileSync(outputPath, cleanContent, 'utf8');
        console.log(`Wrote ${cleanLines.length} lines to ${outputPath}`);
    } else {
        console.log('Original file was short enough, copying as is.');
        fs.writeFileSync(outputPath, data, 'utf8');
    }
} catch (err) {
    console.error('Error:', err);
}
