<?php

/**
 * Advanced PHP Features
 *
 * Tests for attributes, readonly, first-class callables, and other modern features
 */

// ============================================================================
// READONLY PROPERTIES (PHP 8.1+)
// ============================================================================

class Point {
    public function __construct(
        public readonly float $x,
        public readonly float $y,
        public readonly float $z = 0.0
    ) {}
}

// Expected: new Point(x: 1.5, y: 2.5, z: 3.5)
$point = new Point(1.5, 2.5, 3.5);

// Expected: new Point(x: 10.0, y: 20.0)
$point2 = new Point(10.0, 20.0);

// ============================================================================
// READONLY CLASSES (PHP 8.2+)
// ============================================================================

readonly class Config {
    public function __construct(
        public string $host,
        public int $port,
        public bool $debug = false
    ) {}
}

// Expected: new Config(host: "localhost", port: 3306, debug: true)
$config = new Config("localhost", 3306, true);

// ============================================================================
// FIRST-CLASS CALLABLES (PHP 8.1+)
// ============================================================================

function transform(string $text): string {
    return strtoupper($text);
}

class StringHelper {
    public static function reverse(string $text): string {
        return strrev($text);
    }

    public function capitalize(string $text): string {
        return ucfirst($text);
    }
}

// Expected: array_map(callback: transform(...), array: $strings)
$result = array_map(transform(...), $strings);

// Expected: array_map(callback: StringHelper::reverse(...), array: $items)
$reversed = array_map(StringHelper::reverse(...), $items);

$helper = new StringHelper();
// Expected: array_map(callback: $helper->capitalize(...), array: $words)
$capitalized = array_map($helper->capitalize(...), $words);

// ============================================================================
// ATTRIBUTES ON PARAMETERS
// ============================================================================

#[\Attribute]
class FromQuery {}

#[\Attribute]
class Validate {
    public function __construct(public string $rule) {}
}

class Controller {
    public function search(
        #[FromQuery] string $query,
        #[Validate('integer|min:1')] int $page = 1
    ): array {
        return [];
    }
}

$controller = new Controller();

// Expected: search(query: "test", page: 2)
$results = $controller->search("test", 2);

// ============================================================================
// NEVER TYPE (PHP 8.1+)
// ============================================================================

function abort(string $message, int $code = 500): never {
    throw new \Exception($message, $code);
}

// Expected: abort(message: "Fatal error", code: 500)
// abort("Fatal error", 500);

// ============================================================================
// CALLABLE WITH SIGNATURE
// ============================================================================

function applyCallback(callable $callback, mixed $value): mixed {
    return $callback($value);
}

// Expected: applyCallback(callback: fn..., value: 10)
$result = applyCallback(fn($x) => $x * 2, 10);

// Expected: applyCallback(callback: 'strtoupper', value: "hello")
$upper = applyCallback('strtoupper', "hello");

// ============================================================================
// CLOSURES WITH USE VARIABLES
// ============================================================================

function createMultiplier(int $factor): callable {
    return function(int $value) use ($factor): int {
        return $value * $factor;
    };
}

function executeWith(callable $fn, int $input): int {
    return $fn($input);
}

// Expected: createMultiplier(factor: 5)
$multiply = createMultiplier(5);

// Expected: executeWith(fn: $multiply, input: 10)
$result = executeWith($multiply, 10);

// ============================================================================
// STATIC CLOSURES
// ============================================================================

function process(callable $callback, array $items): array {
    return array_map($callback, $items);
}

// Expected: process(callback: static fn..., items: $data)
$result = process(static fn($x) => $x * 2, $data);

// ============================================================================
// GENERATORS WITH TYPE HINTS
// ============================================================================

function generateNumbers(int $start, int $end, int $step = 1): \Generator {
    for ($i = $start; $i <= $end; $i += $step) {
        yield $i;
    }
}

// Expected: generateNumbers(start: 1, end: 10, step: 2)
foreach (generateNumbers(1, 10, 2) as $number) {
    // ...
}

// Expected: generateNumbers(start: 0, end: 100)
$range = generateNumbers(0, 100);

// ============================================================================
// ANONYMOUS CLASSES AS ARGUMENTS
// ============================================================================

interface Handler {
    public function handle(string $data): void;
}

function register(Handler $handler): void {
    // ...
}

// Expected: register(handler: new class...)
register(new class implements Handler {
    public function handle(string $data): void {
        echo $data;
    }
});

// ============================================================================
// SELF, PARENT, STATIC TYPES
// ============================================================================

class Node {
    public function addChild(self $child): self {
        return $this;
    }

    public function merge(self $other): self {
        return $this;
    }

    public static function create(string $name): static {
        return new static();
    }
}

$parent = new Node();
$child = new Node();

// Expected: addChild(child: $child)
$parent->addChild($child);

// Expected: merge(other: $sibling)
$parent->merge($sibling);

// Expected: create(name: "root")
$root = Node::create("root");

// ============================================================================
// VARIABLE FUNCTIONS
// ============================================================================

function execute(string $functionName, mixed ...$args): mixed {
    if (function_exists($functionName)) {
        return $functionName(...$args);
    }
    return null;
}

// Expected: execute(functionName: 'strlen', args: "test")
$length = execute('strlen', "test");

// Expected: execute(functionName: 'array_map', args: $callback, args: $array)
$mapped = execute('array_map', $callback, $array);

// ============================================================================
// ARRAY DESTRUCTURING IN PARAMETERS
// ============================================================================

function processCoordinates(array $point): void {
    [$x, $y] = $point;
    // ...
}

// Expected: processCoordinates(point: [10, 20])
processCoordinates([10, 20]);

// ============================================================================
// REFERENCE PARAMETERS
// ============================================================================

function increment(int &$value, int $amount = 1): void {
    $value += $amount;
}

$counter = 0;

// Expected: increment(value: $counter, amount: 5)
increment($counter, 5);

// Expected: increment(value: $num)
increment($num);
