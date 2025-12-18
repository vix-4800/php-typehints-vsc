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

    const insertNamedParamCommand = vscode.commands.registerCommand(
        'phpTypeHints.insertNamedParameter',
        async (args: { uri: string; position: vscode.Position; paramName: string }) => {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(args.uri));
            const editor = await vscode.window.showTextDocument(document);

            await editor.edit(editBuilder => {
                editBuilder.insert(args.position, `${args.paramName}: `);
            });
        }
    );

    const insertReturnTypeCommand = vscode.commands.registerCommand(
        'phpTypeHints.insertReturnType',
        async (args: { uri: string; position: vscode.Position; returnType: string }) => {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(args.uri));
            const editor = await vscode.window.showTextDocument(document);

            await editor.edit(editBuilder => {
                editBuilder.insert(args.position, `: ${args.returnType}`);
            });
        }
    );

    context.subscriptions.push(
        disposable,
        closeDisposable,
        toggleCommand,
        insertNamedParamCommand,
        insertReturnTypeCommand
    );
}

export function deactivate() {
    getAstCache().clear();
}
