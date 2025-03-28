import {
  Node,
  NodeType,
  Program,
  XElement as XElement,
  XOpeningElement,
  XClosingElement,
  XIdentifier,
  XAttribute,
  XText,
  XExpressionContainer,
  Literal,
  FunctionDeclaration,
  ComponentReturn,
  LetStatement,
  Comment
} from './types';

export class MBXParser {
  private pos: number = 0;
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  parse(): Program {
    console.log('开始解析输入:', this.input);
    const body: Node[] = [];

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const node = this.parseNode();
      if (node) {
        body.push(node);
      }
    }

    return {
      type: 'Program',
      body,
      start: 0,
      end: this.input.length
    };
  }

  private parseNode(): Node | null {
    if (this.pos >= this.input.length) return null;

    // 解析注释
    if (this.input.startsWith('//', this.pos)) {
      return this.parseComment();
    }

    // 解析函数声明
    if (this.input.startsWith('fn', this.pos)) {
      return this.parseFunctionDeclaration();
    }

    // 解析 let 语句
    if (this.input.startsWith('let', this.pos)) {
      return this.parseLetStatement();
    }

    // 解析 JSX 元素
    if (this.input[this.pos] === '<') {
      return this.parseXElement();
    }

    return null;
  }

  private parseComment(): Comment {
    const start = this.pos;
    let value = '';

    // 跳过第一个 /
    this.expect('/');

    // 如果是 ///| 格式
    if (this.input[this.pos] === '/' && this.input[this.pos + 1] === '|') {
      this.expect('/');
      this.expect('|');
      value = '///|';
    } else {
      // 如果是普通注释 //
      if (this.input[this.pos] === '/') {
        this.expect('/');
        value = '//';
      }

      // 收集注释内容直到行尾
      while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
        value += this.input[this.pos++];
      }
    }

    return {
      type: 'Comment',
      value: value.trim(),
      start,
      end: this.pos
    };
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
    const start = this.pos;

    // 检查是否是 fn 关键字
    if (!this.input.startsWith('fn', this.pos)) {
      throw new Error(`Expected 'fn', got '${this.input[this.pos]}'`);
    }
    this.pos += 2; // 跳过 'fn'
    this.skipWhitespace();

    const name = this.parseIdentifier();
    this.skipWhitespace();

    this.expect('(');
    this.skipWhitespace();
    // TODO: 解析参数
    this.expect(')');
    this.skipWhitespace();

    this.expect('-');
    this.expect('>');
    this.skipWhitespace();

    const returnType = this.parseComponentReturn();
    this.skipWhitespace();

    this.expect('{');
    this.skipWhitespace();

    const body: Node[] = [];
    while (this.pos < this.input.length && this.input[this.pos] !== '}') {
      this.skipWhitespace();
      const node = this.parseNode();
      if (node) {
        body.push(node);
      }
    }

    this.expect('}');

    return {
      type: 'FunctionDeclaration',
      name,
      returnType,
      body,
      start,
      end: this.pos
    };
  }

  private parseLetStatement(): LetStatement {
    const start = this.pos;

    // 检查是否是 let 关键字
    if (!this.input.startsWith('let', this.pos)) {
      throw new Error(`Expected 'let', got '${this.input[this.pos]}'`);
    }
    this.pos += 3; // 跳过 'let'
    this.skipWhitespace();

    const name = this.parseIdentifier();
    this.skipWhitespace();

    this.expect('=');
    this.skipWhitespace();

    const value = this.parseLiteral();
    this.skipWhitespace();

    return {
      type: 'LetStatement',
      name,
      value,
      start,
      end: this.pos
    };
  }

  private parseComponentReturn(): ComponentReturn {
    const start = this.pos;

    // 检查是否是 Component 关键字
    if (!this.input.startsWith('Component', this.pos)) {
      throw new Error(`Expected 'Component', got '${this.input[this.pos]}'`);
    }
    this.pos += 9; // 跳过 'Component'

    return {
      type: 'ComponentReturn',
      start,
      end: this.pos
    };
  }

  private parseIdentifier(): XIdentifier {
    const start = this.pos;
    let name = '';

    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      name += this.input[this.pos++];
    }

    return {
      type: 'XIdentifier',
      name,
      start,
      end: this.pos
    };
  }

  private parseXElement(): XElement {
    const start = this.pos;
    console.log(`开始解析 JSX 元素，位置: ${this.pos}`);
    const openingElement = this.parseXOpeningElement();
    console.log(`解析到开标签: ${openingElement.name.name}, 是否自闭合: ${openingElement.selfClosing}`);
    const children: Node[] = [];

    if (!openingElement.selfClosing) {
      while (this.pos < this.input.length) {
        this.skipWhitespace();
        console.log(`当前位置: ${this.pos}, 字符: ${this.input[this.pos]}`);

        if (this.input[this.pos] === '<') {
          if (this.input[this.pos + 1] === '/') {
            // 检查是否是当前元素的结束标签
            const savedPos = this.pos;
            console.log(`遇到结束标签，检查是否是 ${openingElement.name.name} 的结束标签`);
            this.expect('<');
            this.expect('/');
            const name = this.parseIdentifier();
            this.expect('>');

            console.log(`解析到结束标签: ${name.name}`);
            if (name.name === openingElement.name.name) {
              console.log(`找到匹配的结束标签，返回 JSX 元素`);
              return {
                type: 'XElement',
                openingElement,
                closingElement: {
                  type: 'XClosingElement',
                  name,
                  start: savedPos,
                  end: this.pos
                },
                children,
                start,
                end: this.pos
              };
            }
            console.log(`不是匹配的结束标签，恢复位置继续解析`);
            this.pos = savedPos;
          }
        }

        console.log(`尝试解析子元素`);
        const child = this.parseJSXChild();
        if (child) {
          console.log(`解析到子元素: ${child.type}`);
          children.push(child);
        }
      }
    }

    console.log(`解析完成，返回 JSX 元素`);
    return {
      type: 'XElement',
      openingElement,
      closingElement: openingElement.selfClosing ? openingElement : this.parseXClosingElement(),
      children,
      start,
      end: this.pos
    };
  }

  private parseXOpeningElement(): XOpeningElement {
    const start = this.pos;
    this.expect('<');

    const name = this.parseIdentifier();
    const attributes: XAttribute[] = [];
    let selfClosing = false;

    while (this.pos < this.input.length && this.input[this.pos] !== '>' && this.input[this.pos] !== '/') {
      this.skipWhitespace();
      const attr = this.parseXAttribute();
      if (attr) {
        attributes.push(attr);
      }
    }

    if (this.input[this.pos] === '/') {
      this.expect('/');
      this.expect('>');
      selfClosing = true;
    } else {
      this.expect('>');
    }

    return {
      type: 'XOpeningElement',
      name,
      attributes,
      selfClosing,
      start,
      end: this.pos
    };
  }

  private parseXClosingElement(): XClosingElement {
    const start = this.pos;
    this.expect('<');
    this.expect('/');

    const name = this.parseIdentifier();
    this.expect('>');

    return {
      type: 'XClosingElement',
      name,
      start,
      end: this.pos
    };
  }

  private parseXAttribute(): XAttribute {
    const start = this.pos;
    const name = this.parseIdentifier();
    let value: XExpressionContainer | Literal | undefined;

    if (this.input[this.pos] === '=') {
      this.expect('=');
      this.skipWhitespace();

      if (this.input[this.pos] === '{') {
        value = this.parseXExpressionContainer();
      } else if (this.input[this.pos] === '"' || this.input[this.pos] === "'") {
        value = this.parseLiteral();
      }
    }

    return {
      type: 'XAttribute',
      name,
      value,
      start,
      end: this.pos
    };
  }

  private parseJSXChild(): Node | null {
    this.skipWhitespace();
    console.log(`开始解析 JSX 子元素，位置: ${this.pos}`);

    if (this.pos >= this.input.length) {
      console.log(`到达输入末尾`);
      return null;
    }

    if (this.input[this.pos] === '{') {
      console.log(`遇到表达式容器`);
      return this.parseXExpressionContainer();
    }

    if (this.input[this.pos] === '<') {
      console.log(`遇到 JSX 元素`);
      return this.parseXElement();
    }

    console.log(`解析文本节点`);
    const text = this.parseXText();
    if (text.value) {
      console.log(`解析到文本节点: ${text.value}`);
      return text;
    }
    return null;
  }

  private parseXText(): XText {
    const start = this.pos;
    let value = '';

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];
      if (char === '<' || char === '{' || char === '}') {
        break;
      }
      value += char;
      this.pos++;
    }

    return {
      type: 'XText',
      value: value.trim(),
      start,
      end: this.pos
    };
  }

  private parseXExpressionContainer(): XExpressionContainer {
    const start = this.pos;
    console.log(`开始解析表达式容器，位置: ${this.pos}`);
    this.expect('{');
    this.skipWhitespace();

    const savedPos = this.pos;

    if (this.input[this.pos] === '<') {
      console.log(`表达式容器中包含 JSX 元素`);
      try {
        const expression = this.parseXElement();
        if (this.input[this.pos] === '}') {
          this.expect('}');
          console.log(`成功解析表达式容器中的 JSX 元素`);
          return {
            type: 'XExpressionContainer',
            expression,
            start,
            end: this.pos
          };
        }
      } catch (error) {
        console.log(`解析表达式容器中的 JSX 元素失败: ${error}`);
        this.pos = savedPos;
      }
    }

    this.pos = savedPos;
    // 解析变量名
    let name = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      name += this.input[this.pos++];
    }
    this.skipWhitespace();
    this.expect('}');
    console.log(`解析表达式容器完成，变量名: ${name}`);
    return {
      type: 'XExpressionContainer',
      expression: {
        type: 'XIdentifier',
        name,
        start: savedPos,
        end: this.pos - 1
      } as XIdentifier,
      start,
      end: this.pos
    };
  }

  private parseLiteral(): Literal {
    const start = this.pos;
    const quote = this.input[this.pos];
    this.expect(quote);

    let value = '';
    while (this.pos < this.input.length && this.input[this.pos] !== quote) {
      value += this.input[this.pos++];
    }

    this.expect(quote);

    return {
      type: 'Literal',
      value,
      start,
      end: this.pos
    };
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private expect(char: string): void {
    if (this.pos >= this.input.length) {
      throw new Error(`Unexpected end of input, expected '${char}'`);
    }
    if (this.input[this.pos] !== char) {
      throw new Error(`Expected '${char}', got '${this.input[this.pos]}'`);
    }
    this.pos++;
  }
} 