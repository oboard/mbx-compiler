// 遍历文件夹所有.mbx文件，并生成.mbt文件
import fs from 'node:fs';
import path from 'node:path';
import { parse } from './src_parser/parser';
import type { SyntaxNode } from 'tree-sitter';

function transform(content: string): string {
    const tree = parse(content);

    // 遍历 CST 并生成 MBT 代码
    const rootNode = tree.rootNode;

    const isXMLInside = (node: SyntaxNode): boolean => {
        if (node.type === 'xml_expression') {
            return true;
        }
        for (const child of node.children) {
            if (isXMLInside(child)) {
                return true;
            }
        }
        return false;
    };

    const transformExpression = (node: SyntaxNode): string => {
        switch (node.type) {
            case 'identifier':
            case 'qualified_identifier':
                return node.text;
            case 'pipeline_expression':
            case 'compound_expression':
            case 'simple_expression':
            case 'atomic_expression':
                return transformExpression(node.children[0]);
            case 'expression':
                return transformExpression(node.children[0]);
            default:
                return node.text;
        }
    };

    const transformNode = (node: SyntaxNode): string => {
        // console.log(node.type);
        switch (node.type) {
            case 'comment':
                return node.text + '\n';
            case 'xml_expression': {
                // 直接获取子节点
                const openingElement = node.children.find(child => child.type === 'xml_opening_element');
                const content = node.children.find(child => child.type === 'xml_content');
                const closingElement = node.children.find(child => child.type === 'xml_closing_element');

                if (!openingElement || !closingElement) return '';

                const name = openingElement.children.find(child => child.type === 'xml_identifier')?.text || '';
                let result = `@html.node("${name}", `;

                // 处理属性
                const attributes = openingElement.children.filter(child => child.type === 'xml_attribute');
                if (attributes.length > 0) {
                    const props = attributes.map(attr => {
                        const attrName = attr.children.find(child => child.type === 'xml_attribute_name')?.text || '';
                        const attrValue = attr.children.find(child => child.type === 'xml_attribute_value');
                        if (attrValue) {
                            const valueContent = attrValue.children.find(child => child.type === 'xml_attribute_content');
                            if (valueContent) {
                                const interpolations = valueContent.children.filter(child => child.type === 'xml_interpolation');
                                if (interpolations.length > 0) {
                                    const expr = interpolations[0].children.find(child => child.type === 'expression');
                                    if (expr) {
                                        return `@html.attribute("${attrName}", ${transformExpression(expr)})`;
                                    }
                                } else {
                                    return `@html.attribute("${attrName}", "${valueContent.text}")`;
                                }
                            }
                        }
                        return '';
                    }).filter(Boolean);
                    result += `[${props.join(', ')}], `;
                } else {
                    result += '[], ';
                }

                // 处理子元素
                if (content) {
                    const children = content.children.map(child => {
                        if (child.type === 'xml_text') {
                            const interpolations = child.children.filter(c => c.type === 'xml_interpolation');
                            if (interpolations.length > 0) {
                                // 如果有插值表达式，只处理插值表达式
                                const parts: string[] = [];
                                for (const interpolation of interpolations) {
                                    const expr = interpolation.children.find(c => c.type === 'expression');
                                    if (expr) {
                                        parts.push(`@html.text(${transformExpression(expr)})`);
                                    }
                                }
                                return parts.join(', ');
                            } else {
                                // 纯文本
                                const text = child.text.trim();
                                if (!text) return '';
                                return `@html.text("${text}")`;
                            }
                        }
                        return transformNode(child);
                    }).filter(Boolean);
                    if (children.length > 0) {
                        result += `[${children.join(', ')}]`;
                    } else {
                        result += '[]';
                    }
                }

                result += ')\n';
                return result;
            }
            default:
                let result = '';
                if (isXMLInside(node)) {
                    for (const child of node.children) {
                        result += transformNode(child) + ' ';
                    }
                } else {
                    result = node.text;
                }
                return result;
        }
    };

    return transformNode(rootNode);
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