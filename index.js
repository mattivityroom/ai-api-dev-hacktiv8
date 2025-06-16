const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');

dotenv.config();

const app = express();
app.use(express.json());
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const model = "gemini-2.0-flash"
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Gemini API server is running at http://localhost:${PORT}`);
});

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
    console.error("Error during text generation:", error);
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
    console.error("Error during text generation:", error);
    res.status(500).json({ error: error.message });
  }
})

app.post
