<?php

/**
 * Test fixture specifically for return type hints
 */

// ============================================================================
// BASIC RETURN TYPES
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
// UNION TYPES (PHP 8.0+)
// ============================================================================

// Expected: : int|float
function getNumber2(): int|float {
    return 42;
}

// Expected: : string|null
function getName(): string|null {
    return "John";
}

// Expected: : array|false
function getData(): array|false {
    return [];
}

// ============================================================================
// SPECIAL TYPES
// ============================================================================

// Expected: : self
class Builder {
    public function build(): self {
        return $this;
    }
}

// Expected: : static
class Factory {
    public static function create(): static {
        return new static();
    }
}

// Expected: : mixed
function getAny(): mixed {
    return 123;
}

// Expected: : never
function fail(): never {
    throw new Exception("Error");
}

// ============================================================================
// ARROW FUNCTIONS (PHP 7.4+)
// ============================================================================

// Expected: : int
$double = fn(int $x): int => $x * 2;

// Expected: : string
$format = fn(string $name): string => "Hello, $name";

// ============================================================================
// CLASS METHODS WITH RETURN TYPES
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
    public function reset(): self {
        return $this;
    }

    // Expected: : static
    public static function instance(): static {
        return new static();
    }
}

// ============================================================================
// ANONYMOUS FUNCTIONS
// ============================================================================

// Expected: : int
$sum = function(int $a, int $b): int {
    return $a + $b;
};

// Expected: : void
$log = function(string $msg): void {
    echo $msg;
};

// ============================================================================
// NO RETURN TYPE - NO HINT EXPECTED
// ============================================================================

function noReturnType($value) {
    return $value;
}

function alsoNoReturnType(string $name) {
    echo $name;
}
