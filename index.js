const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');

dotenv.config();

const app = express();
app.use(express.json());
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const model = "gemini-2.0-flash"
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

// Only start the server if this file is run directly (not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gemini API server is running at http://localhost:${PORT}`);
  });
}

// Export the app for testing
module.exports = app;

app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;

  try {
    const generate = await ai.models.generateContent({
      model: model,
      contents: prompt
    })
    const response = generate.text;
    res.json({ output: response });
    console.log(response)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate-from-image', upload.single('image'), async(req, res) => {
  const prompt = req.body.prompt || 'What is the title of the image?'
  const image = req.file.path

  const myfile = await ai.files.upload({
    file: image,
    config: { mimeType: "image/webp" },
  });

  try {
    const generate = await ai.models.generateContent({
      model: model,
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        prompt,
      ]),
    });
    const response = generate.text;
    res.json({ output: response });
    console.log(response);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
})

app.post('/generate-from-document', upload.single('document'), async(req, res) => {
  const prompt = req.body.prompt || 'What is the content of this document?'
  const document = req.file.path

  const contents = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'application/pdf', // Assuming PDF, adjust as needed
        data: Buffer.from(fs.readFileSync(document)).toString("base64")
      }
    }
  ];

  try {
    const generate = await ai.models.generateContent({
      model: model,
      contents: contents,
    });
    const response = generate.text;
    res.json({ output: response });
    console.log(response);
  } catch(error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(document);
  }
});

app.post('/generate-from-audio', upload.single('audio'), async(req, res) => {
  const prompt = req.body.prompt || 'What is being said in this audio?'
  const audio = req.file.path

  const contents = [
    { text: prompt },
    {
      inlineData: {
        mimeType: 'audio/mp3', // Assuming MP3, adjust as needed
        data: Buffer.from(fs.readFileSync(audio)).toString("base64")
      }
    }
  ];

  try {
    const generate = await ai.models.generateContent({
      model: model,
      contents: contents,
    });
    const response = generate.text;
    res.json({ output: response });
    console.log(response);
  } catch(error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(audio);
  }
});