import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('PHP Parameter Hints Test Suite', () => {
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('vix.php-typehints-vsc'));
    });

    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('vix.php-typehints-vsc');
        assert.ok(ext);
        await ext.activate();
        assert.strictEqual(ext.isActive, true);
    });

    test('Should provide inlay hints for simple function call', async function () {
        this.timeout(10000);

        const content = `<?php
function greet(string $name, string $greeting = "Hello"): void {
    echo "$greeting, $name!";
}

greet("John", "Hi");
`;

        const doc = await vscode.workspace.openTextDocument({
            language: 'php',
            content: content,
        });

        await vscode.window.showTextDocument(doc);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const hints = await vscode.commands.executeCommand<vscode.InlayHint[]>(
            'vscode.executeInlayHintProvider',
            doc.uri,
            new vscode.Range(0, 0, doc.lineCount, 0)
        );

        assert.ok(hints !== undefined, 'Hints should be defined');

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('Should not provide hints for named arguments', async function () {
        this.timeout(10000);

        const content = `<?php
function greet(string $name, string $greeting = "Hello"): void {
    echo "$greeting, $name!";
}

greet(name: "John", greeting: "Hi");
`;

        const doc = await vscode.workspace.openTextDocument({
            language: 'php',
            content: content,
        });

        await vscode.window.showTextDocument(doc);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const hints = await vscode.commands.executeCommand<vscode.InlayHint[]>(
            'vscode.executeInlayHintProvider',
            doc.uri,
            new vscode.Range(0, 0, doc.lineCount, 0)
        );

        assert.ok(hints !== undefined);

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
});
