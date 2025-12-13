import * as vscode from 'vscode';

/**
 * Get signature help from language server (Intelephense) for a given position
 */
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
