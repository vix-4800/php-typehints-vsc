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

    if (type.includes('|')) {
        const parts = type.split('|').map(part => normalizeSingleType(part.trim()));
        const uniqueParts = [...new Set(parts.filter(p => p))];
        return uniqueParts.join('|');
    }

    return normalizeSingleType(type);
}

function normalizeSingleType(type: string): string {
    type = type.trim();

    if (type === '$this') {
        return 'static';
    }

    if (type.match(/\[\]$/)) {
        return 'array';
    }

    if (type.match(/^array<.+>$/i)) {
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
});
