import * as vscode from 'vscode';
import { PhpInlayHintsProvider } from './inlayHintsProvider.js';

export function activate(context: vscode.ExtensionContext) {
    // Create output channel for logging
    const outputChannel = vscode.window.createOutputChannel('PHP Parameter Hints');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('PHP Parameter Hints extension is activating...');

    const provider = new PhpInlayHintsProvider(outputChannel);

    // Register for both 'file' and 'untitled' schemes
    const selector: vscode.DocumentSelector = [
        { language: 'php', scheme: 'file' },
        { language: 'php', scheme: 'untitled' },
    ];

    const disposable = vscode.languages.registerInlayHintsProvider(selector, provider);

    context.subscriptions.push(disposable);

    // Debug command to test signature help
    const testCommand = vscode.commands.registerCommand(
        'phpParameterHints.testSignature',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const document = editor.document;
            const position = editor.selection.active;

            vscode.window.showInformationMessage(
                `Testing at ${position.line + 1}:${position.character}`
            );

            try {
                const signatureHelp = await vscode.commands.executeCommand<vscode.SignatureHelp>(
                    'vscode.executeSignatureHelpProvider',
                    document.uri,
                    position
                );

                if (signatureHelp && signatureHelp.signatures.length > 0) {
                    vscode.window.showInformationMessage(
                        `Found signature: ${signatureHelp.signatures[0].label}`
                    );
                } else {
                    vscode.window.showWarningMessage('No signature help at this position');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }
    );

    context.subscriptions.push(testCommand);

    outputChannel.appendLine('PHP Parameter Hints extension activated successfully');
    outputChannel.appendLine('---');
}

export function deactivate() {}
