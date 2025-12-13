import * as vscode from 'vscode';

export async function getSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position
): Promise<vscode.SignatureHelp | undefined> {
    try {
        const signatureHelp = await vscode.commands.executeCommand<vscode.SignatureHelp>(
            'vscode.executeSignatureHelpProvider',
            document.uri,
            position
        );

        return signatureHelp;
    } catch (error) {
        return undefined;
    }
}
