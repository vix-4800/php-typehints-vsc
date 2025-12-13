import * as vscode from 'vscode';
import { parseFunctionCalls } from './parser';
import { getSignatureHelp } from './signatureHelper';

/**
 * Provider for PHP parameter inlay hints
 */
export class PhpInlayHintsProvider implements vscode.InlayHintsProvider {
    async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        console.log('provideInlayHints called for:', document.uri.fsPath);

        const config = vscode.workspace.getConfiguration('phpParameterHints');

        // Check if hints are enabled
        if (!config.get<boolean>('enabled', true)) {
            console.log('Hints are disabled in settings');
            return [];
        }

        const hints: vscode.InlayHint[] = [];

        try {
            // Parse the document to find function calls
            const functionCalls = parseFunctionCalls(document, range);
            console.log(`Found ${functionCalls.length} function calls`);

            // For each function call, get signature information from Intelephense
            for (const call of functionCalls) {
                if (token.isCancellationRequested) {
                    break;
                }

                console.log(
                    `Getting signature help at position: ${call.position.line}:${call.position.character}`
                );

                // Get signature help from language server (Intelephense)
                const signatureHelp = await getSignatureHelp(document, call.position);

                if (!signatureHelp || signatureHelp.signatures.length === 0) {
                    console.log('No signature help received');
                    continue;
                }

                console.log(`Got signature with ${signatureHelp.signatures.length} signatures`);

                // Get the active signature
                const signature = signatureHelp.signatures[signatureHelp.activeSignature || 0];

                if (!signature.parameters || signature.parameters.length === 0) {
                    console.log('No parameters in signature');
                    continue;
                }

                console.log(
                    `Signature has ${signature.parameters.length} parameters, call has ${call.arguments.length} arguments`
                );

                if (!signature.parameters || signature.parameters.length === 0) {
                    continue;
                }

                // Create hints for each argument
                for (let i = 0; i < call.arguments.length; i++) {
                    const arg = call.arguments[i];

                    // Skip if this is a named argument (already has a name)
                    if (arg.isNamed) {
                        continue;
                    }

                    // Get the parameter for this argument
                    const parameter = signature.parameters[i];
                    if (!parameter) {
                        continue; // More arguments than parameters
                    }

                    // Extract parameter name from the label
                    const paramName = this.extractParameterName(parameter.label);
                    if (!paramName) {
                        continue;
                    }

                    // Check if we should hide the hint
                    if (this.shouldHideHint(arg, paramName, config)) {
                        continue;
                    }

                    // Create the inlay hint
                    const hint = new vscode.InlayHint(
                        arg.position,
                        `${paramName}:`,
                        vscode.InlayHintKind.Parameter
                    );

                    hint.paddingRight = true;
                    hints.push(hint);
                }
            }
        } catch (error) {
            console.error('Error providing inlay hints:', error);
        }

        return hints;
    }

    /**
     * Extract parameter name from parameter label
     * Parameter label might be like "$name" or "string $name" or "$name: string"
     */
    private extractParameterName(
        label: string | vscode.ParameterInformation['label']
    ): string | null {
        const labelStr = typeof label === 'string' ? label : label.toString();

        // Match parameter name (with or without $)
        // Patterns: "$name", "string $name", "$name: string", etc.
        const match = labelStr.match(/\$(\w+)/);
        return match ? match[1] : null;
    }

    /**
     * Determine if hint should be hidden based on configuration and context
     */
    private shouldHideHint(
        arg: { text: string; isNamed: boolean; position: vscode.Position },
        paramName: string,
        config: vscode.WorkspaceConfiguration
    ): boolean {
        // Check if argument text matches parameter name
        const hideWhenMatches = config.get<boolean>('hideWhenArgumentMatchesName', true);

        if (hideWhenMatches) {
            // Extract variable name from argument text (e.g., "$user" -> "user")
            const argVarMatch = arg.text.trim().match(/^\$(\w+)$/);
            if (argVarMatch && argVarMatch[1] === paramName) {
                return true;
            }
        }

        return false;
    }
}
