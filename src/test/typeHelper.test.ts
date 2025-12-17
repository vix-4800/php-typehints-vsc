import * as assert from 'assert';

/**
 * Test version of normalizePhpReturnType for unit testing
 * This mirrors the implementation in typeHelper.ts
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

suite('Type normalization for PHP return types', () => {
    suite('Array notations', () => {
        test('Should convert Type[] to array', () => {
            assert.strictEqual(normalizePhpReturnType('string[]'), 'array');
            assert.strictEqual(normalizePhpReturnType('int[]'), 'array');
            assert.strictEqual(normalizePhpReturnType('User[]'), 'array');
            assert.strictEqual(normalizePhpReturnType('Object[]'), 'array');
        });

        test('Should convert array<Type> to array', () => {
            assert.strictEqual(normalizePhpReturnType('array<string>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<int>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<User>'), 'array');
        });

        test('Should convert array<Key, Value> to array', () => {
            assert.strictEqual(normalizePhpReturnType('array<string, int>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<int, User>'), 'array');
        });

        test('Should convert list<Type> to array', () => {
            assert.strictEqual(normalizePhpReturnType('list<string>'), 'array');
            assert.strictEqual(normalizePhpReturnType('list<int>'), 'array');
        });

        test('Should convert non-empty-array to array', () => {
            assert.strictEqual(normalizePhpReturnType('non-empty-array'), 'array');
            assert.strictEqual(normalizePhpReturnType('non-empty-array<string>'), 'array');
        });

        test('Should convert array shapes to array', () => {
            assert.strictEqual(normalizePhpReturnType('array{name: string, age: int}'), 'array');
            assert.strictEqual(normalizePhpReturnType('array{0: string, 1: int}'), 'array');
            assert.strictEqual(normalizePhpReturnType('array{title: string|null, body: string}'), 'array');
            assert.strictEqual(normalizePhpReturnType('array{title: string|null, body: string, icon: string, type: TypeEnum, link: string|null}'), 'array');
        });

        test('Should convert nested array types to array', () => {
            assert.strictEqual(normalizePhpReturnType('array<array<string>>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<array<int, string>>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<array<string, array|bool|string>>'), 'array');
            assert.strictEqual(normalizePhpReturnType('array<string, array<int>>'), 'array');
        });
    });

    suite('Generic types', () => {
        test('Should remove generic parameters from classes', () => {
            assert.strictEqual(normalizePhpReturnType('Collection<User>'), 'Collection');
            assert.strictEqual(normalizePhpReturnType('Iterator<string>'), 'Iterator');
            assert.strictEqual(normalizePhpReturnType('Generator<int, string, mixed, void>'), 'Generator');
        });

        test('Should handle namespaced generic classes', () => {
            assert.strictEqual(normalizePhpReturnType('Illuminate\\Support\\Collection<User>'), 'Illuminate\\Support\\Collection');
        });
    });

    suite('Nullable types', () => {
        test('Should convert ?Type to Type|null', () => {
            assert.strictEqual(normalizePhpReturnType('?string'), 'string|null');
            assert.strictEqual(normalizePhpReturnType('?int'), 'int|null');
            assert.strictEqual(normalizePhpReturnType('?User'), 'User|null');
        });
    });

    suite('Union types', () => {
        test('Should normalize each part of union types', () => {
            assert.strictEqual(normalizePhpReturnType('string|int'), 'string|int');
            assert.strictEqual(normalizePhpReturnType('User|null'), 'User|null');
            assert.strictEqual(normalizePhpReturnType('string[]|null'), 'array|null');
            assert.strictEqual(normalizePhpReturnType('Collection<User>|array'), 'Collection|array');
        });

        test('Should remove duplicates in union types', () => {
            assert.strictEqual(normalizePhpReturnType('array|array'), 'array');
            assert.strictEqual(normalizePhpReturnType('string[]|int[]'), 'array');
        });

        test('Should handle complex union types', () => {
            assert.strictEqual(normalizePhpReturnType('string[]|int[]|null'), 'array|null');
            assert.strictEqual(normalizePhpReturnType('Collection<User>|Collection<Post>|null'), 'Collection|null');
        });
    });

    suite('Callable types', () => {
        test('Should normalize callable with parameters', () => {
            assert.strictEqual(normalizePhpReturnType('callable(string): int'), 'callable');
            assert.strictEqual(normalizePhpReturnType('callable(int, string): void'), 'callable');
        });

        test('Should normalize Closure with parameters', () => {
            assert.strictEqual(normalizePhpReturnType('Closure(string): int'), 'Closure');
            assert.strictEqual(normalizePhpReturnType('Closure(User): void'), 'Closure');
        });
    });

    suite('Valid PHP types should be preserved', () => {
        test('Should keep scalar types as-is', () => {
            assert.strictEqual(normalizePhpReturnType('int'), 'int');
            assert.strictEqual(normalizePhpReturnType('float'), 'float');
            assert.strictEqual(normalizePhpReturnType('string'), 'string');
            assert.strictEqual(normalizePhpReturnType('bool'), 'bool');
            assert.strictEqual(normalizePhpReturnType('true'), 'true');
            assert.strictEqual(normalizePhpReturnType('false'), 'false');
        });

        test('Should keep compound types as-is', () => {
            assert.strictEqual(normalizePhpReturnType('array'), 'array');
            assert.strictEqual(normalizePhpReturnType('object'), 'object');
            assert.strictEqual(normalizePhpReturnType('callable'), 'callable');
            assert.strictEqual(normalizePhpReturnType('iterable'), 'iterable');
        });

        test('Should keep special types as-is', () => {
            assert.strictEqual(normalizePhpReturnType('void'), 'void');
            assert.strictEqual(normalizePhpReturnType('mixed'), 'mixed');
            assert.strictEqual(normalizePhpReturnType('never'), 'never');
            assert.strictEqual(normalizePhpReturnType('null'), 'null');
            assert.strictEqual(normalizePhpReturnType('self'), 'self');
            assert.strictEqual(normalizePhpReturnType('parent'), 'parent');
            assert.strictEqual(normalizePhpReturnType('static'), 'static');
        });

        test('Should keep class names as-is', () => {
            assert.strictEqual(normalizePhpReturnType('User'), 'User');
            assert.strictEqual(normalizePhpReturnType('DateTime'), 'DateTime');
            assert.strictEqual(normalizePhpReturnType('stdClass'), 'stdClass');
        });

        test('Should keep namespaced class names as-is', () => {
            assert.strictEqual(normalizePhpReturnType('App\\Models\\User'), 'App\\Models\\User');
            assert.strictEqual(normalizePhpReturnType('Illuminate\\Support\\Collection'), 'Illuminate\\Support\\Collection');
        });
    });

    suite('Edge cases', () => {
        test('Should handle empty or whitespace', () => {
            assert.strictEqual(normalizePhpReturnType(''), '');
            assert.strictEqual(normalizePhpReturnType('   '), '');
        });

        test('Should handle nested generic types', () => {
            assert.strictEqual(normalizePhpReturnType('Collection<array<string>>'), 'Collection');
        });

        test('Should handle union with multiple array notations', () => {
            assert.strictEqual(normalizePhpReturnType('string[]|array<int>|list<bool>'), 'array');
        });

        test('Should handle types with extra whitespace', () => {
            assert.strictEqual(normalizePhpReturnType('  string  '), 'string');
            assert.strictEqual(normalizePhpReturnType('string | int'), 'string|int');
        });

        test('Should handle deeply nested generics', () => {
            assert.strictEqual(normalizePhpReturnType('Collection<Collection<Collection<User>>>'), 'Collection');
            assert.strictEqual(normalizePhpReturnType('array<array<array<string>>>'), 'array');
        });

        test('Should handle mixed case in array types', () => {
            assert.strictEqual(normalizePhpReturnType('Array<String>'), 'array');
            assert.strictEqual(normalizePhpReturnType('LIST<int>'), 'array');
            assert.strictEqual(normalizePhpReturnType('Non-Empty-Array<string>'), 'array');
        });

        test('Should handle intersection types in union (treated as-is for now)', () => {
            // PHP 8.1+ supports intersection types with &, but they're rare in return types
            assert.strictEqual(normalizePhpReturnType('Countable&Iterator'), 'Countable&Iterator');
            assert.strictEqual(normalizePhpReturnType('(Countable&Iterator)|null'), '(Countable&Iterator)|null');
        });

        test('Should handle multiple consecutive pipes (malformed input)', () => {
            assert.strictEqual(normalizePhpReturnType('string||int'), 'string|int');
            assert.strictEqual(normalizePhpReturnType('array|||null'), 'array|null');
        });

        test('Should handle union with all parts being same after normalization', () => {
            assert.strictEqual(normalizePhpReturnType('string[]|int[]|bool[]'), 'array');
            assert.strictEqual(normalizePhpReturnType('Collection<User>|Collection<Post>'), 'Collection');
        });

        test('Should preserve union order and normalize each part', () => {
            assert.strictEqual(normalizePhpReturnType('User|string[]|null'), 'User|array|null');
            assert.strictEqual(normalizePhpReturnType('false|array<int>|true'), 'false|array|true');
        });

        test('Should handle callable with complex return type in signature', () => {
            assert.strictEqual(normalizePhpReturnType('callable(int): array<string>'), 'callable');
            assert.strictEqual(normalizePhpReturnType('Closure(User): Collection<Post>'), 'Closure');
        });

        test('Should handle array shapes with optional keys', () => {
            assert.strictEqual(normalizePhpReturnType('array{name: string, age?: int}'), 'array');
            assert.strictEqual(normalizePhpReturnType('array{0: string, 1?: int}'), 'array');
        });

        test('Should handle variadic parameters in callable', () => {
            assert.strictEqual(normalizePhpReturnType('callable(string, int...): void'), 'callable');
            assert.strictEqual(normalizePhpReturnType('Closure(User, string...): array'), 'Closure');
        });
    });

    suite('PHPStan/Psalm specific types', () => {
        test('Should normalize int variants to int', () => {
            assert.strictEqual(normalizePhpReturnType('positive-int'), 'int');
            assert.strictEqual(normalizePhpReturnType('negative-int'), 'int');
            assert.strictEqual(normalizePhpReturnType('non-positive-int'), 'int');
            assert.strictEqual(normalizePhpReturnType('non-negative-int'), 'int');
        });

        test('Should normalize string variants to string', () => {
            assert.strictEqual(normalizePhpReturnType('non-empty-string'), 'string');
            assert.strictEqual(normalizePhpReturnType('literal-string'), 'string');
            assert.strictEqual(normalizePhpReturnType('class-string'), 'string');
            assert.strictEqual(normalizePhpReturnType('callable-string'), 'string');
            assert.strictEqual(normalizePhpReturnType('numeric-string'), 'string');
        });

        test('Should normalize class-string<T> to string', () => {
            assert.strictEqual(normalizePhpReturnType('class-string<User>'), 'string');
            assert.strictEqual(normalizePhpReturnType('class-string<DateTime>'), 'string');
        });

        test('Should normalize $this to static', () => {
            assert.strictEqual(normalizePhpReturnType('$this'), 'static');
        });
    });

    suite('PHPDoc pattern extraction simulation', () => {
        /**
         * Simulate the full extraction pipeline
         */
        function extractTypeFromText(text: string): string | null {
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
                        return normalizePhpReturnType(returnType);
                    }
                }
            }
            return null;
        }

        test('Should extract simple types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return string'), 'string');
            assert.strictEqual(extractTypeFromText('@return int'), 'int');
            assert.strictEqual(extractTypeFromText('@return User'), 'User');
        });

        test('Should extract array types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return string[]'), 'array');
            assert.strictEqual(extractTypeFromText('@return array<string>'), 'array');
            assert.strictEqual(extractTypeFromText('@return list<int>'), 'array');
        });

        test('Should extract callable with signature from @return', () => {
            assert.strictEqual(extractTypeFromText('@return callable(int): string'), 'callable');
            assert.strictEqual(extractTypeFromText('@return callable(string, int): bool'), 'callable');
            assert.strictEqual(extractTypeFromText('@return Closure(User): string'), 'Closure');
        });

        test('Should extract return type from anonymous function signature', () => {
            assert.strictEqual(extractTypeFromText('function ($model): array'), 'array');
            assert.strictEqual(extractTypeFromText('static function ($model): array'), 'array');
        });

        test('Should extract return type from Closure/callable signature', () => {
            assert.strictEqual(extractTypeFromText('Closure($model): array'), 'array');
            assert.strictEqual(extractTypeFromText('callable($model): string'), 'string');
            assert.strictEqual(extractTypeFromText('\\Closure($model): int'), 'int');
        });

        test('Should extract from _@return_ with backticks', () => {
            assert.strictEqual(extractTypeFromText('_@return_ `callable(int): string`'), 'callable');
            assert.strictEqual(extractTypeFromText('_@return_ `Closure(User): string`'), 'Closure');
            assert.strictEqual(extractTypeFromText('_@return_ `string[]`'), 'array');
        });

        test('Should extract generic types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return Collection<User>'), 'Collection');
            assert.strictEqual(extractTypeFromText('@return Generator<int, string, mixed, void>'), 'Generator');
        });

        test('Should extract union types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return string|int'), 'string|int');
            assert.strictEqual(extractTypeFromText('@return User|null'), 'User|null');
            assert.strictEqual(extractTypeFromText('@return string[]|null'), 'array|null');
        });

        test('Should extract nullable types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return ?string'), 'string|null');
            assert.strictEqual(extractTypeFromText('@return ?User'), 'User|null');
        });

        test('Should extract PHPStan types from @return', () => {
            assert.strictEqual(extractTypeFromText('@return class-string<User>'), 'string');
            assert.strictEqual(extractTypeFromText('@return positive-int'), 'int');
            assert.strictEqual(extractTypeFromText('@return non-empty-string'), 'string');
        });

        test('Should handle @return with closing comment', () => {
            assert.strictEqual(extractTypeFromText('@return callable(int): string */'), 'callable');
            assert.strictEqual(extractTypeFromText('@return Collection<User> */'), 'Collection');
            assert.strictEqual(extractTypeFromText('@return string[] */'), 'array');
        });

        test('Should handle @return with newline', () => {
            assert.strictEqual(extractTypeFromText('@return callable(int): string\n'), 'callable');
            assert.strictEqual(extractTypeFromText('@return Closure(User): string\n * Description'), 'Closure');
        });

        test('Should handle multiline PHPDoc', () => {
            const multiline = `/**
 * @return callable(int): string
 */`;
            assert.strictEqual(extractTypeFromText(multiline), 'callable');
        });

        test('Should NOT match ) from callable signature with ): pattern', () => {
            // This ensures that /\)\s*:\s*([^\s{]+)/ doesn't incorrectly match
            // the ) in callable(int): and extract just "string"
            const result = extractTypeFromText('@return callable(int): string');
            assert.strictEqual(result, 'callable', 'Should extract callable, not string');
        });
    });
});
