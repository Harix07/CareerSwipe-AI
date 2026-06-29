const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docxPath = 'c:\\Users\\PMLS\\Desktop\\Gravity 2.0\\report section to complete.docx';
const outputPath = path.join(__dirname, 'extracted_report.txt');

mammoth.extractRawText({ path: docxPath })
  .then(function(result) {
    const text = result.value; // The raw text
    fs.writeFileSync(outputPath, text);
    console.log('Successfully extracted text to extracted_report.txt');
  })
  .catch(function(err) {
    console.error('Error extracting text:', err);
  });
