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
            /_@return_\s*`([^`]+)`/,
            /@return\s+([^\n*]+?)(?:\s*(?:\n|\*\/|$))/,
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
    type = type.replace(/`/g, '');
    type = type.replace(/^\\+/, '');
    type = type.trim();

    return normalizePhpReturnType(type);
}

/**
 * Normalize PHPDoc/LSP types to valid PHP return types
 * Converts complex types that can't be used in PHP type hints to their valid equivalents
 *
 * Examples:
 * - Object[] -> array
 * - string[] -> array
 * - array<string, int> -> array
 * - Collection<User> -> Collection
 * - ?string -> string|null
 *
 * @param type The type string from PHPDoc or LSP
 * @returns Valid PHP return type or null if the type shouldn't be shown
 */
function normalizePhpReturnType(type: string): string {
    if (!type || type === 'void' || type === 'never' || type === 'mixed') {
        return type;
    }

    if (type === 'null') {
        return type;
    }

    if (type.startsWith('?')) {
        const innerType = normalizeSingleType(type.substring(1));
        return `${innerType}|null`;
    }

    if (hasTopLevelUnion(type)) {
        const parts = splitTopLevelUnion(type).map(part => normalizeSingleType(part.trim()));
        const uniqueParts = [...new Set(parts.filter(p => p))];
        return uniqueParts.join('|');
    }

    return normalizeSingleType(type);
}

/**
 * Check if type has union (|) at the top level, ignoring unions inside <>, (), or {}
 */
function hasTopLevelUnion(type: string): boolean {
    let depth = 0;
    for (let i = 0; i < type.length; i++) {
        const char = type[i];
        if (char === '<' || char === '(' || char === '{') {
            depth++;
        } else if (char === '>' || char === ')' || char === '}') {
            depth--;
        } else if (char === '|' && depth === 0) {
            return true;
        }
    }
    return false;
}

/**
 * Split type by top-level union (|), ignoring unions inside <>, (), or {}
 */
function splitTopLevelUnion(type: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < type.length; i++) {
        const char = type[i];
        if (char === '<' || char === '(' || char === '{') {
            depth++;
            current += char;
        } else if (char === '>' || char === ')' || char === '}') {
            depth--;
            current += char;
        } else if (char === '|' && depth === 0) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    if (current) {
        parts.push(current);
    }

    return parts;
}

/**
 * Normalize a single type (not a union)
 */
function normalizeSingleType(type: string): string {
    type = type.trim();

    if (type === '$this') {
        return 'static';
    }

    if (type.match(/\[\]$/)) {
        return 'array';
    }

    if (type.toLowerCase().startsWith('array<') && type.endsWith('>')) {
        return 'array';
    }

    if (type.match(/^list<.+>$/i)) {
        return 'array';
    }

    if (type.match(/^non-empty-array/i)) {
        return 'array';
    }

    if (type.match(/^array\{.+\}$/i)) {
        return 'array';
    }

    if (type.match(/^(callable|Closure)\(.+\)/i)) {
        const callableMatch = type.match(/^(callable|Closure)/i);
        return callableMatch ? callableMatch[1] : type;
    }

    if (type.match(/^(positive|negative|non-positive|non-negative)-int$/i)) {
        return 'int';
    }

    if (type.match(/^(non-empty|literal|class|callable|numeric|truthy|non-falsy)-string$/i)) {
        return 'string';
    }

    if (type.match(/^class-string<.+>$/i)) {
        return 'string';
    }

    const genericMatch = type.match(/^([A-Za-z_][A-Za-z0-9_\\]*)<.+>$/);
    if (genericMatch) {
        return genericMatch[1];
    }

    return type;
}
