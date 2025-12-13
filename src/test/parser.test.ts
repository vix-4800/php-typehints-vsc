import * as assert from 'assert';
import * as vscode from 'vscode';
import { parseFunctionCalls, parseFunctionDeclarations } from '../parser';

suite('Parser Test Suite', () => {

    function createMockDocument(content: string): vscode.TextDocument {
        return {
            getText: () => content,
            lineCount: content.split('\n').length,
            uri: vscode.Uri.parse('untitled:test.php'),
            fileName: 'test.php',
            languageId: 'php',
            version: 1,
            isDirty: false,
            isClosed: false,
            isUntitled: true,
            eol: vscode.EndOfLine.LF,
            encoding: 'utf-8',
            lineAt: (line: number) => {
                const lines = content.split('\n');
                const text = lines[line] || '';
                return {
                    lineNumber: line,
                    text: text,
                    range: new vscode.Range(line, 0, line, text.length),
                    rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
                    firstNonWhitespaceCharacterIndex: text.search(/\S/),
                    isEmptyOrWhitespace: text.trim().length === 0,
                };
            },
            offsetAt: (position: vscode.Position) => {
                const lines = content.split('\n');
                let offset = 0;
                for (let i = 0; i < position.line; i++) {
                    offset += lines[i].length + 1;
                }
                offset += position.character;
                return offset;
            },
            positionAt: (offset: number) => {
                const lines = content.split('\n');
                let currentOffset = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (currentOffset + lines[i].length >= offset) {
                        return new vscode.Position(i, offset - currentOffset);
                    }
                    currentOffset += lines[i].length + 1;
                }
                return new vscode.Position(lines.length - 1, 0);
            },
            getWordRangeAtPosition: () => undefined,
            validateRange: (range: vscode.Range) => range,
            validatePosition: (position: vscode.Position) => position,
            save: () => Promise.resolve(true),
            notebook: undefined,
        } as unknown as vscode.TextDocument;
    }

    test('Should parse simple function call', () => {
        const content = `<?php
greet("John", "Hi");
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find at least one function call');
        assert.strictEqual(calls[0].arguments.length, 2, 'Should have 2 arguments');
        assert.strictEqual(
            calls[0].arguments[0].isNamed,
            false,
            'String literal should not be named'
        );
        assert.strictEqual(
            calls[0].arguments[1].isNamed,
            false,
            'String literal should not be named'
        );
    });

    test('Should NOT mark variable arguments as named', () => {
        const content = `<?php
greet($name, $greeting);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find function call');
        assert.strictEqual(calls[0].arguments.length, 2, 'Should have 2 arguments');
        assert.strictEqual(
            calls[0].arguments[0].isNamed,
            false,
            'Variable should NOT be marked as named argument'
        );
        assert.strictEqual(
            calls[0].arguments[1].isNamed,
            false,
            'Variable should NOT be marked as named argument'
        );
    });

    test('Should detect named arguments', () => {
        const content = `<?php
greet(name: "John", greeting: "Hi");
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find function call');
        const call = calls[0];

        assert.strictEqual(call.arguments.length, 2, 'Should have 2 arguments');
        assert.strictEqual(call.arguments[0].isNamed, true, 'First argument should be named');
        assert.strictEqual(call.arguments[1].isNamed, true, 'Second argument should be named');
    });

    test('Should parse constructor call with new', () => {
        const content = `<?php
$user = new User("Alice", 30);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find constructor call');
        assert.strictEqual(calls[0].arguments.length, 2, 'Should have 2 arguments');
    });

    test('Should parse method call', () => {
        const content = `<?php
$calc->add(5, 3);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find method call');
        assert.strictEqual(calls[0].arguments.length, 2, 'Should have 2 arguments');
    });

    test('Should parse static method call', () => {
        const content = `<?php
Calculator::multiply(4, 6);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find static method call');
        assert.strictEqual(calls[0].arguments.length, 2, 'Should have 2 arguments');
    });

    test('Should handle static closure with correct position', () => {
        const content = `<?php
array_map(static fn($x) => $x * 2, $values);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find function call');
        const call = calls[0];
        assert.strictEqual(call.arguments.length, 2, 'Should have 2 arguments');
        assert.strictEqual(
            call.arguments[0].position.character,
            10,
            'Position should be at start of "static"'
        );
    });

    test('Should parse nested function calls', () => {
        const content = `<?php
outer(inner(5));
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.strictEqual(calls.length, 2, 'Should find both outer and inner calls');
    });

    test('Should parse chained method calls', () => {
        const content = `<?php
$query->where('status', 'active')->orderBy('created_at', 'DESC')->limit(10);
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.strictEqual(calls.length, 3, 'Should find all three chained method calls');
    });

    test('Should handle function with no arguments', () => {
        const content = `<?php
$service->start();
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find method call');
        assert.strictEqual(calls[0].arguments.length, 0, 'Should have 0 arguments');
    });

    test('Should handle mixed positional and named arguments', () => {
        const content = `<?php
greet("Dave", greeting: "Aloha");
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(calls.length > 0, 'Should find function call');
        const call = calls[0];

        assert.strictEqual(call.arguments.length, 2, 'Should have 2 arguments');
        assert.strictEqual(call.arguments[0].isNamed, false, 'First argument should be positional');
        assert.strictEqual(call.arguments[1].isNamed, true, 'Second argument should be named');
    });

    test('Should handle parse errors gracefully', () => {
        const content = `<?php
greet("John" "Hi");
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const calls = parseFunctionCalls(doc, range);

        assert.ok(Array.isArray(calls), 'Should return an array');
    });
});

suite('Function Declarations Parser Test Suite', () => {
    function createMockDocument(content: string): vscode.TextDocument {
        return {
            getText: () => content,
            lineCount: content.split('\n').length,
            uri: vscode.Uri.parse('untitled:test.php'),
            fileName: 'test.php',
            languageId: 'php',
            version: 1,
            isDirty: false,
            isClosed: false,
            isUntitled: true,
            eol: vscode.EndOfLine.LF,
            encoding: 'utf-8',
            lineAt: (line: number) => {
                const lines = content.split('\n');
                const text = lines[line] || '';
                return {
                    lineNumber: line,
                    text: text,
                    range: new vscode.Range(line, 0, line, text.length),
                    rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
                    firstNonWhitespaceCharacterIndex: text.search(/\S/),
                    isEmptyOrWhitespace: text.trim().length === 0,
                };
            },
            offsetAt: (position: vscode.Position) => {
                const lines = content.split('\n');
                let offset = 0;
                for (let i = 0; i < position.line; i++) {
                    offset += lines[i].length + 1;
                }
                offset += position.character;
                return offset;
            },
            positionAt: (offset: number) => {
                const lines = content.split('\n');
                let currentOffset = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (currentOffset + lines[i].length >= offset) {
                        return new vscode.Position(i, offset - currentOffset);
                    }
                    currentOffset += lines[i].length + 1;
                }
                return new vscode.Position(lines.length - 1, 0);
            },
            getWordRangeAtPosition: () => undefined,
            validateRange: (range: vscode.Range) => range,
            validatePosition: (position: vscode.Position) => position,
            save: () => Promise.resolve(true),
            notebook: undefined,
        } as unknown as vscode.TextDocument;
    }

    test('Should parse function with void return type', () => {
        const content = `<?php
function greet(string $name): void {
    echo "Hello, $name";
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
        assert.strictEqual(declarations[0].name, 'greet', 'Function name should be greet');
        assert.ok(declarations[0].hasReturnType, 'Function should have return type');
    });

    test('Should parse function with string return type', () => {
        const content = `<?php
function getName(): string {
    return "John";
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
        assert.ok(declarations[0].hasReturnType, 'Function should have return type');
    });

    test('Should parse function with nullable return type', () => {
        const content = `<?php
function findUser(int $id): ?string {
    return null;
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
        assert.ok(declarations[0].hasReturnType, 'Function should have return type');
    });

    test('Should parse function without return type', () => {
        const content = `<?php
function legacy($param) {
    return $param;
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
        assert.strictEqual(
            declarations[0].hasReturnType,
            false,
            'Function should not have return type'
        );
    });

    test('Should parse class method with return type', () => {
        const content = `<?php
class Calculator {
    public function add(int $a, int $b): int {
        return $a + $b;
    }
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.ok(declarations.length > 0, 'Should find method declaration');
        const method = declarations.find((d) => d.name === 'add');
        assert.ok(method, 'Should find add method');
        assert.ok(method!.hasReturnType, 'Method should have return type');
    });

    test('Should parse arrow function with return type', () => {
        const content = `<?php
$double = fn(int $x): int => $x * 2;
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.ok(declarations.length > 0, 'Should find arrow function');
        assert.ok(declarations[0].hasReturnType, 'Arrow function should have return type');
    });

    test('Should parse anonymous function with return type', () => {
        const content = `<?php
$sum = function(int $a, int $b): int {
    return $a + $b;
};
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.ok(declarations.length > 0, 'Should find anonymous function');
        assert.ok(declarations[0].hasReturnType, 'Anonymous function should have return type');
    });

    test('Should parse multiple functions', () => {
        const content = `<?php
function first(): void {}
function second(): string { return ""; }
function third() {}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.strictEqual(declarations.length, 3, 'Should find three functions');
        assert.ok(declarations[0].hasReturnType, 'First function should have return type');
        assert.ok(declarations[1].hasReturnType, 'Second function should have return type');
        assert.strictEqual(
            declarations[2].hasReturnType,
            false,
            'Third function should not have return type'
        );
    });

    test('Should handle parse errors gracefully', () => {
        const content = `<?php
function broken(: string {
    return "";
}
`;
        const doc = createMockDocument(content);
        const range = new vscode.Range(0, 0, 10, 0);

        const declarations = parseFunctionDeclarations(doc, range);

        assert.ok(Array.isArray(declarations), 'Should return an array');
    });
});
