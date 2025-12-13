<?php

/**
 * Return Type Hints
 *
 * Tests inlay hints for function return types
 */

// ============================================================================
// BASIC SCALAR RETURN TYPES
// ============================================================================

// Expected: : void
function doNothing(): void {
    // nothing
}

// Expected: : string
function getString(): string {
    return "hello";
}

// Expected: : int
function getNumber(): int {
    return 42;
}

// Expected: : float
function getFloat(): float {
    return 3.14;
}

// Expected: : bool
function getBool(): bool {
    return true;
}

// Expected: : array
function getArray(): array {
    return [];
}

// Expected: : object
function getObject(): object {
    return new stdClass();
}

// ============================================================================
// NULLABLE TYPES
// ============================================================================

// Expected: : ?string
function getNullableString(): ?string {
    return null;
}

// Expected: : ?int
function getNullableInt(): ?int {
    return null;
}

// Expected: : ?User
function findUser(int $id): ?User {
    return $id > 0 ? new User("John") : null;
}

// Alternative nullable syntax (PHP 8.0+)
// Expected: : string|null
function getName(): string|null {
    return "John";
}

// ============================================================================
// CLASS/INTERFACE TYPES
// ============================================================================

class User {
    public function __construct(public string $name) {}
}

interface Repository {}

// Expected: : User
function getUser(): User {
    return new User("John");
}

// Expected: : Repository
function getRepository(): Repository {
    return new class implements Repository {};
}

// ============================================================================
// SELF/STATIC/PARENT TYPES
// ============================================================================

class Builder {
    // Expected: : self
    public function build(): self {
        return $this;
    }

    // Expected: : self
    public function reset(): self {
        return $this;
    }
}

class Factory {
    // Expected: : static
    public static function create(): static {
        return new static();
    }

    // Expected: : static
    public static function instance(): static {
        return new static();
    }
}

// ============================================================================
// UNION TYPES (PHP 8.0+)
// ============================================================================

// Expected: : int|float
function getNumeric(): int|float {
    return 42;
}

// Expected: : string|int
function getId(bool $asString): string|int {
    return $asString ? "123" : 123;
}

// Expected: : array|false
function getData(): array|false {
    return [];
}

// Expected: : int|string|bool
function getValue(): int|string|bool {
    return true;
}

// ============================================================================
// MIXED TYPE (PHP 8.0+)
// ============================================================================

// Expected: : mixed
function getAny(): mixed {
    return 123;
}

// Expected: : mixed
function processValue(string $key): mixed {
    return $_SESSION[$key] ?? null;
}

// ============================================================================
// NEVER TYPE (PHP 8.1+)
// ============================================================================

// Expected: : never
function fail(): never {
    throw new Exception("Error");
}

// Expected: : never
function terminate(string $message): never {
    die($message);
}

// ============================================================================
// ARROW FUNCTIONS (PHP 7.4+)
// ============================================================================

// Expected: : int
$double = fn(int $x): int => $x * 2;

// Expected: : string
$format = fn(string $name): string => "Hello, $name";

// Expected: : bool
$isPositive = fn(int $n): bool => $n > 0;

// ============================================================================
// CLOSURES/ANONYMOUS FUNCTIONS
// ============================================================================

// Expected: : int
$sum = function(int $a, int $b): int {
    return $a + $b;
};

// Expected: : void
$log = function(string $msg): void {
    echo $msg;
};

// Expected: : ?string
$find = function(array $items, string $key): ?string {
    return $items[$key] ?? null;
};

// ============================================================================
// CLASS METHODS
// ============================================================================

class Calculator {
    // Expected: : int
    public function add(int $a, int $b): int {
        return $a + $b;
    }

    // Expected: : float
    public function divide(float $a, float $b): float {
        return $a / $b;
    }

    // Expected: : self
    public function instance(): self {
        return $this;
    }

    // Expected: : static
    public static function create(): static {
        return new static();
    }
}

// ============================================================================
// GENERATOR FUNCTIONS
// ============================================================================

// Expected: : \Generator
function generateNumbers(int $start, int $end): \Generator {
    for ($i = $start; $i <= $end; $i++) {
        yield $i;
    }
}

// ============================================================================
// NO RETURN TYPE - NO HINT EXPECTED
// ============================================================================

function noReturnType($value) {
    return $value;
}

function alsoNoReturnType(string $name) {
    echo $name;
}

function implicitVoid() {
    // no return statement
}
