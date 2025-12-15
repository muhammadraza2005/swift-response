/**
 * Parser - Converts string expressions into AST structures
 */

import {
  ASTNode,
  LiteralNode,
  VariableNode,
  BinaryOpNode,
  UnaryOpNode,
  FunctionCallNode,
  ConditionalNode,
  MemberAccessNode,
} from './ast';

enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  BOOLEAN = 'BOOLEAN',
  OPERATOR = 'OPERATOR',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  COMMA = 'COMMA',
  DOT = 'DOT',
  COLON = 'COLON',
  QUESTION = 'QUESTION',
  EOF = 'EOF',
}

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

class Lexer {
  private position = 0;
  private current: string | null = null;

  constructor(private readonly input: string) {
    this.current = this.input[0] || null;
  }

  private advance(): void {
    this.position++;
    this.current = this.position < this.input.length ? this.input[this.position] : null;
  }

  private peek(offset: number = 1): string | null {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : null;
  }

  private skipWhitespace(): void {
    while (this.current && /\s/.test(this.current)) {
      this.advance();
    }
  }

  private readNumber(): Token {
    const start = this.position;
    let value = '';
    
    while (this.current && /[0-9.]/.test(this.current)) {
      value += this.current;
      this.advance();
    }
    
    return { type: TokenType.NUMBER, value, position: start };
  }

  private readString(quote: string): Token {
    const start = this.position;
    let value = '';
    this.advance();
    
    while (this.current && this.current !== quote) {
      if (this.current === '\\') {
        this.advance();
        if (this.current) {
          value += this.current;
          this.advance();
        }
      } else {
        value += this.current;
        this.advance();
      }
    }
    
    this.advance();
    return { type: TokenType.STRING, value, position: start };
  }

  private readIdentifier(): Token {
    const start = this.position;
    let value = '';
    
    while (this.current && /[a-zA-Z0-9_]/.test(this.current)) {
      value += this.current;
      this.advance();
    }
    
    if (value === 'true' || value === 'false') {
      return { type: TokenType.BOOLEAN, value, position: start };
    }
    
    return { type: TokenType.IDENTIFIER, value, position: start };
  }

  private readOperator(): Token {
    const start = this.position;
    let value = this.current!;
    
    const next = this.peek();
    if (next && ['==', '!=', '<=', '>=', '&&', '||'].includes(value + next)) {
      value += next;
      this.advance();
    }
    
    this.advance();
    return { type: TokenType.OPERATOR, value, position: start };
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.current !== null) {
      this.skipWhitespace();
      
      if (!this.current) break;
      
      if (/[0-9]/.test(this.current)) {
        tokens.push(this.readNumber());
      } else if (this.current === '"' || this.current === "'") {
        tokens.push(this.readString(this.current));
      } else if (/[a-zA-Z_]/.test(this.current)) {
        tokens.push(this.readIdentifier());
      } else if ('+-*/%<>=!&|'.includes(this.current)) {
        tokens.push(this.readOperator());
      } else if (this.current === '(') {
        tokens.push({ type: TokenType.LPAREN, value: '(', position: this.position });
        this.advance();
      } else if (this.current === ')') {
        tokens.push({ type: TokenType.RPAREN, value: ')', position: this.position });
        this.advance();
      } else if (this.current === ',') {
        tokens.push({ type: TokenType.COMMA, value: ',', position: this.position });
        this.advance();
      } else if (this.current === '.') {
        tokens.push({ type: TokenType.DOT, value: '.', position: this.position });
        this.advance();
      } else if (this.current === ':') {
        tokens.push({ type: TokenType.COLON, value: ':', position: this.position });
        this.advance();
      } else if (this.current === '?') {
        tokens.push({ type: TokenType.QUESTION, value: '?', position: this.position });
        this.advance();
      } else {
        throw new Error(`Unexpected character at position ${this.position}: ${this.current}`);
      }
    }
    
    tokens.push({ type: TokenType.EOF, value: '', position: this.position });
    return tokens;
  }
}

export class Parser {
  private position = 0;
  private tokens: Token[] = [];

  parse(input: string): ASTNode {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
    this.position = 0;
    return this.parseExpression();
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private consume(expected?: TokenType): Token {
    const token = this.current();
    if (expected && token.type !== expected) {
      throw new Error(`Expected ${expected} but got ${token.type} at position ${token.position}`);
    }
    this.position++;
    return token;
  }

  private parseExpression(): ASTNode {
    return this.parseTernary();
  }

  private parseTernary(): ASTNode {
    let node = this.parseLogicalOr();
    
    if (this.current().type === TokenType.QUESTION) {
      this.consume(TokenType.QUESTION);
      const trueExpr = this.parseExpression();
      this.consume(TokenType.COLON);
      const falseExpr = this.parseExpression();
      node = new ConditionalNode(node, trueExpr, falseExpr);
    }
    
    return node;
  }

  private parseLogicalOr(): ASTNode {
    let node = this.parseLogicalAnd();
    
    while (this.current().value === '||') {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseLogicalAnd();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseLogicalAnd(): ASTNode {
    let node = this.parseEquality();
    
    while (this.current().value === '&&') {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseEquality();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseEquality(): ASTNode {
    let node = this.parseComparison();
    
    while (['==', '!='].includes(this.current().value)) {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseComparison();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseComparison(): ASTNode {
    let node = this.parseAdditive();
    
    while (['<', '>', '<=', '>='].includes(this.current().value)) {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseAdditive();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseAdditive(): ASTNode {
    let node = this.parseMultiplicative();
    
    while (['+', '-'].includes(this.current().value)) {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseMultiplicative();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseMultiplicative(): ASTNode {
    let node = this.parseUnary();
    
    while (['*', '/', '%'].includes(this.current().value)) {
      const op = this.consume(TokenType.OPERATOR);
      const right = this.parseUnary();
      node = new BinaryOpNode(op.value, node, right);
    }
    
    return node;
  }

  private parseUnary(): ASTNode {
    if (['-', '!'].includes(this.current().value)) {
      const op = this.consume(TokenType.OPERATOR);
      const operand = this.parseUnary();
      return new UnaryOpNode(op.value, operand);
    }
    
    return this.parsePostfix();
  }

  private parsePostfix(): ASTNode {
    let node = this.parsePrimary();
    
    while (true) {
      if (this.current().type === TokenType.DOT) {
        this.consume(TokenType.DOT);
        const property = this.consume(TokenType.IDENTIFIER).value;
        node = new MemberAccessNode(node, property, false);
      } else if (this.current().type === TokenType.LPAREN && node instanceof VariableNode) {
        this.consume(TokenType.LPAREN);
        const args: ASTNode[] = [];
        
        while (this.current().type !== TokenType.RPAREN) {
          args.push(this.parseExpression());
          if (this.current().type === TokenType.COMMA) {
            this.consume(TokenType.COMMA);
          }
        }
        
        this.consume(TokenType.RPAREN);
        node = new FunctionCallNode(node.name, args);
      } else {
        break;
      }
    }
    
    return node;
  }

  private parsePrimary(): ASTNode {
    const token = this.current();
    
    if (token.type === TokenType.NUMBER) {
      this.consume(TokenType.NUMBER);
      return new LiteralNode(parseFloat(token.value));
    }
    
    if (token.type === TokenType.STRING) {
      this.consume(TokenType.STRING);
      return new LiteralNode(token.value);
    }
    
    if (token.type === TokenType.BOOLEAN) {
      this.consume(TokenType.BOOLEAN);
      return new LiteralNode(token.value === 'true');
    }
    
    if (token.type === TokenType.IDENTIFIER) {
      this.consume(TokenType.IDENTIFIER);
      return new VariableNode(token.value);
    }
    
    if (token.type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      const node = this.parseExpression();
      this.consume(TokenType.RPAREN);
      return node;
    }
    
    throw new Error(`Unexpected token ${token.type} at position ${token.position}`);
  }
}
