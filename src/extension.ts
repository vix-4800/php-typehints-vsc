import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider.js';
import { getAstCache } from './parser.js';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PhpInlayHintsProvider();
    const selector: vscode.DocumentSelector = [
        { language: 'php', scheme: 'file' },
        { language: 'php', scheme: 'untitled' },
    ];

    const disposable = vscode.languages.registerInlayHintsProvider(selector, provider);

    const closeDisposable = vscode.workspace.onDidCloseTextDocument((document) => {
        if (document.languageId === 'php') {
            getAstCache().invalidate(document.uri);
        }
    });

    context.subscriptions.push(disposable, closeDisposable);
}

export function deactivate() {
    getAstCache().clear();
}
