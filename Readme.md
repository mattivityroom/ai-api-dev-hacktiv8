# AI API Development with Gemini

This project is an Express.js API that leverages Google's Gemini AI to generate text from various inputs including plain text prompts, images, documents, and audio files.

## Features

- Generate text from text prompts
- Generate text from images
- Generate text from documents (PDF)
- Generate text from audio files (MP3)

## Prerequisites

- Node.js (latest LTS version recommended)
- Google Gemini API key

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-api-dev-hacktiv8
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Running the Application

Start the server:
```
node index.js
```

The server will run at `http://localhost:3000`.

## API Documentation

The API documentation is available as a Bruno collection in the `hacktiv8_api_collection/` directory. The collection contains request examples for all endpoints.

### Using the Bruno Collection

1. Install Bruno API client: https://www.usebruno.com/
2. Open Bruno and import the collection from `hacktiv8_api_collection/`

### Available Endpoints

#### 1. Generate Text from Prompt

- **Endpoint**: `POST /generate-text`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "prompt": "Your text prompt here"
  }
  ```
- **Example**: See `hacktiv8_api_collection/generate_text.bru`

#### 2. Generate Text from Image

- **Endpoint**: `POST /generate-from-image`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `prompt`: Text prompt about the image (optional)
  - `image`: Image file
- **Example**: See `hacktiv8_api_collection/generate_text_from_image.bru`

#### 3. Generate Text from Document

- **Endpoint**: `POST /generate-from-document`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `prompt`: Text prompt about the document (optional)
  - `document`: Document file (PDF)
- **Example**: See `hacktiv8_api_collection/generate_text_from_document.bru`

#### 4. Generate Text from Audio

- **Endpoint**: `POST /generate-from-audio`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `prompt`: Text prompt about the audio (optional)
  - `audio`: Audio file (MP3)
- **Example**: See `hacktiv8_api_collection/generate_text_from_audio.bru`

## Response Format

All endpoints return responses in the following JSON format:

```json
{
  "output": "Generated text response from Gemini AI"
}
```

## Error Handling

In case of errors, the API returns:

```json
{
  "error": "Error message"
}
```

## Project Structure

- `index.js` - Main application file with API endpoints
- `uploads/` - Temporary storage for uploaded files
- `hacktiv8_api_collection/` - Bruno API collection with request examples
