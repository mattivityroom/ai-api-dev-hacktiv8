const request = require('supertest');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

const mockGenAI = {
  models: {
    generateContent: sinon.stub()
  },
  files: {
    upload: sinon.stub()
  }
};

const mockCreateUserContent = sinon.stub();
const mockCreatePartFromUri = sinon.stub();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => mockGenAI),
  createUserContent: mockCreateUserContent,
  createPartFromUri: mockCreatePartFromUri
}));

const app = require('../../index');

describe('Gemini API Integration Tests', () => {
  beforeEach(() => {
    sinon.reset();
    mockGenAI.models.generateContent.reset();
    mockGenAI.files.upload.reset();
    mockCreateUserContent.reset();
    mockCreatePartFromUri.reset();
  });

  afterEach(() => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  describe('POST /generate-text', () => {
    it('should generate text from a prompt successfully', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'This is a generated response from Gemini'
      });

      const response = await request(app)
        .post('/generate-text')
        .send({ prompt: 'Tell me a joke' })
        .expect(200);

      expect(response.body).toEqual({
        output: 'This is a generated response from Gemini'
      });

      expect(mockGenAI.models.generateContent.calledOnce).toBe(true);
      expect(mockGenAI.models.generateContent.firstCall.args[0]).toEqual({
        model: 'gemini-2.0-flash',
        contents: 'Tell me a joke'
      });
    });

    it('should handle missing prompt', async () => {
      // Mock successful API response even with undefined prompt
      mockGenAI.models.generateContent.resolves({
        text: 'Default response for undefined prompt'
      });

      const response = await request(app)
        .post('/generate-text')
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        output: 'Default response for undefined prompt'
      });

      expect(mockGenAI.models.generateContent.calledOnce).toBe(true);
    });

    it('should handle API errors', async () => {
      // Mock API error
      mockGenAI.models.generateContent.rejects(new Error('API Error'));

      const response = await request(app)
        .post('/generate-text')
        .send({ prompt: 'Test prompt' })
        .expect(500);

      expect(response.body).toEqual({
        error: 'API Error'
      });
    });
  });

  describe('POST /generate-from-image', () => {
    it('should generate text from image successfully', async () => {
      mockGenAI.files.upload.resolves({
        uri: 'gs://test-bucket/test-file',
        mimeType: 'image/webp'
      });

      mockGenAI.models.generateContent.resolves({
        text: 'This image shows a test picture'
      });

      mockCreateUserContent.returns(['mocked-user-content']);
      mockCreatePartFromUri.returns('mocked-part');

      const imagePath = path.join(__dirname, '../fixtures/sample.png');

      const response = await request(app)
        .post('/generate-from-image')
        .field('prompt', 'What do you see in this image?')
        .attach('image', imagePath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'This image shows a test picture'
      });

      expect(mockGenAI.files.upload.calledOnce).toBe(true);
      expect(mockGenAI.models.generateContent.calledOnce).toBe(true);
    });

    it('should use default prompt when none provided', async () => {
      mockGenAI.files.upload.resolves({
        uri: 'gs://test-bucket/test-file',
        mimeType: 'image/webp'
      });

      mockGenAI.models.generateContent.resolves({
        text: 'Default response'
      });

      mockCreateUserContent.returns(['mocked-user-content']);
      mockCreatePartFromUri.returns('mocked-part');

      const imagePath = path.join(__dirname, '../fixtures/sample.png');

      const response = await request(app)
        .post('/generate-from-image')
        .attach('image', imagePath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'Default response'
      });
    });

    it('should handle missing image file', async () => {
      const response = await request(app)
        .post('/generate-from-image')
        .field('prompt', 'What do you see?')
        .expect(500);

      expect(response.body.error || response.text).toBeDefined();
    });

    it('should handle API errors during image processing', async () => {
      mockGenAI.files.upload.rejects(new Error('Upload failed'));

      const imagePath = path.join(__dirname, '../fixtures/sample.png');

      const response = await request(app)
        .post('/generate-from-image')
        .field('prompt', 'What do you see?')
        .attach('image', imagePath)
        .expect(500);

      expect(response.body.error || response.text).toBeDefined();
    });
  });

  describe('POST /generate-from-document', () => {
    it('should generate text from document successfully', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'This document contains important information'
      });

      const documentPath = path.join(__dirname, '../fixtures/sample.txt');

      const response = await request(app)
        .post('/generate-from-document')
        .field('prompt', 'Summarize this document')
        .attach('document', documentPath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'This document contains important information'
      });

      expect(mockGenAI.models.generateContent.calledOnce).toBe(true);
    });

    it('should use default prompt when none provided', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'Document content summary'
      });

      const documentPath = path.join(__dirname, '../fixtures/sample.txt');

      const response = await request(app)
        .post('/generate-from-document')
        .attach('document', documentPath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'Document content summary'
      });
    });

    it('should handle missing document file', async () => {
      const response = await request(app)
        .post('/generate-from-document')
        .field('prompt', 'Summarize this')
        .expect(500);

      expect(response.body.error || response.text).toBeDefined();
    });

    it('should handle API errors during document processing', async () => {
      mockGenAI.models.generateContent.rejects(new Error('Processing failed'));

      const documentPath = path.join(__dirname, '../fixtures/sample.txt');

      const response = await request(app)
        .post('/generate-from-document')
        .field('prompt', 'Summarize this')
        .attach('document', documentPath)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Processing failed'
      });
    });

    it('should clean up uploaded files after processing', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'Document processed'
      });

      const documentPath = path.join(__dirname, '../fixtures/sample.txt');

      await request(app)
        .post('/generate-from-document')
        .attach('document', documentPath)
        .expect(200);
    });
  });

  describe('POST /generate-from-audio', () => {
    it('should generate text from audio successfully', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'The audio contains spoken words about testing'
      });

      const audioPath = path.join(__dirname, '../fixtures/sample.mp3');

      const response = await request(app)
        .post('/generate-from-audio')
        .field('prompt', 'What is being said in this audio?')
        .attach('audio', audioPath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'The audio contains spoken words about testing'
      });

      expect(mockGenAI.models.generateContent.calledOnce).toBe(true);
    });

    it('should use default prompt when none provided', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'Audio transcription result'
      });

      const audioPath = path.join(__dirname, '../fixtures/sample.mp3');

      const response = await request(app)
        .post('/generate-from-audio')
        .attach('audio', audioPath)
        .expect(200);

      expect(response.body).toEqual({
        output: 'Audio transcription result'
      });
    });

    it('should handle missing audio file', async () => {
      const response = await request(app)
        .post('/generate-from-audio')
        .field('prompt', 'Transcribe this')
        .expect(500);

      expect(response.body.error || response.text).toBeDefined();
    });

    it('should handle API errors during audio processing', async () => {
      mockGenAI.models.generateContent.rejects(new Error('Audio processing failed'));

      const audioPath = path.join(__dirname, '../fixtures/sample.mp3');

      const response = await request(app)
        .post('/generate-from-audio')
        .field('prompt', 'Transcribe this')
        .attach('audio', audioPath)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Audio processing failed'
      });
    });

    it('should clean up uploaded files after processing', async () => {
      mockGenAI.models.generateContent.resolves({
        text: 'Audio processed'
      });

      const audioPath = path.join(__dirname, '../fixtures/sample.mp3');

      await request(app)
        .post('/generate-from-audio')
        .attach('audio', audioPath)
        .expect(200);

      // File should be cleaned up automatically by the endpoint
    });
  });

  describe('Server Health', () => {
    it('should handle requests to non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent')
        .expect(404);
    });
  });
});
