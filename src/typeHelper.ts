import * as vscode from 'vscode';

/**
 * Get return type for a function at a given position using LSP
 * This relies on language servers like Intelephense to provide accurate type information
 */
export async function getReturnTypeAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
): Promise<string | null> {
    try {
        const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider',
            document.uri,
            position
        );

        if (!hovers || hovers.length === 0) {
            return null;
        }

        for (const hover of hovers) {
            const returnType = extractReturnTypeFromHover(hover);
            if (returnType) {
                return returnType;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Extract return type from hover markdown content
 */
function extractReturnTypeFromHover(hover: vscode.Hover): string | null {
    if (!hover.contents || hover.contents.length === 0) {
        return null;
    }

    for (const content of hover.contents) {
        let text: string;

        if (typeof content === 'string') {
            text = content;
        } else if (content instanceof vscode.MarkdownString) {
            text = content.value;
        } else if ('value' in content && typeof content.value === 'string') {
            text = content.value;
        } else {
            continue;
        }

        const patterns = [
            /function\s+\w+\([^)]*\)\s*:\s*([^\s{]+)/,
            /\)\s*:\s*([^\s{]+)/,
            /_@return_\s*`([^`]+(?:\[\])?)`/,
            /@return\s+([^\s\n]+)/,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const returnType = match[1].trim();

                if (!returnType.includes('```') && !returnType.includes('*')) {
                    return normalizeReturnType(returnType);
                }
            }
        }
    }

    return null;
}

/**
 * Normalize and clean return type string
 */
function normalizeReturnType(type: string): string {
    type = type.replace(/[{}()]/g, '').trim();
    type = type.replace(/^\((.*)\)$/, '$1');
    type = type.replace(/^\\+/, '');

    return type;
}
