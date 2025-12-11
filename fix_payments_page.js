const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/admin/dashboard/payments/page.tsx');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);
    console.log('Original line count:', lines.length);

    if (lines.length > 851) {
        const cleanLines = lines.slice(0, 851);
        const cleanContent = cleanLines.join('\n');
        fs.writeFileSync(filePath, cleanContent, 'utf8');
        console.log('File written. New line count:', cleanContent.split('\n').length);
    } else {
        console.log('File is short enough.');
    }
} catch (err) {
    console.error('Error:', err);
}
