import * as vscode from 'vscode';
import { parseFunctionCalls } from './parser.js';
import { getSignatureHelp } from './signatureHelper.js';

/**
 * Provider for PHP parameter inlay hints
 */
export class PhpInlayHintsProvider implements vscode.InlayHintsProvider {
    constructor(private outputChannel: vscode.OutputChannel) {}

    async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        this.outputChannel.appendLine(`\n[${new Date().toISOString()}] provideInlayHints called`);
        this.outputChannel.appendLine(`File: ${document.uri.fsPath}`);
        this.outputChannel.appendLine(
            `Range: ${range.start.line}:${range.start.character} - ${range.end.line}:${range.end.character}`
        );

        const config = vscode.workspace.getConfiguration('phpParameterHints');

        // Check if hints are enabled
        if (!config.get<boolean>('enabled', true)) {
            this.outputChannel.appendLine('⚠️  Hints are disabled in settings');
            return [];
        }

        const hints: vscode.InlayHint[] = [];

        try {
            // Parse the document to find function calls
            const functionCalls = parseFunctionCalls(document, range);
            this.outputChannel.appendLine(`Found ${functionCalls.length} function calls`);

            // For each function call, get signature information from Intelephense
            for (const call of functionCalls) {
                if (token.isCancellationRequested) {
                    break;
                }

                this.outputChannel.appendLine(
                    `\n→ Getting signature help at position: ${call.position.line + 1}:${
                        call.position.character + 1
                    }`
                );

                // Get signature help from language server (Intelephense)
                const signatureHelp = await getSignatureHelp(document, call.position);

                if (!signatureHelp || signatureHelp.signatures.length === 0) {
                    this.outputChannel.appendLine('  ⚠️  No signature help received');
                    continue;
                }

                this.outputChannel.appendLine(
                    `  ✓ Got ${signatureHelp.signatures.length} signature(s)`
                );

                // Get the active signature
                const signature = signatureHelp.signatures[signatureHelp.activeSignature || 0];

                if (!signature.parameters || signature.parameters.length === 0) {
                    this.outputChannel.appendLine('  ⚠️  No parameters in signature');
                    continue;
                }

                this.outputChannel.appendLine(
                    `  Signature: ${signature.parameters.length} parameter(s), ${call.arguments.length} argument(s) in call`
                );

                if (!signature.parameters || signature.parameters.length === 0) {
                    console.log('No parameters in signature - skipping');
                    continue;
                }

                // Create hints for each argument
                for (let i = 0; i < call.arguments.length; i++) {
                    const arg = call.arguments[i];
                    this.outputChannel.appendLine(
                        `    [${i}] "${arg.text}" at ${arg.position.line + 1}:${
                            arg.position.character + 1
                        }`
                    );

                    // Skip if this is a named argument (already has a name)
                    if (arg.isNamed) {
                        this.outputChannel.appendLine(`        → Skipped (named argument)`);
                        continue;
                    }

                    // Get the parameter for this argument
                    const parameter = signature.parameters[i];
                    if (!parameter) {
                        this.outputChannel.appendLine(
                            `        → Skipped (no parameter at index ${i})`
                        );
                        continue; // More arguments than parameters
                    }

                    // Extract parameter name from the label
                    const paramName = this.extractParameterName(parameter.label, signature.label);
                    this.outputChannel.appendLine(
                        `        Parameter: "${parameter.label}" → extracted: "${paramName}"`
                    );
                    if (!paramName) {
                        this.outputChannel.appendLine(
                            `        → Skipped (could not extract parameter name)`
                        );
                        continue;
                    }

                    // Check if we should hide the hint
                    if (this.shouldHideHint(arg, paramName, config)) {
                        this.outputChannel.appendLine(`        → Skipped (matches parameter name)`);
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
                    this.outputChannel.appendLine(
                        `        ✓ Created hint: "${paramName}:" at ${arg.position.line + 1}:${
                            arg.position.character + 1
                        }`
                    );
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`\n❌ Error providing inlay hints: ${error}`);
        }

        this.outputChannel.appendLine(`\n✓ Returning ${hints.length} inlay hint(s)`);
        this.outputChannel.appendLine('='.repeat(60));
        return hints;
    }

    /**
     * Extract parameter name from parameter label
     * Parameter label might be like "$name" or "string $name" or "$name: string"
     * Or it can be a tuple [start, end] representing range in the signature label
     */
    private extractParameterName(
        label: string | vscode.ParameterInformation['label'],
        signatureLabel: string
    ): string | null {
        let labelStr: string;

        // If label is a tuple [start, end], extract substring from signature
        if (Array.isArray(label)) {
            const [start, end] = label;
            labelStr = signatureLabel.substring(start, end);
        } else {
            // It's a string
            labelStr = String(label);
        }

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
