<?php

/**
 * Return Type Hints
 *
 * Tests inlay hints for function return types when type is NOT declared
 * but can be inferred from PHPDoc or return statements
 */

// ============================================================================
// PHPDoc RETURN TYPES (Most reliable)
// ============================================================================

/**
 * @return string
 */
function getStringFromDoc() {
    return "hello";
}

/**
 * @return int
 */
function getIntFromDoc() {
    return 42;
}

/**
 * @return float
 */
function getFloatFromDoc() {
    return 3.14;
}

/**
 * @return bool
 */
function getBoolFromDoc() {
    return true;
}

/**
 * @return array
 */
function getArrayFromDoc() {
    return [];
}

/**
 * Gets a user by ID
 * @param int $id User ID
 * @return User|null
 */
function findUserFromDoc($id) {
    return $id > 0 ? new User("John") : null;
}

/**
 * @return string[]
 */
function getStringArrayFromDoc() {
    return ["a", "b", "c"];
}
// Expected hint: : array (normalized from string[])

/**
 * @return array<string, int>
 */
function getMapFromDoc() {
    return ["a" => 1, "b" => 2];
}
// Expected hint: : array (normalized from array<string, int>)

// ============================================================================
// INFERRED FROM RETURN STATEMENTS (Simple literals)
// ============================================================================

// Expected hint: : string (inferred from string literal)
function getString() {
    return "hello";
}

// Expected hint: : int (inferred from integer literal)
function getNumber() {
    return 42;
}

// Expected hint: : float (inferred from float literal)
function getFloat() {
    return 3.14;
}

// Expected hint: : bool (inferred from boolean literal)
function getBoolTrue() {
    return true;
}

// Expected hint: : bool (inferred from boolean literal)
function getBoolFalse() {
    return false;
}

// Expected hint: : array (inferred from array literal)
function getEmptyArray() {
    return [];
}

// Expected hint: : array (inferred from array literal)
function getFilledArray() {
    return [1, 2, 3];
}

// Expected hint: : null (inferred from null literal)
function getNull() {
    return null;
}

// ============================================================================
// CLASS METHODS WITHOUT RETURN TYPE
// ============================================================================

class Calculator {
    /**
     * @return int
     */
    public function add($a, $b) {
        return $a + $b;
    }

    /**
     * @return float
     */
    public function divide($a, $b) {
        return $a / $b;
    }

    // Inferred from literal
    public function getDefaultValue() {
        return 0;
    }

    /**
     * @return self
     */
    public function instance() {
        return $this;
    }

    /**
     * @return static
     */
    public static function create() {
        return new static();
    }
}

// ============================================================================
// CLOSURES AND ARROW FUNCTIONS WITHOUT RETURN TYPE
// ============================================================================

// PHPDoc before closure
/** @return int */
$double = function($x) {
    return $x * 2;
};

// Inferred from literal
$greet = function($name) {
    return "Hello, " . $name;
};

// Arrow function - inferred from literal
$isPositive = fn($n) => $n > 0;

// ============================================================================
// EDGE CASES
// ============================================================================

// Returns variable - shows : mixed
function noReturnType($value) {
    return $value;
}

// Returns expression result - shows : mixed
function addNumbers($a, $b) {
    return $a + $b;
}

// Multiple return types - shows : mixed
function maybeString($flag) {
    if ($flag) {
        return "yes";
    }
    return null;
}

// Already has return type - no hint needed
function alreadyTyped(): string {
    return "typed";
}

// No return statement - shows : void
function implicitVoid() {
    echo "side effect";
}

// ============================================================================
// COMPLEX PHPDoc TYPES
// ============================================================================

/**
 * @return \Generator<int, string>
 */
function generateStrings() {
    yield "a";
    yield "b";
}
// Expected hint: : Generator (normalized from Generator<int, string>)

/**
 * @return callable(int): string
 */
function getFormatter() {
    return fn($n) => (string)$n;
}
// Expected hint: : callable (normalized from callable(int): string)

/**
 * @return array{name: string, age: int}
 */
function getPerson() {
    return ["name" => "John", "age" => 30];
}
// Expected hint: : array (normalized from array shape)

/**
 * @return class-string<User>
 */
function getUserClass() {
    return User::class;
}
// Expected hint: : class-string (generic parameter removed)

/**
 * @return string[]
 */
function getNames() {
    return ["Alice", "Bob"];
}
// Expected hint: : array (normalized from string[])

/**
 * @return array<string>|null
 */
function maybeGetArray() {
    return null;
}
// Expected hint: : array|null (normalized from array<string>|null)

/**
 * @return integer
 */
function getInteger() {
    return 42;
}

// ============================================================================
// HELPER CLASS
// ============================================================================

class User {
    public function __construct(public string $name) {}
}
