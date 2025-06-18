const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "GOOGLE_API_KEY" });
const model = "gemini-2.0-flash"

const upload = multer({ dest: 'uploads/' });

async function main() {
  const myfile = await ai.files.upload({
    file: "google_agentspace.webp",
    config: { mimeType: "image/webp" },
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      "What is the title of this image ?",
    ]),
  });
  console.log(response.text);
}

await main();
