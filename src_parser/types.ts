export type NodeType = 
  | 'Program'
  | 'FunctionDeclaration'
  | 'ComponentReturn'
  | 'LetStatement'
  | 'XElement'
  | 'XOpeningElement'
  | 'XClosingElement'
  | 'XIdentifier'
  | 'XAttribute'
  | 'XText'
  | 'XExpressionContainer'
  | 'Literal'
  | 'Comment';

export interface Node {
  type: NodeType;
  start: number;
  end: number;
}

export interface Program extends Node {
  type: 'Program';
  body: Node[];
}

export interface FunctionDeclaration extends Node {
  type: 'FunctionDeclaration';
  name: XIdentifier;
  returnType: ComponentReturn;
  body: Node[];
}

export interface ComponentReturn extends Node {
  type: 'ComponentReturn';
}

export interface LetStatement extends Node {
  type: 'LetStatement';
  name: XIdentifier;
  value: Literal;
}

export interface XElement extends Node {
  type: 'XElement';
  openingElement: XOpeningElement;
  closingElement: XOpeningElement | XClosingElement;
  children: Node[];
}

export interface XOpeningElement extends Node {
  type: 'XOpeningElement';
  name: XIdentifier;
  attributes: XAttribute[];
  selfClosing: boolean;
}

export interface XClosingElement extends Node {
  type: 'XClosingElement';
  name: XIdentifier;
}

export interface XIdentifier extends Node {
  type: 'XIdentifier';
  name: string;
}

export interface XAttribute extends Node {
  type: 'XAttribute';
  name: XIdentifier;
  value?: XExpressionContainer | Literal;
}

export interface XText extends Node {
  type: 'XText';
  value: string;
}

export interface XExpressionContainer extends Node {
  type: 'XExpressionContainer';
  expression: Node;
}

export interface Literal extends Node {
  type: 'Literal';
  value: string | number | boolean | null;
}

export interface Comment extends Node {
  type: 'Comment';
  value: string;
} 