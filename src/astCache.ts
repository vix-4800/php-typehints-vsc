import * as vscode from 'vscode';
import { Engine, Program } from 'php-parser';

interface CacheEntry {
    ast: Program;
    version: number;
}

/**
 * Simple LRU cache for parsed PHP ASTs
 * Caches by document URI + version to avoid re-parsing unchanged documents
 */
export class AstCache {
    private cache = new Map<string, CacheEntry>();
    private maxSize: number;
    private parser: Engine;

    constructor(maxSize = 50) {
        this.maxSize = maxSize;
        this.parser = new Engine({
            parser: {
                extractDoc: false,
                php7: true,
                php8: true,
            },
            ast: {
                withPositions: true,
            },
        });
    }

    /**
     * Get or parse AST for a document
     * Returns null if parsing fails
     */
    getAst(document: vscode.TextDocument): Program | null {
        const key = document.uri.toString();
        const cached = this.cache.get(key);

        if (cached && cached.version === document.version) {
            return cached.ast;
        }

        try {
            const text = document.getText();
            const ast = this.parser.parseCode(text, document.fileName || 'document.php');

            this.cache.set(key, {
                ast,
                version: document.version,
            });

            if (this.cache.size > this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }

            return ast;
        } catch {
            return null;
        }
    }

    /**
     * Clear cache entry for a document
     */
    invalidate(uri: vscode.Uri): void {
        this.cache.delete(uri.toString());
    }

    /**
     * Clear all cached entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get current cache size
     */
    get size(): number {
        return this.cache.size;
    }
}
