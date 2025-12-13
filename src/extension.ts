import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('PHP Parameter Hints extension is activating...');

    const provider = new PhpInlayHintsProvider();
    const disposable = vscode.languages.registerInlayHintsProvider(
        { language: 'php', scheme: 'file' },
        provider
    );

    context.subscriptions.push(disposable);

    console.log('PHP Parameter Hints extension activated successfully');
}

export function deactivate() {}
