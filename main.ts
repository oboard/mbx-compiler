// 遍历文件夹所有.mbx文件，并生成.mbt文件
import fs from 'node:fs';
import path from 'node:path';
import { MBXParser } from './src_parser/parser';
import { Node, FunctionDeclaration, LetStatement, XElement, XText, XExpressionContainer, Comment, XIdentifier, Literal } from './src_parser/types';

function transform(content: string): string {
    const parser = new MBXParser(content);
    const ast = parser.parse();

    console.log(JSON.stringify(ast, null, 2));

    let result = '';

    // 遍历 AST 并生成 MBT 代码
    for (const node of ast.body) {
        result += transformNode(node);
    }

    return result;
}

function transformNode(node: Node): string {
    switch (node.type) {
        case 'Comment': {
            const commentNode = node as Comment;
            return `  ${commentNode.value}\n`;
        }
        case 'FunctionDeclaration': {
            const funcNode = node as FunctionDeclaration;
            let result = `fn ${funcNode.name.name}() -> Component {\n`;

            // 处理函数体
            for (const bodyNode of funcNode.body) {
                result += transformNode(bodyNode);
            }

            result += '}\n';
            return result;
        }
        case 'LetStatement': {
            const letNode = node as LetStatement;
            return `  let ${letNode.name.name} = "${letNode.value.value}"\n`;
        }
        case 'XElement': {
            const elementNode = node as XElement;
            let result = '  render(tag="' + elementNode.openingElement.name.name + '", ';

            // 处理属性
            const props: string[] = [];
            if (elementNode.openingElement.attributes.length > 0) {
                const attributes = elementNode.openingElement.attributes.map(attr => {
                    if (attr.value) {
                        if (attr.value.type === 'Literal') {
                            return `"${attr.name.name}": "${(attr.value as Literal).value}"`;
                        } else if (attr.value.type === 'XExpressionContainer') {
                            const expr = attr.value as XExpressionContainer;
                            if (expr.expression.type === 'XIdentifier') {
                                return `"${attr.name.name}": ${(expr.expression as XIdentifier).name}`;
                            }
                        }
                    }
                    return '';
                }).filter(Boolean);
                props.push(`props={${attributes.join(', ')}}`);
            }

            // 处理子元素
            if (elementNode.children.length > 0) {
                const children = elementNode.children.map(child => transformNode(child)).filter(Boolean);
                props.push(`children=[${children.join(', ')}]`);
            }

            result += props.join(', ') + ')\n';
            return result;
        }
        case 'XText': {
            const textNode = node as XText;
            return `render(text="${textNode.value}")`;
        }
        case 'XExpressionContainer': {
            const exprNode = node as XExpressionContainer;
            if (exprNode.expression.type === 'XIdentifier') {
                const identifier = exprNode.expression as XIdentifier;
                return `render(text=${identifier.name})`;
            }
            return transformNode(exprNode.expression);
        }
        default:
            return '';
    }
}

function gen(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            gen(filePath);
        } else if (file.endsWith('.mbx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            // app.mbx -> app.mbt
            const mbtPath = filePath.replace('.mbx', '.mbt');
            fs.writeFileSync(mbtPath, transform(content));
        }
    }
}

gen('./src');