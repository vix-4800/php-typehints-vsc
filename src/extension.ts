import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('PHP Parameter Hints extension is activating...');

    const provider = new PhpInlayHintsProvider();

    // Register for both 'file' and 'untitled' schemes
    const selector: vscode.DocumentSelector = [
        { language: 'php', scheme: 'file' },
        { language: 'php', scheme: 'untitled' },
    ];

    const disposable = vscode.languages.registerInlayHintsProvider(selector, provider);

    context.subscriptions.push(disposable);

    console.log('PHP Parameter Hints extension activated successfully');
}

export function deactivate() {}
