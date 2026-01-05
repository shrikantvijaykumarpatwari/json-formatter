# JSON Formatter & Validator

A powerful JSON formatter and validator with support for multiple RFC specifications. This application helps you format, validate, and fix common JSON errors.

## Features

- ✨ **Format JSON** with multiple indentation options (2/3/4 spaces, 1 tab, compact)
- 🔧 **Auto-fix common errors**:
  - Replace incorrect quotes (single to double)
  - Add missing quotes to keys
  - Correct numeric keys
  - Lowercase boolean literals (True → true, False → false)
  - Escape unescaped characters
  - Remove comments
  - Remove trailing commas
- ✅ **Validate against multiple specifications**:
  - RFC 8259 (default)
  - RFC 7159
  - RFC 4627
  - ECMA-404
  - Skip Validation option
- 📁 **Load JSON from files** or drag & drop
- 📋 **Copy to clipboard** with one click
- 💾 **Download formatted JSON**
- 📄 **Load example** to test features

## Project Structure

```
json-formatter/
├── server.js           # Node.js backend server
├── package.json        # Dependencies
├── public/
│   ├── index.html      # Frontend HTML
│   ├── styles.css      # Styling
│   └── script.js       # Frontend JavaScript
└── README.md          # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Project Structure

Create a `public` folder in your project root and place the frontend files there:

```bash
mkdir public
```

Move/create these files in the `public` folder:
- `index.html`
- `styles.css`
- `script.js`

### Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Paste or Load JSON**: 
   - Paste JSON directly into the input textarea
   - Click "Load File" to select a JSON file
   - Drag and drop a JSON file onto the textarea
   - Click "Load Example" to see a sample

2. **Configure Options**:
   - Select JSON Template (indentation style)
   - Choose JSON Specification for validation
   - Enable/disable "Fix JSON" for auto-correction

3. **Format**: Click the "Format JSON" button

4. **View Results**:
   - See formatted JSON in the output section
   - Check validation status
   - Review any fixes, errors, or warnings

5. **Export**:
   - Copy to clipboard
   - Download as JSON file

## API Endpoint

### POST `/api/format`

Format and validate JSON data.

**Request Body:**
```json
{
  "data": "{ ... }",
  "template": "3 Space Tab",
  "spec": "RFC 8259",
  "fixJson": true
}
```

**Response:**
```json
{
  "success": true,
  "formatted": "{ ... }",
  "fixes": ["Removed comments", "Added quotes to unquoted keys"],
  "errors": [],
  "warnings": [],
  "valid": true,
  "spec": "RFC 8259"
}
```

## JSON Specifications

- **RFC 8259**: Current JSON standard (2017)
- **RFC 7159**: Previous JSON standard (2014)
- **RFC 4627**: Original JSON specification (2006)
- **ECMA-404**: ECMA International JSON standard
- **Skip Validation**: No specification checking

## Common JSON Errors Fixed

The "Fix JSON" feature automatically corrects:

1. **Comments** - Removes `//` and `/* */` comments
2. **Trailing commas** - Removes commas before closing brackets
3. **Single quotes** - Converts `'` to `"`
4. **Unquoted keys** - Adds quotes to object keys
5. **Incorrect literals** - Lowercases `True`, `False`, `NULL`

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **No external dependencies** for frontend (pure vanilla JS)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!

## Future Enhancements

- [ ] JSON Schema validation
- [ ] JSON to XML/CSV conversion
- [ ] Syntax highlighting
- [ ] JSONPath query support
- [ ] Minify/Beautify toggle
- [ ] Dark mode
- [ ] History/Session storage