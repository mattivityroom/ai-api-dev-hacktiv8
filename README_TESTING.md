# Integration Testing for Gemini API Server

This document explains the integration testing setup for the Express.js application that integrates with Google's Gemini API.

## Testing Libraries Used

- **Jest**: Main testing framework
- **Supertest**: HTTP testing library for Express applications
- **Sinon**: For creating stubs and mocks

## Test Structure

### Test Files
- `tests/integration/api.test.js` - Main integration test suite
- `tests/setup.js` - Test configuration and cleanup
- `tests/fixtures/` - Sample files for testing file uploads
- `jest.config.js` - Jest configuration
- `.env.test` - Test environment variables

### Test Coverage

The test suite covers all four API endpoints:

#### 1. POST /generate-text
- ✅ Successful text generation with prompt
- ✅ Handling missing prompt
- ✅ API error handling

#### 2. POST /generate-from-image
- ✅ Successful image processing with file upload
- ✅ Default prompt when none provided
- ✅ Missing image file error handling
- ✅ API error handling during image processing

#### 3. POST /generate-from-document
- ✅ Successful document processing with file upload
- ✅ Default prompt when none provided
- ✅ Missing document file error handling
- ✅ API error handling during document processing
- ✅ File cleanup after processing

#### 4. POST /generate-from-audio
- ✅ Successful audio processing with file upload
- ✅ Default prompt when none provided
- ✅ Missing audio file error handling
- ✅ API error handling during audio processing
- ✅ File cleanup after processing

#### 5. Server Health
- ✅ 404 handling for non-existent endpoints

## Running Tests

### Basic Test Run
```bash
npm test
```

### Watch Mode (runs tests when files change)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Mocking Strategy

The tests use comprehensive mocking to avoid making real API calls:

1. **Google Gemini API**: Mocked using Jest's module mocking system
2. **File Operations**: Real file operations for testing file uploads
3. **Console Output**: Mocked to reduce noise during testing

## Test Environment

- Uses `.env.test` for test-specific environment variables
- Automatically cleans up uploaded files after each test
- Isolated test environment that doesn't interfere with development

## Key Features

1. **No Real API Calls**: All external API calls are mocked
2. **File Upload Testing**: Tests actual file upload functionality
3. **Error Scenarios**: Comprehensive error handling testing
4. **Cleanup**: Automatic cleanup of test artifacts
5. **Fast Execution**: Tests run quickly due to mocking

## Test Results

All 18 tests pass successfully:
- 3 tests for `/generate-text` endpoint
- 4 tests for `/generate-from-image` endpoint
- 5 tests for `/generate-from-document` endpoint
- 5 tests for `/generate-from-audio` endpoint
- 1 test for server health
