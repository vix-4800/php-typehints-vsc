import * as vscode from 'vscode';
import { Engine, Node, Program, Call, New, Identifier, Variable } from 'php-parser';

/**
 * Information about a function call argument
 */
export interface ArgumentInfo {
    position: vscode.Position;
    text: string;
    isNamed: boolean;
}

/**
 * Information about a function call
 */
export interface FunctionCallInfo {
    position: vscode.Position; // Position for signature help (inside parentheses)
    arguments: ArgumentInfo[];
}

/**
 * Parse PHP document to find function calls and their arguments
 */
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

        // Parse the PHP code
        let ast: Program;
        try {
            ast = parser.parseCode(text, 'document.php');
        } catch (parseError) {
            console.error('PHP parse error:', parseError);
            return calls;
        }

        // Traverse AST to find function calls
        traverseNode(ast, (node: Node) => {
            // Handle function calls and method calls
            if (node.kind === 'call') {
                const callNode = node as Call;
                const callInfo = extractCallInfo(callNode, document, range);
                if (callInfo) {
                    calls.push(callInfo);
                }
            }
            // Handle 'new' expressions (constructor calls)
            else if (node.kind === 'new') {
                const newNode = node as New;
                const callInfo = extractNewInfo(newNode, document, range);
                if (callInfo) {
                    calls.push(callInfo);
                }
            }
        });
    } catch (error) {
        console.error('Error parsing PHP document:', error);
    }

    return calls;
}

/**
 * Extract call information from a Call node
 */
function extractCallInfo(
    node: Call,
    document: vscode.TextDocument,
    range: vscode.Range
): FunctionCallInfo | null {
    if (!node.loc || !node.arguments) {
        return null;
    }

    // Check if the call is within the requested range
    const callPosition = new vscode.Position(node.loc.start.line - 1, node.loc.start.column);

    if (!range.contains(callPosition)) {
        return null;
    }

    // Find the position of the opening parenthesis
    // We need to search for '(' after the function name
    const signatureHelpPosition = findOpeningParenPosition(node, document);
    if (!signatureHelpPosition) {
        return null;
    }

    const args: ArgumentInfo[] = [];

    // Extract argument information
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

/**
 * Extract call information from a New node (constructor)
 */
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

    // Find the position of the opening parenthesis for constructor
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

/**
 * Find the position right after the opening parenthesis of a function/constructor call
 */
function findOpeningParenPosition(
    node: Call | New,
    document: vscode.TextDocument
): vscode.Position | null {
    if (!node.loc) {
        return null;
    }

    // Get the text from the start of the node to a reasonable length
    const startLine = node.loc.start.line - 1;
    const startCol = node.loc.start.column;
    const endLine = node.loc.end.line - 1;
    const endCol = node.loc.end.column;

    // Get the entire call text
    const nodeRange = new vscode.Range(
        new vscode.Position(startLine, startCol),
        new vscode.Position(endLine, endCol)
    );
    const nodeText = document.getText(nodeRange);

    // Find the first opening parenthesis
    const parenIndex = nodeText.indexOf('(');
    if (parenIndex === -1) {
        return null;
    }

    // Calculate the position right after the '('
    // Count newlines before the paren to find the correct line
    const textBeforeParen = nodeText.substring(0, parenIndex);
    const lines = textBeforeParen.split('\n');
    const lineOffset = lines.length - 1;

    let finalLine: number;
    let finalCol: number;

    if (lineOffset === 0) {
        // Same line
        finalLine = startLine;
        finalCol = startCol + parenIndex + 1; // +1 to be after '('
    } else {
        // Different line
        finalLine = startLine + lineOffset;
        finalCol = lines[lines.length - 1].length + 1; // +1 to be after '('
    }

    return new vscode.Position(finalLine, finalCol);
}

/**
 * Extract information about a single argument
 */
function extractArgumentInfo(arg: any, document: vscode.TextDocument): ArgumentInfo | null {
    if (!arg.loc) {
        return null;
    }

    // Check if this is a named argument (PHP 8.0+)
    const isNamed = arg.name !== undefined && arg.name !== null;

    // Get the position where the hint should be placed (before the argument value)
    const position = new vscode.Position(arg.loc.start.line - 1, arg.loc.start.column);

    // Extract argument text
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

/**
 * Traverse AST and call visitor for each node
 */
function traverseNode(node: any, visitor: (node: Node) => void): void {
    if (!node || typeof node !== 'object') {
        return;
    }

    // Call visitor for current node
    if (node.kind) {
        visitor(node as Node);
    }

    // Recursively traverse children
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
