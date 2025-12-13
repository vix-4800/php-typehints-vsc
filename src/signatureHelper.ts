import * as vscode from 'vscode';

/**
 * Get signature help from language server (Intelephense) for a given position
 */
export async function getSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position
): Promise<vscode.SignatureHelp | undefined> {
    try {
        console.log(
            `Requesting signature help at ${document.uri.fsPath}:${position.line + 1}:${
                position.character
            }`
        );

        const signatureHelp = await vscode.commands.executeCommand<vscode.SignatureHelp>(
            'vscode.executeSignatureHelpProvider',
            document.uri,
            position
        );

        if (signatureHelp) {
            console.log(
                `Received signature help with ${signatureHelp.signatures.length} signatures`
            );
            if (signatureHelp.signatures.length > 0) {
                console.log(`First signature: ${signatureHelp.signatures[0].label}`);
            }
        } else {
            console.log('No signature help returned');
        }

        return signatureHelp;
    } catch (error) {
        console.error('Error getting signature help:', error);
        return undefined;
    }
}
