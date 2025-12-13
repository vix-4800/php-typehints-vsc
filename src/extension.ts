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

    const toggleCommand = vscode.commands.registerCommand('phpTypeHints.toggleHints', async () => {
        const config = vscode.workspace.getConfiguration('phpTypeHints');
        const currentValue = config.get<boolean>('enabled', true);
        await config.update('enabled', !currentValue, vscode.ConfigurationTarget.Global);

        const status = !currentValue ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`PHP Type Hints ${status}`);
    });

    context.subscriptions.push(disposable, closeDisposable, toggleCommand);
}

export function deactivate() {
    getAstCache().clear();
}
