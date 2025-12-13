<?php

/**
 * Nested and Complex Call Patterns
 *
 * Tests for deeply nested calls, complex expressions, and edge cases
 */

// ============================================================================
// DEEPLY NESTED FUNCTION CALLS
// ============================================================================

// Expected hints on all levels:
// strlen(trim(strtoupper($value)))
$length = strlen(trim(strtoupper($value)));

// Expected: sprintf(format: "Length: %d", values: strlen(trim($text)))
$message = sprintf("Length: %d", strlen(trim($text)));

// Expected: array_map, array_filter nested
$result = array_map(
    fn($x) => $x * 2,
    array_filter($numbers, fn($n) => $n > 0)
);

// ============================================================================
// FUNCTION CALLS IN ARRAY KEYS AND VALUES
// ============================================================================

// Expected hints inside array
$data = [
    'name' => strtoupper($name),
    'length' => strlen($text),
    strtolower($key) => getValue($id),
];

// ============================================================================
// FUNCTION CALLS IN TERNARY OPERATORS
// ============================================================================

// Expected: strlen(string: ...), substr(string: ...)
$value = $condition
    ? strlen($text)
    : substr($text, 0, 10);

// ============================================================================
// FUNCTION CALLS IN NULL COALESCING
// ============================================================================

// Expected: getValue(key: 'default'), trim(string: ...)
$result = getValue('default') ?? trim($fallback);

// ============================================================================
// FUNCTION CALLS IN MATCH EXPRESSIONS
// ============================================================================

// Expected hints in each case
$output = match($type) {
    'uppercase' => strtoupper($text),
    'lowercase' => strtolower($text),
    'capitalize' => ucfirst($text),
    default => trim($text),
};

// ============================================================================
// FUNCTION CALLS IN STRING INTERPOLATION
// ============================================================================

function format(string $template): string {
    return $template;
}

// Expected: format(template: "User: {$name}")
$formatted = format("User: {$name}");

// No hints expected inside interpolation (complex to parse)
$text = "Length: " . strlen($value);

// ============================================================================
// METHOD CALLS ON RETURN VALUES
// ============================================================================

class Factory {
    public static function create(): Builder {
        return new Builder();
    }
}

class Builder {
    public function build(string $name, array $options = []): object {
        return (object)[];
    }
}

// Expected: create(), build(name: "widget", options: [...])
$object = Factory::create()->build("widget", ['color' => 'red']);

// ============================================================================
// CHAINED CALLS WITH DIFFERENT ARGUMENT COUNTS
// ============================================================================

class FluentApi {
    public function method1(): self { return $this; }
    public function method2(string $arg): self { return $this; }
    public function method3(string $a, string $b, string $c): self { return $this; }
    public function execute(): mixed { return null; }
}

$api = new FluentApi();

// Expected hints on method2 and method3
$result = $api
    ->method1()
    ->method2("test")
    ->method3("a", "b", "c")
    ->execute();

// ============================================================================
// FUNCTION CALLS IN THROW STATEMENTS
// ============================================================================

function createException(string $message, int $code = 0): \Exception {
    return new \Exception($message, $code);
}

// Expected: createException(message: "Error", code: 500)
// throw createException("Error", 500);

// ============================================================================
// FUNCTION CALLS IN RETURN STATEMENTS
// ============================================================================

function processAndReturn(string $data): string {
    // Expected: trim(string: strtoupper(string: $data))
    return trim(strtoupper($data));
}

// ============================================================================
// FUNCTION CALLS AS DEFAULT PARAMETER VALUES
// ============================================================================

const DEFAULT_VALUE = "default";

// Cannot have function calls in default values, but constants are OK
function test(string $value = DEFAULT_VALUE): void {
    // ...
}

// ============================================================================
// VARIADIC ARGUMENTS WITH SPREAD OPERATOR
// ============================================================================

function sum(int ...$numbers): int {
    return array_sum($numbers);
}

$nums = [1, 2, 3, 4, 5];

// Expected: sum(numbers: ...$nums)
$total = sum(...$nums);

// Expected: sum(numbers: 1, numbers: 2, numbers: 3)
$total2 = sum(1, 2, 3);

// ============================================================================
// COMPLEX OBJECT INSTANTIATION
// ============================================================================

class Service {
    public function __construct(
        private Logger $logger,
        private Config $config,
        private array $options = []
    ) {}
}

class Logger {
    public function __construct(public string $path) {}
}

class Config {
    public function __construct(public string $env) {}
}

// Expected hints on all constructors
$service = new Service(
    new Logger("/var/log/app.log"),
    new Config("production"),
    ['debug' => false]
);

// ============================================================================
// FUNCTION CALLS IN LOGICAL EXPRESSIONS
// ============================================================================

// Expected hints on strlen
if (strlen($username) > 5 && strlen($password) > 8) {
    // ...
}

// Expected hints on in_array
while (in_array($value, $array, true)) {
    // ...
}

// ============================================================================
// FUNCTION CALLS IN SWITCH CASES
// ============================================================================

function getValueType(mixed $value): string {
    return gettype($value);
}

// Expected: getValueType(value: $data)
switch (getValueType($data)) {
    case 'string':
        break;
    case 'integer':
        break;
}

// ============================================================================
// CALLBACKS WITH DIFFERENT SIGNATURES
// ============================================================================

function processCallback(callable $fn): void {
    $fn();
}

// Various callback formats

// Expected: processCallback(fn: function...)
processCallback(function() {
    echo "closure";
});

// Expected: processCallback(fn: fn...)
processCallback(fn() => "arrow");

// Expected: processCallback(fn: 'strlen')
processCallback('strlen');

// Expected: processCallback(fn: [$obj, 'method'])
processCallback([$obj, 'method']);

// Expected: processCallback(fn: [ClassName::class, 'staticMethod'])
processCallback([ClassName::class, 'staticMethod']);

// ============================================================================
// MULTILEVEL ARRAY ACCESS IN ARGUMENTS
// ============================================================================

function process(mixed $value): void {
    // ...
}

// Expected: process(value: $array['key']['nested'][0])
process($array['key']['nested'][0]);

// ============================================================================
// FUNCTION CALLS WITH BINARY OPERATIONS AS ARGUMENTS
// ============================================================================

function compare(bool $result, string $message = ""): void {
    // ...
}

// Expected: compare(result: $a > $b, message: "Comparison")
compare($a > $b, "Comparison");

// Expected: compare(result: strlen(string: $x) === strlen(string: $y))
compare(strlen($x) === strlen($y));

// ============================================================================
// HELPER CLASSES FOR TESTS
// ============================================================================

class ClassName {
    public static function staticMethod(): void {}
    public function method(): void {}
}

function getValue(int $id): mixed {
    return null;
}
