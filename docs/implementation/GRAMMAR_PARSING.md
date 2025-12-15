# Grammar, Regex & Parsing Implementation

## Overview

This module demonstrates **formal language theory** concepts applied to input validation:

1. **Context-Free Grammar (CFG)** - Formal grammar definitions
2. **Regex Patterns** - Regular expression validation
3. **Parser Implementation** - Grammar-based parsing with AST generation
4. **Left Recursion Resolution** - Handling recursive grammar rules

---

## Implementation

### File: `src/utils/validation/inputGrammar.ts`

Contains:
- CFG grammar definitions (BNF notation)
- Regex validation patterns
- Parser classes for structured inputs
- Left recursion examples and solutions

### Integration: `src/components/ContactForm.tsx`

Real use case: Contact form validation using grammar-based validator

---

## 1. Context-Free Grammar (CFG)

### Address Grammar (BNF Notation)

```bnf
Address      ::= StreetAddr ", " City ", " State " " ZipCode
StreetAddr   ::= Number " " StreetName StreetSuffix?
Number       ::= Digit+
StreetName   ::= Word (" " Word)*
StreetSuffix ::= " " ("St" | "Ave" | "Rd" | "Blvd" | "Dr" | "Ln")
City         ::= Word (" " Word)*
State        ::= Letter Letter
ZipCode      ::= Digit{5} ("-" Digit{4})?
Word         ::= Letter+
Digit        ::= [0-9]
Letter       ::= [A-Za-z]
```

**Valid Examples:**
- `"123 Main St, Springfield, IL 62701"`
- `"456 Oak Avenue, Chicago, IL 60601-1234"`

**Implementation:**
```typescript
const parser = new AddressParser("123 Main St, Springfield, IL 62701");
const ast = parser.parse();
// Returns AST with structured data
```

### Phone Number Grammar

```bnf
PhoneNumber ::= AreaCode? LocalNumber
AreaCode    ::= "(" Digit³ ") " | Digit³ "-"
LocalNumber ::= Digit³ "-" Digit⁴
Digit       ::= [0-9]
```

**Valid Examples:**
- `(123) 456-7890`
- `123-456-7890`
- `1234567890`

**Usage:**
```typescript
const parsed = PhoneParser.parse("(123) 456-7890");
// { areaCode: "123", prefix: "456", lineNumber: "7890" }

const formatted = PhoneParser.format(parsed);
// "(123) 456-7890"
```

### Emergency Description Grammar

```bnf
Description ::= Priority? Text HashTags?
Priority    ::= "[" Word "]" " "
Text        ::= (Word | Punctuation | " ")+
HashTags    ::= " " HashTag+
HashTag     ::= "#" Word " "?
```

**Valid Examples:**
- `"[URGENT] Medical emergency at location #medical #trauma"`
- `"Fire in building, multiple people trapped"`

**Usage:**
```typescript
const ast = EmergencyDescriptionParser.parse(
  "[URGENT] Medical emergency at location #medical #trauma"
);
// {
//   type: 'EmergencyDescription',
//   priority: 'URGENT',
//   text: 'Medical emergency at location',
//   tags: ['medical', 'trauma']
// }
```

---

## 2. Left Recursion Resolution

### Problem: Left Recursion

**BAD (causes infinite loop in recursive descent parsers):**
```bnf
StreetName ::= StreetName " " Word | Word
Digits     ::= Digits Digit | Digit
```

The parser tries to evaluate `StreetName` which immediately tries to evaluate `StreetName` again → infinite recursion.

### Solution 1: Right Recursion

```bnf
StreetName ::= Word WordList
WordList   ::= " " Word WordList | ε
```

### Solution 2: Repetition (Our Approach)

```bnf
StreetName ::= Word (" " Word)*
Digits     ::= Digit+
```

Using `*` (zero or more) and `+` (one or more) operators eliminates recursion.

**Example in Code:**
```typescript
// Instead of left-recursive:
// parseStreetName() {
//   const name = this.parseStreetName(); // ← infinite loop!
//   this.consume(" ");
//   const word = this.parseWord();
//   return name + " " + word;
// }

// We use iteration:
parseStreetName() {
  const words = [];
  words.push(this.parseWord());
  
  while (this.peek() === " ") {
    this.consume(" ");
    words.push(this.parseWord());
  }
  
  return words.join(" ");
}
```

---

## 3. Regex Patterns

### Validation Patterns

```typescript
const ValidationPatterns = {
  // Phone: (123) 456-7890 or 123-456-7890
  phone: /^(\(\d{3}\)\s?|\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
  
  // Email: RFC 5322 compliant
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Zip: 12345 or 12345-6789
  zipCode: /^\d{5}(-\d{4})?$/,
  
  // State: Two letter code
  state: /^[A-Z]{2}$/,
  
  // Time: 24-hour format HH:MM:SS
  time: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
  
  // Date: YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
};
```

**Usage:**
```typescript
ValidationPatterns.phone.test("(123) 456-7890"); // true
ValidationPatterns.email.test("user@example.com"); // true
ValidationPatterns.zipCode.test("12345-6789"); // true
```

---

## 4. Parser with AST Generation

### AddressParser

**Input:** `"123 Main St, Springfield, IL 62701"`

**AST Output:**
```typescript
{
  type: 'Address',
  street: {
    type: 'StreetAddress',
    number: '123',
    name: 'Main',
    suffix: 'St'
  },
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701'
}
```

**Implementation:**
```typescript
class AddressParser {
  parse(): AddressAST | null {
    const parts = this.input.split(',').map(p => p.trim());
    
    if (parts.length !== 3) return null;
    
    const street = this.parseStreetAddress(parts[0]);
    const city = parts[1];
    const [state, zipCode] = parts[2].split(' ');
    
    // Validate each component
    if (!this.validateStreet(street)) return null;
    if (!this.validateCity(city)) return null;
    if (!this.validateState(state)) return null;
    if (!this.validateZip(zipCode)) return null;
    
    return { type: 'Address', street, city, state, zipCode };
  }
}
```

---

## 5. Real Integration - Contact Form

### Before (No Validation)

```typescript
const handleSubmit = async (e) => {
  // No validation - just submit
  await fetch('/api/contact', {
    body: JSON.stringify(formData)
  });
};
```

### After (Grammar-Based Validation)

```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate using CFG grammar and regex
  const validation = InputValidator.validateContactForm(formData);
  
  if (!validation.valid) {
    setValidationErrors(validation.errors);
    return;
  }
  
  // Format phone number using parser
  if (formData.phone) {
    const parsed = PhoneParser.parse(formData.phone);
    formData.phone = PhoneParser.format(parsed);
  }
  
  await fetch('/api/contact', {
    body: JSON.stringify(formData)
  });
};
```

### UI Feedback

```tsx
<input
  name="phone"
  value={formData.phone}
  className={validationErrors.phone ? 'border-red-500' : 'border-gray-300'}
/>
{validationErrors.phone && (
  <p className="text-red-600">{validationErrors.phone}</p>
)}
```

---

## Testing

### Test Address Parsing

```typescript
// Valid addresses
const parser1 = new AddressParser("123 Main St, Springfield, IL 62701");
console.log(parser1.parse()); // AST object

const parser2 = new AddressParser("456 Oak Avenue, Chicago, IL 60601-1234");
console.log(parser2.parse()); // AST object

// Invalid addresses
const parser3 = new AddressParser("Invalid Address");
console.log(parser3.parse()); // null
```

### Test Phone Parsing

```typescript
PhoneParser.validate("(123) 456-7890"); // true
PhoneParser.validate("123-456-7890");   // true
PhoneParser.validate("1234567890");     // true
PhoneParser.validate("invalid");        // false

const parsed = PhoneParser.parse("1234567890");
console.log(PhoneParser.format(parsed)); // "(123) 456-7890"
```

### Test Emergency Description

```typescript
const ast = EmergencyDescriptionParser.parse(
  "[URGENT] Fire in building #fire #emergency"
);
console.log(ast);
// {
//   priority: 'URGENT',
//   text: 'Fire in building',
//   tags: ['fire', 'emergency']
// }
```

---

## Grammar Concepts Demonstrated

✅ **CFG Definitions** - Formal grammar in BNF notation  
✅ **Terminal & Non-terminal Symbols** - Building blocks of grammar  
✅ **Production Rules** - Transformation rules (::=)  
✅ **Optional Elements** - Using `?` operator  
✅ **Repetition** - Using `*` (zero or more) and `+` (one or more)  
✅ **Alternation** - Using `|` for choices  
✅ **Left Recursion** - Problem explanation and resolution  
✅ **Parser Implementation** - Converting grammar to code  
✅ **AST Generation** - Creating structured data from input  
✅ **Regex Patterns** - Pattern matching for validation  

---

## Summary

**Grammar & Parsing Implementation:**
- CFG grammar definitions for 3 input types (address, phone, description)
- Parser classes with AST generation
- Left recursion examples and solutions
- Regex patterns for validation
- Real integration in contact form

**Key Files:**
- `src/utils/validation/inputGrammar.ts` - Core implementation
- `src/components/ContactForm.tsx` - Real use case
- `GRAMMAR_PARSING.md` - This documentation

The system provides **production-ready input validation** using formal language theory concepts.
