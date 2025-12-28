import { Function, Method } from 'php-parser';
import * as vscode from 'vscode';

/**
 * Get return type for a function at a given position using LSP
 * Falls back to AST-based inference if LSP doesn't provide type information
 */
export async function getReturnTypeAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
    astNode?: Function | Method
): Promise<string | null> {
    try {
        const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider',
            document.uri,
            position
        );

        if (hovers && hovers.length > 0) {
            for (const hover of hovers) {
                const returnType = extractReturnTypeFromHover(hover);
                if (returnType) {
                    return returnType;
                }
            }
        }

        if (astNode) {
            return inferReturnTypeFromAst(astNode);
        }

        return null;
    } catch (error) {
        if (astNode) {
            return inferReturnTypeFromAst(astNode);
        }
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

        const signaturePatterns: RegExp[] = [
            /\bfunction\b\s*(?:\w+\s*)?\([^)]*\)\s*:\s*([^\s{]+)/,
            /\bfn\b\s*\([^)]*\)\s*:\s*([^\s{]+)/,
        ];

        const closureLikePattern =
            /(?:^|[^\w@])(?:\\?Closure|\\?callable)\s*\([^)]*\)\s*:\s*([^\s{]+)/i;

        const docPatterns: RegExp[] = [
            /_@return_\s*`([^`]+)`/,
            /@return\s+([^\n*]+?)(?:\s*(?:\n|\*\/|$))/,
        ];

        const patterns: RegExp[] = [
            ...signaturePatterns,
            ...(text.includes('@return') ? [] : [closureLikePattern]),
            ...docPatterns,
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

/**
 * Infer return type from AST by analyzing return statements
 * This is a fallback when LSP doesn't provide type information
 */
function inferReturnTypeFromAst(node: Function | Method): string | null {
    if (!node.body) {
        return null;
    }

    const returnTypes = new Set<string>();
    let hasReturn = false;
    let hasUnknownReturn = false;

    const collectReturnTypes = (n: any): void => {
        if (!n || typeof n !== 'object') {
            return;
        }

        if (n.kind === 'return') {
            hasReturn = true;
            const type = inferExpressionType(n.expr);
            if (type) {
                returnTypes.add(type);
            } else if (n.expr) {
                hasUnknownReturn = true;
            }
        }

        if (n.kind === 'function' || n.kind === 'method' || n.kind === 'closure' || n.kind === 'arrowfunc') {
            return;
        }

        for (const key in n) {
            if (n.hasOwnProperty(key)) {
                const value = n[key];
                if (Array.isArray(value)) {
                    value.forEach(item => collectReturnTypes(item));
                } else if (typeof value === 'object' && value !== null) {
                    collectReturnTypes(value);
                }
            }
        }
    };

    if (node.kind === 'arrowfunc' && node.body) {
        const type = inferExpressionType(node.body);
        return type || null;
    }

    collectReturnTypes(node.body);

    if (hasUnknownReturn) {
        return null;
    }

    if (!hasReturn) {
        return 'void';
    }

    if (returnTypes.size === 0) {
        return null;
    }

    const types = Array.from(returnTypes);

    if (types.length === 1) {
        return types[0];
    }

    if (types.length === 2 && types.includes('null')) {
        const otherType = types.find(t => t !== 'null');
        return otherType ? `${otherType}|null` : null;
    }

    if (types.every(t => ['int', 'float', 'string', 'bool', 'array', 'null', 'void'].includes(t))) {
        return types.join('|');
    }

    return null;
}

/**
 * Infer the type of an expression from AST
 * Returns simple, safe types only
 */
function inferExpressionType(expr: any): string | null {
    if (!expr || typeof expr !== 'object') {
        return null;
    }

    switch (expr.kind) {
        case 'array':
            return 'array';

        case 'string':
        case 'encapsed':
        case 'nowdoc':
        case 'heredoc':
            return 'string';

        case 'number':
            if (expr.value && typeof expr.value === 'string' && expr.value.includes('.')) {
                return 'float';
            }
            return 'int';

        case 'boolean':
            return 'bool';

        case 'nullkeyword':
        case 'null':
            return 'null';

        case 'new':
            if (expr.what && expr.what.name) {
                if (typeof expr.what.name === 'string') {
                    return expr.what.name;
                }
            }
            return null;

        case 'variable':
            if (expr.name === 'this') {
                return 'static';
            }
            return null;

        case 'bin':
            if ([
                '>', '<', '>=', '<=',
                '==', '===', '!=', '!==',
                '<>',
                '&&', '||', 'and', 'or', 'xor',
                'instanceof'
            ].includes(expr.type)) {
                return 'bool';
            }

            if (expr.type === '+' || expr.type === '-' || expr.type === '*' || expr.type === '/') {
                const leftType = inferExpressionType(expr.left);
                const rightType = inferExpressionType(expr.right);

                if (leftType === 'float' || rightType === 'float') {
                    return 'float';
                }

                if (leftType === 'int' || rightType === 'int') {
                    return 'int';
                }

                if (leftType || rightType) {
                    return 'int';
                }
            }

            if (expr.type === '.') {
                return 'string';
            }

            return null;

        case 'unary':
            if (expr.type === '!') {
                return 'bool';
            }
            return null;

        case 'retif':
            const trueType = inferExpressionType(expr.trueExpr);
            const falseType = inferExpressionType(expr.falseExpr);

            if (trueType === falseType) {
                return trueType;
            }
            if (trueType && falseType) {
                return `${trueType}|${falseType}`;
            }
            return null;

        default:
            return null;
    }
}
