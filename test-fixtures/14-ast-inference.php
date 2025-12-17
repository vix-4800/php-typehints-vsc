<?php

/**
 * AST-based Return Type Inference Tests
 *
 * Tests return type inference from analyzing return statements
 * when LSP doesn't provide type information (e.g., in closures passed as arguments)
 */

// ============================================================================
// SIMPLE RETURN STATEMENTS
// ============================================================================

function returnsArray() {
    return [1, 2, 3];
}
// Expected hint: : array

function returnsString() {
    return "hello";
}
// Expected hint: : string

function returnsInt() {
    return 42;
}
// Expected hint: : int

function returnsFloat() {
    return 3.14;
}
// Expected hint: : float

function returnsBool() {
    return true;
}
// Expected hint: : bool

function returnsNull() {
    return null;
}
// Expected hint: : null

function returnsVoid() {
    echo "side effect";
}
// Expected hint: : void

// ============================================================================
// CLOSURES IN ARGUMENTS (Main use case)
// ============================================================================

$result = array_map(
    function ($item) {
        return $item * 2;
    },
    [1, 2, 3]
);
// Expected hint on closure: : int

$filtered = array_filter(
    $items,
    static function ($value) {
        return $value > 0;
    }
);
// Expected hint on closure: : bool

$transformed = array_map(
    fn($x) => $x * 2,
    [1, 2, 3]
);
// Expected hint on arrow function: : int

ArrayHelper::getColumn(
    $company_accounts,
    static function ($model) {
        return [
            'id' => $model->id,
            'name' => $model->tableTitle()
        ];
    }
);
// Expected hint on closure: : array

// ============================================================================
// NULLABLE TYPES
// ============================================================================

function maybeReturnsString($flag) {
    if ($flag) {
        return "yes";
    }
    return null;
}
// Expected hint: : string|null

function maybeReturnsArray($condition) {
    if ($condition) {
        return [1, 2, 3];
    }
    return null;
}
// Expected hint: : array|null

// ============================================================================
// OBJECT INSTANTIATION
// ============================================================================

class User {
    public function __construct(public string $name) {}
}

function createUser() {
    return new User("John");
}
// Expected hint: : User

$factory = function () {
    return new User("Jane");
};
// Expected hint: : User

// ============================================================================
// $this RETURNS
// ============================================================================

class Builder {
    public function build() {
        return $this;
    }
    // Expected hint: : static
}

// ============================================================================
// COMPLEX EXPRESSIONS
// ============================================================================

function concatenateStrings() {
    return "hello" . " " . "world";
}
// Expected hint: : string

function addNumbers() {
    return 1 + 2;
}
// Expected hint: : int

function addFloats() {
    return 1.5 + 2.3;
}
// Expected hint: : float

// ============================================================================
// MULTIPLE RETURNS WITH SAME TYPE
// ============================================================================

function multipleArrayReturns($flag) {
    if ($flag) {
        return [1, 2];
    }
    return [3, 4];
}
// Expected hint: : array

function multipleStringReturns($type) {
    switch ($type) {
        case 1:
            return "one";
        case 2:
            return "two";
        default:
            return "other";
    }
}
// Expected hint: : string

// ============================================================================
// TERNARY OPERATOR
// ============================================================================

function ternaryReturn($flag) {
    return $flag ? "yes" : "no";
}
// Expected hint: : string

function ternaryWithNull($value) {
    return $value ? [1, 2, 3] : null;
}
// Expected hint: : array|null

// ============================================================================
// CASES THAT SHOULD NOT SHOW HINTS
// ============================================================================

// Variable return - type unknown
function returnsVariable($value) {
    return $value;
}
// Expected: no hint (type unknown)

// Method call return - type unknown without LSP
function returnsMethodCall($obj) {
    return $obj->getValue();
}
// Expected: no hint (type unknown)

// Function call return - type unknown without LSP
function returnsFunctionCall() {
    return someFunction();
}
// Expected: no hint (type unknown)

// Mixed types (not simple union)
function mixedTypes($type) {
    if ($type === 'array') {
        return [1, 2];
    }
    if ($type === 'string') {
        return "text";
    }
    return 42;
}
// Expected: no hint (complex union: array|string|int - too risky to show)
