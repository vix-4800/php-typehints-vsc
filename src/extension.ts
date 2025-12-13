import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider.js';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PhpInlayHintsProvider();
    const selector: vscode.DocumentSelector = [
        { language: 'php', scheme: 'file' },
        { language: 'php', scheme: 'untitled' },
    ];

    const disposable = vscode.languages.registerInlayHintsProvider(selector, provider);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
