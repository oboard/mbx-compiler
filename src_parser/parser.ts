// import { Parser, Language } from "web-tree-sitter";
// import { readFileSync } from "fs";

// Parser.init().then(async () => {
//     const bytes = readFileSync('./tree-sitter-moonbitxml.wasm');
//     const MoonBitXML = await Language.load(bytes);
//     const parser = new Parser();
//     parser.setLanguage(MoonBitXML);

//     const cst = parser.parse(
//         `fn app() -> Component {
//   let a = 1
//   <div>Hello World {a}</div>
// }`)
//     console.log(cst)
// });

import Parser from 'tree-sitter';
import MoonBitXML from 'tree-sitter-moonbit-xml';
import type { Language } from 'tree-sitter';

const parser = new Parser();
parser.setLanguage(MoonBitXML as unknown as Language);

// const sourceCode = `fn app() -> Component {
//   let a = 1
//   <div>Hello World {a}</div>
// }`;
// const tree = parser.parse(sourceCode);

// // const rootNode = tree.rootNode; // Node

// console.log(tree)

export const parse = (sourceCode: string) => {
    const tree = parser.parse(sourceCode);
    return tree;
}