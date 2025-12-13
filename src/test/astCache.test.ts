import * as assert from 'assert';
import * as vscode from 'vscode';
import { AstCache } from '../astCache';

suite('AST Cache Test Suite', () => {
    function createMockDocument(content: string, version = 1, uri = 'test.php'): vscode.TextDocument {
        return {
            getText: () => content,
            lineCount: content.split('\n').length,
            uri: vscode.Uri.parse(`untitled:${uri}`),
            fileName: uri,
            languageId: 'php',
            version: version,
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

    test('Should cache AST for same document version', () => {
        const cache = new AstCache(10);
        const content = `<?php
        function test() {
            return 42;
        }`;
        const doc = createMockDocument(content);

        const ast1 = cache.getAst(doc);
        const ast2 = cache.getAst(doc);

        assert.ok(ast1 !== null, 'First parse should succeed');
        assert.strictEqual(ast1, ast2, 'Should return cached AST for same version');
    });

    test('Should re-parse when document version changes', () => {
        const cache = new AstCache(10);
        const content1 = `<?php function test1() {}`;
        const content2 = `<?php function test2() {}`;

        const doc1 = createMockDocument(content1, 1);
        const doc2 = createMockDocument(content2, 2);

        const ast1 = cache.getAst(doc1);
        const ast2 = cache.getAst(doc2);

        assert.ok(ast1 !== null, 'First parse should succeed');
        assert.ok(ast2 !== null, 'Second parse should succeed');
        assert.notStrictEqual(ast1, ast2, 'Should return different AST for different version');
    });

    test('Should invalidate cache for specific document', () => {
        const cache = new AstCache(10);
        const content = `<?php function test() {}`;
        const doc = createMockDocument(content);

        const ast1 = cache.getAst(doc);
        assert.ok(ast1 !== null);

        cache.invalidate(doc.uri);
        assert.strictEqual(cache.size, 0, 'Cache should be empty after invalidation');

        const ast2 = cache.getAst(doc);
        assert.ok(ast2 !== null, 'Should re-parse after invalidation');
    });

    test('Should respect max size and evict oldest entries', () => {
        const cache = new AstCache(3);

        const doc1 = createMockDocument(`<?php function test1() {}`, 1, 'doc1.php');
        const doc2 = createMockDocument(`<?php function test2() {}`, 1, 'doc2.php');
        const doc3 = createMockDocument(`<?php function test3() {}`, 1, 'doc3.php');
        const doc4 = createMockDocument(`<?php function test4() {}`, 1, 'doc4.php');

        cache.getAst(doc1);
        cache.getAst(doc2);
        cache.getAst(doc3);

        assert.strictEqual(cache.size, 3, 'Cache should contain 3 entries');

        cache.getAst(doc4);

        assert.strictEqual(cache.size, 3, 'Cache should still contain only 3 entries after eviction');
    });

    test('Should clear all cache entries', () => {
        const cache = new AstCache(10);
        const doc1 = createMockDocument(`<?php function test1() {}`, 1, 'doc1.php');
        const doc2 = createMockDocument(`<?php function test2() {}`, 1, 'doc2.php');

        cache.getAst(doc1);
        cache.getAst(doc2);

        assert.strictEqual(cache.size, 2);

        cache.clear();

        assert.strictEqual(cache.size, 0, 'Cache should be empty after clear');
    });

    test('Should return null for invalid PHP code', () => {
        const cache = new AstCache(10);
        const content = `<?php this is not valid php code {{{`;
        const doc = createMockDocument(content);

        const ast = cache.getAst(doc);

        assert.strictEqual(ast, null, 'Should return null for invalid PHP');
    });

    test('Should cache different documents separately', () => {
        const cache = new AstCache(10);
        const doc1 = createMockDocument(`<?php function test1() {}`, 1, 'doc1.php');
        const doc2 = createMockDocument(`<?php function test2() {}`, 1, 'doc2.php');

        const ast1 = cache.getAst(doc1);
        const ast2 = cache.getAst(doc2);

        assert.ok(ast1 !== null);
        assert.ok(ast2 !== null);
        assert.notStrictEqual(ast1, ast2, 'Different documents should have different ASTs');
        assert.strictEqual(cache.size, 2, 'Should cache both documents');
    });
});
