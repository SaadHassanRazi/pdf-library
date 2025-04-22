const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { generatePDF } = require('./generatePDF');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve static files (React build)
app.use(express.static(path.join(__dirname, '../client/build')));

// Middleware to parse JSON
app.use(express.json());

// Ensure uploads directory exists
fs.mkdir('uploads', { recursive: true });

// API to generate PDF
app.post('/api/generate-pdf', upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Generate PDF
    const pdfBuffer = await generatePDF(text, imagePath);

    // Clean up uploaded file
    if (imagePath) {
      await fs.unlink(imagePath).catch(err => console.warn('Failed to delete temp file:', err));
    }

    // Send PDF as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="generated.pdf"'
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});