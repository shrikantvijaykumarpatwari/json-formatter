const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// JSON validation rules for different specifications
const specs = {
  'RFC 8259': {
    allowComments: false,
    allowTrailingCommas: false,
    allowSingleQuotes: false,
    allowUnquotedKeys: false,
    requireUnicode: true
  },
  'RFC 7159': {
    allowComments: false,
    allowTrailingCommas: false,
    allowSingleQuotes: false,
    allowUnquotedKeys: false,
    requireUnicode: true
  },
  'RFC 4627': {
    allowComments: false,
    allowTrailingCommas: false,
    allowSingleQuotes: false,
    allowUnquotedKeys: false,
    requireUnicode: false
  },
  'ECMA-404': {
    allowComments: false,
    allowTrailingCommas: false,
    allowSingleQuotes: false,
    allowUnquotedKeys: false,
    requireUnicode: true
  }
};

// Fix common JSON errors
function fixJSON(jsonString) {
  const fixes = [];
  let fixed = jsonString;

  // Remove comments
  const commentPattern = /\/\*[\s\S]*?\*\/|\/\/.*/g;
  if (commentPattern.test(fixed)) {
    fixed = fixed.replace(commentPattern, '');
    fixes.push('Removed comments');
  }

  // Remove trailing commas
  const trailingCommaPattern = /,(\s*[}\]])/g;
  if (trailingCommaPattern.test(fixed)) {
    fixed = fixed.replace(trailingCommaPattern, '$1');
    fixes.push('Removed trailing commas');
  }

  // Replace single quotes with double quotes (but not in strings)
  const singleQuotePattern = /(\w+|'[^']*')\s*:\s*'([^']*)'/g;
  if (singleQuotePattern.test(fixed)) {
    fixed = fixed.replace(/'/g, '"');
    fixes.push('Replaced single quotes with double quotes');
  }

  // Add quotes to unquoted keys
  const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
  if (unquotedKeyPattern.test(fixed)) {
    fixed = fixed.replace(unquotedKeyPattern, '$1"$2":');
    fixes.push('Added quotes to unquoted keys');
  }

  // Lowercase boolean and null literals
  fixed = fixed.replace(/\bTrue\b/g, 'true')
              .replace(/\bFalse\b/g, 'false')
              .replace(/\bNULL\b/g, 'null')
              .replace(/\bNull\b/g, 'null');
  
  if (/\b(True|False|NULL|Null)\b/.test(jsonString)) {
    fixes.push('Lowercased boolean/null literals');
  }

  return { fixed, fixes };
}

// Validate JSON against specification
function validateJSON(jsonString, spec) {
  const errors = [];
  const warnings = [];
  
  if (spec !== 'Skip Validation') {
    const rules = specs[spec];
    
    if (!rules.allowComments && /\/\*[\s\S]*?\*\/|\/\/.*/.test(jsonString)) {
      errors.push(`Comments are not allowed in ${spec}`);
    }
    
    if (!rules.allowTrailingCommas && /,(\s*[}\]])/.test(jsonString)) {
      errors.push(`Trailing commas are not allowed in ${spec}`);
    }
    
    if (!rules.allowSingleQuotes && /'[^']*'/.test(jsonString)) {
      warnings.push(`Single quotes should be double quotes in ${spec}`);
    }
  }

  return { errors, warnings };
}

// Format JSON with specified template
function formatJSON(obj, template) {
  let indent;
  
  switch (template) {
    case 'Compact':
      return JSON.stringify(obj);
    case '2 Space Tab':
      indent = 2;
      break;
    case '3 Space Tab':
      indent = 3;
      break;
    case '4 Space Tab':
      indent = 4;
      break;
    case '1 Tab':
      return JSON.stringify(obj, null, '\t');
    default:
      indent = 3;
  }
  
  return JSON.stringify(obj, null, indent);
}

app.post('/api/format', (req, res) => {
  try {
    const { data, template, spec, fixJson } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        success: false, 
        error: 'No JSON data provided' 
      });
    }

    let jsonString = data.trim();
    const fixes = [];
    let errors = [];
    let warnings = [];

    // Fix JSON if requested
    if (fixJson) {
      const fixResult = fixJSON(jsonString);
      jsonString = fixResult.fixed;
      fixes.push(...fixResult.fixes);
    }

    // Validate before parsing
    const validation = validateJSON(jsonString, spec);
    errors = validation.errors;
    warnings = validation.warnings;

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      return res.json({
        success: false,
        error: parseError.message,
        fixes,
        warnings
      });
    }

    // Format JSON
    const formatted = formatJSON(parsed, template);

    res.json({
      success: true,
      formatted,
      fixes,
      errors,
      warnings,
      valid: errors.length === 0,
      spec: spec !== 'Skip Validation' ? spec : null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`JSON Formatter server running on http://localhost:${PORT}`);
});