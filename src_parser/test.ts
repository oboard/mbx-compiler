import { parse } from './parser';

const testCases = [
  {
    name: '简单的 JSX 元素',
    input: '<div>Hello World</div>',
  },
  {
    name: '带属性的 JSX 元素',
    input: '<div className="container">Hello World</div>',
  },
  {
    name: '自闭合标签',
    input: '<img src="image.jpg" />',
  },
  {
    name: '嵌套的 JSX 元素',
    input: '<div><span>Hello</span><span>World</span></div>',
  },
  {
    name: '带表达式的 JSX',
    input: '<div>{name}</div>',
  },
  {
    name: '带表达式的 JSX',
    input: `<div>
        <p>{ message }</p>
        <h1>{ message }</h1>
        <span>{ message }</span>
    </div>`,
  }
];

testCases.forEach(testCase => {
  console.log(`\n测试: ${testCase.name}`);
  try {
    const ast = parse(testCase.input);
    console.log('解析成功:', JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error('解析失败:', error);
  }
}); 