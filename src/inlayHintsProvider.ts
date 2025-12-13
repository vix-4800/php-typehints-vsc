import * as vscode from 'vscode';
import { parseFunctionCalls, parseFunctionDeclarations } from './parser.js';
import { getSignatureHelp } from './signatureHelper.js';
import { getReturnTypeAtPosition } from './typeHelper.js';

export class PhpInlayHintsProvider implements vscode.InlayHintsProvider {
    async provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        const config = vscode.workspace.getConfiguration('phpTypeHints');

        if (!config.get<boolean>('enabled', true)) {
            return [];
        }

        const hints: vscode.InlayHint[] = [];

        try {
            if (config.get<boolean>('showParameterHints', true)) {
                const parameterHints = await this.getParameterHints(document, range, token, config);
                hints.push(...parameterHints);
            }

            if (config.get<boolean>('showReturnTypeHints', true)) {
                const returnTypeHints = await this.getReturnTypeHints(document, range, token);
                hints.push(...returnTypeHints);
            }
        } catch {
            return hints;
        }

        return hints;
    }

    private async getParameterHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken,
        config: vscode.WorkspaceConfiguration
    ): Promise<vscode.InlayHint[]> {
        const hints: vscode.InlayHint[] = [];
        const functionCalls = parseFunctionCalls(document, range);

        for (const call of functionCalls) {
            if (token.isCancellationRequested) {
                break;
            }

            const signatureHelp = await getSignatureHelp(document, call.position);

            if (!signatureHelp || signatureHelp.signatures.length === 0) {
                continue;
            }

            const signature = signatureHelp.signatures[signatureHelp.activeSignature || 0];

            if (!signature.parameters || signature.parameters.length === 0) {
                continue;
            }

            for (let i = 0; i < call.arguments.length; i++) {
                const arg = call.arguments[i];

                if (arg.isNamed) {
                    continue;
                }

                const parameter = signature.parameters[i];
                if (!parameter) {
                    continue;
                }

                const paramName = this.extractParameterName(parameter.label, signature.label);
                if (!paramName) {
                    continue;
                }

                if (this.shouldHideHint(arg, paramName, config)) {
                    continue;
                }

                const hint = new vscode.InlayHint(
                    arg.position,
                    `${paramName}:`,
                    vscode.InlayHintKind.Parameter
                );

                hint.paddingRight = true;
                hints.push(hint);
            }
        }

        return hints;
    }

    private async getReturnTypeHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): Promise<vscode.InlayHint[]> {
        const hints: vscode.InlayHint[] = [];
        const declarations = parseFunctionDeclarations(document, range);

        for (const decl of declarations) {
            if (token.isCancellationRequested) {
                break;
            }

            if (decl.hasReturnType) {
                continue;
            }

            const returnType = await getReturnTypeAtPosition(document, decl.namePosition);
            if (!returnType) {
                continue;
            }

            const hint = new vscode.InlayHint(
                decl.position,
                `: ${returnType}`,
                vscode.InlayHintKind.Type
            );

            hint.paddingLeft = true;
            hints.push(hint);
        }

        return hints;
    }

    private extractParameterName(
        label: string | vscode.ParameterInformation['label'],
        signatureLabel: string
    ): string | null {
        let labelStr: string;

        if (Array.isArray(label)) {
            const [start, end] = label;
            labelStr = signatureLabel.substring(start, end);
        } else {
            labelStr = String(label);
        }

        const match = labelStr.match(/\$(\w+)/);
        return match ? match[1] : null;
    }

    private shouldHideHint(
        arg: { text: string; isNamed: boolean; position: vscode.Position },
        paramName: string,
        config: vscode.WorkspaceConfiguration
    ): boolean {
        const hideWhenMatches = config.get<boolean>('hideWhenArgumentMatchesName', true);

        if (hideWhenMatches) {
            const argVarMatch = arg.text.trim().match(/^\$(\w+)$/);
            if (argVarMatch && argVarMatch[1] === paramName) {
                return true;
            }
        }

        return false;
    }
}
