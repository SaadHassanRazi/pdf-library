const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs').promises;

async function generatePDF(text, imagePath) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([600, 400]);
  
  // Get the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Draw title
  page.drawText('PDF Library Project', {
    x: 50,
    y: 350,
    size: 24,
    font,
    color: rgb(0, 0, 1),
  });
  
  // Draw user-provided text
  page.drawText(text || 'No text provided.', {
    x: 50,
    y: 300,
    size: 12,
    font,
    color: rgb(0, 0, 0),
    maxWidth: 500,
    lineHeight: 15,
  });
  
  // Embed image if provided
  if (imagePath) {
    try {
      const imageBytes = await fs.readFile(imagePath);
      const image = await pdfDoc.embedJpg(imageBytes); // Assumes JPG; adjust for PNG if needed
      page.drawImage(image, {
        x: 50,
        y: 150,
        width: 100,
        height: 100,
      });
    } catch (error) {
      console.warn('Failed to embed image:', error.message);
    }
  }
  
  // Save and return PDF as buffer
  return await pdfDoc.save();
}

module.exports = { generatePDF };