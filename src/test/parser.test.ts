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
            save: async () => true,
            getWordRangeAtPosition: () => undefined,
            validateRange: (range: vscode.Range) => range,
            validatePosition: (position: vscode.Position) => position,
        } as any;
    }

    suite('Function Calls Parsing', () => {
        test('Parse simple function call', () => {
            const content = `<?php
            strlen($name);
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const calls = parseFunctionCalls(doc, range);

            assert.strictEqual(calls.length, 1, 'Should find one function call');
            assert.strictEqual(calls[0].arguments.length, 1, 'Should find one argument');
        });

        test('Parse function call with multiple arguments', () => {
            const content = `<?php
            str_replace($search, $replace, $subject);
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const calls = parseFunctionCalls(doc, range);

            assert.strictEqual(calls.length, 1, 'Should find one function call');
            assert.strictEqual(calls[0].arguments.length, 3, 'Should find three arguments');
        });

        test('Parse method call', () => {
            const content = `<?php
            $user->setName($name);
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const calls = parseFunctionCalls(doc, range);

            assert.strictEqual(calls.length, 1, 'Should find one method call');
            assert.strictEqual(calls[0].arguments.length, 1, 'Should find one argument');
        });
    });

    suite('Function Declarations Parsing', () => {
        test('Parse function without return type', () => {
            const content = `<?php
            function greet($name) {
                return "Hello, $name";
            }
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const declarations = parseFunctionDeclarations(doc, range);

            assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
            assert.strictEqual(declarations[0].hasReturnType, false, 'Should not have return type');
        });

        test('Parse function with return type', () => {
            const content = `<?php
            function add($a, $b): int {
                return $a + $b;
            }
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const declarations = parseFunctionDeclarations(doc, range);

            assert.strictEqual(declarations.length, 1, 'Should find one function declaration');
            assert.strictEqual(declarations[0].hasReturnType, true, 'Should have return type');
        });

        test('Parse class method', () => {
            const content = `<?php
            class Calculator {
                public function add($a, $b) {
                    return $a + $b;
                }
            }
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const declarations = parseFunctionDeclarations(doc, range);

            assert.strictEqual(declarations.length, 1, 'Should find one method declaration');
            assert.strictEqual(declarations[0].hasReturnType, false, 'Should not have return type');
        });

        test('Parse arrow function', () => {
            const content = `<?php
            $add = fn($a, $b) => $a + $b;
            `;
            const doc = createMockDocument(content);
            const range = new vscode.Range(0, 0, doc.lineCount, 0);
            const declarations = parseFunctionDeclarations(doc, range);

            assert.strictEqual(declarations.length, 1, 'Should find one arrow function');
            assert.strictEqual(declarations[0].hasReturnType, false, 'Should not have return type');
        });
    });
});
