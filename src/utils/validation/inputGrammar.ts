/**
 * Input Grammar & Validation Module
 * 
 * Demonstrates:
 * - Context-Free Grammar (CFG) for input formats
 * - Regex-based validation
 * - Parser with left recursion handling
 * - AST generation for structured inputs
 */

/**
 * CFG Grammar Definition for Address Input
 * 
 * Grammar (BNF notation):
 * ----------------------------------------
 * Address      ::= StreetAddr ", " City ", " State " " ZipCode
 * StreetAddr   ::= Number " " StreetName StreetSuffix?
 * Number       ::= Digit+
 * StreetName   ::= Word (" " Word)*
 * StreetSuffix ::= " " ("St" | "Ave" | "Rd" | "Blvd" | "Dr" | "Ln")
 * City         ::= Word (" " Word)*
 * State        ::= Letter Letter
 * ZipCode      ::= Digit Digit Digit Digit Digit ("-" Digit Digit Digit Digit)?
 * Word         ::= Letter+
 * Digit        ::= [0-9]
 * Letter       ::= [A-Za-z]
 * 
 * Example valid input:
 * "123 Main St, Springfield, IL 62701"
 * "456 Oak Avenue, Chicago, IL 60601-1234"
 * 
 * LEFT RECURSION NOTE:
 * ----------------------------------------
 * Original (left-recursive):
 *   StreetName ::= StreetName " " Word | Word
 * 
 * Resolved (right-recursive):
 *   StreetName ::= Word WordList
 *   WordList   ::= " " Word WordList | ε
 * 
 * Or using repetition (our approach):
 *   StreetName ::= Word (" " Word)*
 */

// Regex patterns for validation
export const ValidationPatterns = {
  // Phone number: (123) 456-7890 or 123-456-7890 or 1234567890
  phone: /^(\(\d{3}\)\s?|\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
  
  // Email: basic RFC 5322 compliant
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Zip code: 12345 or 12345-6789
  zipCode: /^\d{5}(-\d{4})?$/,
  
  // State: two letter code
  state: /^[A-Z]{2}$/,
  
  // Street number
  streetNumber: /^\d+[A-Z]?$/i,
  
  // Time: HH:MM or HH:MM:SS (24-hour)
  time: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
  
  // Date: YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
} as const;

/**
 * AST Nodes for parsed address
 */
export interface AddressAST {
  type: 'Address';
  street: StreetAddressAST;
  city: string;
  state: string;
  zipCode: string;
}

export interface StreetAddressAST {
  type: 'StreetAddress';
  number: string;
  name: string;
  suffix?: string;
}

/**
 * Grammar-based Address Parser
 * Implements the CFG grammar defined above
 */
export class AddressParser {
  private input: string;
  private position: number;

  constructor(input: string) {
    this.input = input.trim();
    this.position = 0;
  }

  /**
   * Parse address according to CFG grammar
   * Address ::= StreetAddr ", " City ", " State " " ZipCode
   */
  parse(): AddressAST | null {
    try {
      const parts = this.input.split(',').map(p => p.trim());
      
      if (parts.length !== 3) {
        return null;
      }

      const street = this.parseStreetAddress(parts[0]);
      if (!street) return null;

      const city = parts[1];
      if (!this.isValidCity(city)) return null;

      const stateZip = parts[2].split(' ').filter(s => s);
      if (stateZip.length !== 2) return null;

      const state = stateZip[0];
      const zipCode = stateZip[1];

      if (!ValidationPatterns.state.test(state)) return null;
      if (!ValidationPatterns.zipCode.test(zipCode)) return null;

      return {
        type: 'Address',
        street,
        city,
        state,
        zipCode,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse street address
   * StreetAddr ::= Number " " StreetName StreetSuffix?
   */
  private parseStreetAddress(input: string): StreetAddressAST | null {
    const parts = input.split(' ');
    if (parts.length < 2) return null;

    const number = parts[0];
    if (!ValidationPatterns.streetNumber.test(number)) return null;

    const suffixes = ['St', 'Ave', 'Rd', 'Blvd', 'Dr', 'Ln', 'Street', 'Avenue', 'Road', 'Boulevard', 'Drive', 'Lane'];
    const lastPart = parts[parts.length - 1];
    const hasSuffix = suffixes.some(s => s.toLowerCase() === lastPart.toLowerCase());

    const name = hasSuffix 
      ? parts.slice(1, -1).join(' ')
      : parts.slice(1).join(' ');
    
    const suffix = hasSuffix ? lastPart : undefined;

    if (!name) return null;

    return {
      type: 'StreetAddress',
      number,
      name,
      suffix,
    };
  }

  /**
   * Validate city name
   * City ::= Word (" " Word)*
   */
  private isValidCity(city: string): boolean {
    return city.length > 0 && /^[A-Za-z\s]+$/.test(city);
  }
}

/**
 * Phone Number Parser with Grammar
 * 
 * CFG Grammar:
 * ----------------------------------------
 * PhoneNumber ::= AreaCode? LocalNumber
 * AreaCode    ::= "(" Digit³ ") " | Digit³ "-"
 * LocalNumber ::= Digit³ "-" Digit⁴
 * Digit       ::= [0-9]
 * 
 * LEFT RECURSION EXAMPLE (avoided):
 * ----------------------------------------
 * BAD (left-recursive):
 *   Digits ::= Digits Digit | Digit
 * 
 * GOOD (right-recursive or repetition):
 *   Digits ::= Digit+
 */
export class PhoneParser {
  /**
   * Parse phone number and normalize to standard format
   */
  static parse(input: string): { areaCode: string; prefix: string; lineNumber: string } | null {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');

    if (digits.length === 10) {
      return {
        areaCode: digits.slice(0, 3),
        prefix: digits.slice(3, 6),
        lineNumber: digits.slice(6, 10),
      };
    } else if (digits.length === 7) {
      return {
        areaCode: '',
        prefix: digits.slice(0, 3),
        lineNumber: digits.slice(3, 7),
      };
    }

    return null;
  }

  /**
   * Format to standard display: (123) 456-7890
   */
  static format(phone: { areaCode: string; prefix: string; lineNumber: string }): string {
    if (phone.areaCode) {
      return `(${phone.areaCode}) ${phone.prefix}-${phone.lineNumber}`;
    }
    return `${phone.prefix}-${phone.lineNumber}`;
  }

  /**
   * Validate using regex
   */
  static validate(input: string): boolean {
    return ValidationPatterns.phone.test(input);
  }
}

/**
 * Emergency Description Parser
 * 
 * Parses structured emergency descriptions with tags
 * Example: "[URGENT] Medical emergency at location, patient unconscious #medical #trauma"
 * 
 * CFG Grammar:
 * ----------------------------------------
 * Description ::= Priority? Text HashTags?
 * Priority    ::= "[" Word "]" " "
 * Text        ::= (Word | Punctuation | " ")+
 * HashTags    ::= " " HashTag+
 * HashTag     ::= "#" Word " "?
 * 
 * Demonstrates:
 * - Optional elements (Priority?, HashTags?)
 * - Repetition (HashTag+, (Word)+)
 * - Terminal symbols (punctuation, spaces)
 */
export interface EmergencyDescriptionAST {
  type: 'EmergencyDescription';
  priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  text: string;
  tags: string[];
}

export class EmergencyDescriptionParser {
  /**
   * Parse emergency description into structured AST
   */
  static parse(input: string): EmergencyDescriptionAST {
    const result: EmergencyDescriptionAST = {
      type: 'EmergencyDescription',
      text: input,
      tags: [],
    };

    // Extract priority (non-greedy)
    const priorityMatch = input.match(/^\[(\w+)\]\s+/);
    if (priorityMatch) {
      const priority = priorityMatch[1].toUpperCase();
      if (['URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
        result.priority = priority as EmergencyDescriptionAST['priority'];
        input = input.slice(priorityMatch[0].length);
      }
    }

    // Extract hashtags
    const tagMatches = input.match(/#\w+/g);
    if (tagMatches) {
      result.tags = tagMatches.map(tag => tag.slice(1).toLowerCase());
      input = input.replace(/#\w+/g, '').trim();
    }

    result.text = input.trim();

    return result;
  }

  /**
   * Validate description has required components
   */
  static validate(ast: EmergencyDescriptionAST): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!ast.text || ast.text.length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    if (ast.text.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Input Validator using regex and grammar
 */
export class InputValidator {
  /**
   * Validate contact form inputs
   */
  static validateContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Name validation (simple grammar: Word+)
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[A-Za-z\s'-]+$/.test(data.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation (regex)
    if (!ValidationPatterns.email.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone validation (optional)
    if (data.phone && !PhoneParser.validate(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    // Message validation
    if (!data.message || data.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate emergency request input
   */
  static validateEmergencyRequest(data: {
    description: string;
    address: string;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Parse and validate description
    const descriptionAST = EmergencyDescriptionParser.parse(data.description);
    const descValidation = EmergencyDescriptionParser.validate(descriptionAST);
    if (!descValidation.valid) {
      errors.description = descValidation.errors.join(', ');
    }

    // Parse and validate address
    const addressParser = new AddressParser(data.address);
    const addressAST = addressParser.parse();
    if (!addressAST) {
      errors.address = 'Invalid address format. Expected: "123 Main St, City, ST 12345"';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
