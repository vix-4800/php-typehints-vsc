import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PhpInlayHintsProvider();
    const disposable = vscode.languages.registerInlayHintsProvider(
        { language: 'php', scheme: 'file' },
        provider
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
