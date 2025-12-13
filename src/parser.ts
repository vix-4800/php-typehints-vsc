import * as vscode from 'vscode';
import { Engine, Node, Program, Call, New, Function, Method, Closure } from 'php-parser';

export interface ArgumentInfo {
    position: vscode.Position;
    text: string;
    isNamed: boolean;
}

export interface FunctionCallInfo {
    position: vscode.Position;
    arguments: ArgumentInfo[];
}

export interface FunctionDeclarationInfo {
    name: string;
    namePosition: vscode.Position;
    returnTypePosition: vscode.Position;
    hasReturnType: boolean;
}

export function parseFunctionCalls(
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionCallInfo[] {
    const calls: FunctionCallInfo[] = [];

    try {
        const text = document.getText();
        const parser = new Engine({
            parser: {
                extractDoc: false,
                php7: true,
                php8: true,
            },
            ast: {
                withPositions: true,
            },
        });

        let ast: Program;
        try {
            ast = parser.parseCode(text, 'document.php');
        } catch {
            return calls;
        }

        traverseNode(ast, (node: Node) => {
            if (node.kind === 'call') {
                const callNode = node as Call;
                const callInfo = extractCallInfo(callNode, document, range);
                if (callInfo) {
                    calls.push(callInfo);
                }
            } else if (node.kind === 'new') {
                const newNode = node as New;
                const callInfo = extractNewInfo(newNode, document, range);
                if (callInfo) {
                    calls.push(callInfo);
                }
            }
        });
    } catch {
        return calls;
    }

    return calls;
}

function extractCallInfo(
    node: Call,
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionCallInfo | null {
    if (!node.loc || !node.arguments) {
        return null;
    }

    const callPosition = new vscode.Position(node.loc.start.line - 1, node.loc.start.column);

    if (!range.contains(callPosition)) {
        return null;
    }

    const signatureHelpPosition = findOpeningParenPosition(node, document);
    if (!signatureHelpPosition) {
        return null;
    }

    const args: ArgumentInfo[] = [];

    for (const arg of node.arguments) {
        const argInfo = extractArgumentInfo(arg, document);
        if (argInfo) {
            args.push(argInfo);
        }
    }

    return {
        position: signatureHelpPosition,
        arguments: args,
    };
}

function extractNewInfo(
    node: New,
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionCallInfo | null {
    if (!node.loc || !node.arguments) {
        return null;
    }

    const newPosition = new vscode.Position(node.loc.start.line - 1, node.loc.start.column);

    if (!range.contains(newPosition)) {
        return null;
    }

    const signatureHelpPosition = findOpeningParenPosition(node, document);
    if (!signatureHelpPosition) {
        return null;
    }

    const args: ArgumentInfo[] = [];

    for (const arg of node.arguments) {
        const argInfo = extractArgumentInfo(arg, document);
        if (argInfo) {
            args.push(argInfo);
        }
    }

    return {
        position: signatureHelpPosition,
        arguments: args,
    };
}

function findOpeningParenPosition(
    node: Call | New,
    document: vscode.TextDocument
): vscode.Position | null {
    if (!node.loc) {
        return null;
    }

    const startLine = node.loc.start.line - 1;
    const startCol = node.loc.start.column;
    const endLine = node.loc.end.line - 1;
    const endCol = node.loc.end.column;

    const nodeRange = new vscode.Range(
        new vscode.Position(startLine, startCol),
        new vscode.Position(endLine, endCol)
    );
    const nodeText = document.getText(nodeRange);

    const parenIndex = nodeText.indexOf('(');
    if (parenIndex === -1) {
        return null;
    }

    const textBeforeParen = nodeText.substring(0, parenIndex);
    const lines = textBeforeParen.split('\n');
    const lineOffset = lines.length - 1;

    let finalLine: number;
    let finalCol: number;

    if (lineOffset === 0) {
        finalLine = startLine;
        finalCol = startCol + parenIndex + 1;
    } else {
        finalLine = startLine + lineOffset;
        finalCol = lines[lines.length - 1].length + 1;
    }

    return new vscode.Position(finalLine, finalCol);
}

function extractArgumentInfo(arg: any, document: vscode.TextDocument): ArgumentInfo | null {
    if (!arg.loc) {
        return null;
    }

    const isNamed = arg.kind === 'namedargument';

    let position: vscode.Position;
    if (isNamed && arg.value && arg.value.loc) {
        position = new vscode.Position(arg.value.loc.start.line - 1, arg.value.loc.start.column);
    } else {
        position = new vscode.Position(arg.loc.start.line - 1, arg.loc.start.column);
    }

    if ((arg.kind === 'arrowfunc' || arg.kind === 'closure') && arg.isStatic) {
        const line = document.lineAt(position.line).text;
        const beforeArg = line.substring(0, position.character);
        const staticMatch = beforeArg.match(/static\s*$/);
        if (staticMatch) {
            position = new vscode.Position(
                position.line,
                position.character - staticMatch[0].length
            );
        }
    }

    const argRange = new vscode.Range(
        new vscode.Position(arg.loc.start.line - 1, arg.loc.start.column),
        new vscode.Position(arg.loc.end.line - 1, arg.loc.end.column)
    );
    const text = document.getText(argRange);

    return {
        position,
        text,
        isNamed,
    };
}

function traverseNode(node: any, visitor: (node: Node) => void): void {
    if (!node || typeof node !== 'object') {
        return;
    }

    if (node.kind) {
        visitor(node as Node);
    }

    for (const key in node) {
        if (node.hasOwnProperty(key)) {
            const value = node[key];

            if (Array.isArray(value)) {
                value.forEach((item) => traverseNode(item, visitor));
            } else if (typeof value === 'object' && value !== null) {
                traverseNode(value, visitor);
            }
        }
    }
}

export function parseFunctionDeclarations(
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionDeclarationInfo[] {
    const declarations: FunctionDeclarationInfo[] = [];

    try {
        const text = document.getText();
        const parser = new Engine({
            parser: {
                extractDoc: false,
                php7: true,
                php8: true,
            },
            ast: {
                withPositions: true,
            },
        });

        let ast: Program;
        try {
            ast = parser.parseCode(text, 'document.php');
        } catch {
            return declarations;
        }

        traverseNode(ast, (node: Node) => {
            if (node.kind === 'function' || node.kind === 'method') {
                const funcNode = node as Function | Method;
                const declInfo = extractFunctionDeclarationInfo(funcNode, document, range);
                if (declInfo) {
                    declarations.push(declInfo);
                }
            }
        });
    } catch {
        return declarations;
    }

    return declarations;
}

function extractFunctionDeclarationInfo(
    node: Function | Method,
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionDeclarationInfo | null {
    if (!node.loc || !node.name) {
        return null;
    }

    const funcPosition = new vscode.Position(node.loc.start.line - 1, node.loc.start.column);
    if (!range.contains(funcPosition)) {
        return null;
    }

    const name = typeof node.name === 'string' ? node.name : node.name.name;
    const hasReturnType = node.type !== null && node.type !== undefined;

    const namePosition =
        typeof node.name === 'object' && node.name.loc
            ? new vscode.Position(node.name.loc.start.line - 1, node.name.loc.start.column)
            : funcPosition;

    const returnTypePosition = findReturnTypePosition(node, document);

    return {
        name,
        namePosition,
        returnTypePosition,
        hasReturnType,
    };
}

function findReturnTypePosition(
    node: Function | Method,
    document: vscode.TextDocument
): vscode.Position {
    if (!node.loc) {
        return new vscode.Position(0, 0);
    }

    const startLine = node.loc.start.line - 1;
    const startCol = node.loc.start.column;

    const bodyStart = node.body?.loc?.start;
    const endLine = bodyStart ? bodyStart.line - 1 : node.loc.end.line - 1;
    const endCol = bodyStart ? bodyStart.column : node.loc.end.column;

    const searchRange = new vscode.Range(
        new vscode.Position(startLine, startCol),
        new vscode.Position(endLine, endCol)
    );
    const searchText = document.getText(searchRange);

    const parenIndex = searchText.lastIndexOf(')');
    if (parenIndex === -1) {
        return new vscode.Position(startLine, startCol);
    }

    const textBeforeParen = searchText.substring(0, parenIndex + 1);
    const lines = textBeforeParen.split('\n');
    const lineOffset = lines.length - 1;

    if (lineOffset === 0) {
        return new vscode.Position(startLine, startCol + parenIndex + 1);
    } else {
        return new vscode.Position(startLine + lineOffset, lines[lines.length - 1].length);
    }
}
