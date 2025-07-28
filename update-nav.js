// Update all HTML files to add Home link and clickable title
const fs = require('fs');
const path = require('path');

const files = [
    'syntax.html',
    'temporal.html', 
    'data-structures.html',
    'functions.html',
    'examples.html'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Make title clickable
    content = content.replace(
        /<h1>Tesseract<\/h1>/,
        '<a href="index.html" style="text-decoration: none; color: white;"><h1>Tesseract</h1></a>'
    );
    
    // Add Home link
    content = content.replace(
        /(<div class="nav-menu">\s*)/,
        '$1<a href="index.html">Home</a>\n                '
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});