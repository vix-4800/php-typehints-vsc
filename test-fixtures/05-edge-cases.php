<?php

/**
 * Edge Cases and Complex Scenarios
 *
 * Tests parser robustness with tricky edge cases
 */

// ============================================================================
// STRINGS WITH SPECIAL CHARACTERS
// ============================================================================

function writeLog(string $message, string $level = "info"): void {
    echo "[$level] $message\n";
}

// Strings containing parentheses, commas, colons
// Expected: writeLog(message: "Error (code: 500), retry", level: "error")
writeLog("Error (code: 500), retry", "error");

// Expected: writeLog(message: "Function call: foo(1, 2, 3)")
writeLog("Function call: foo(1, 2, 3)");

// Expected: writeLog(message: "Array: [1, 2, 3]")
writeLog("Array: [1, 2, 3]");

// ============================================================================
// HEREDOC AND NOWDOC
// ============================================================================

function render(string $template, array $vars = []): string {
    return $template;
}

// Expected: render(template: <<<EOT..., vars: [...])
$output = render(<<<EOT
    <div>
        <h1>{$title}</h1>
        <p>Content with (parentheses), and, commas.</p>
    </div>
    EOT,
    ['title' => 'Welcome']
);

// Nowdoc
// Expected: render(template: <<<'EOT'...)
$output2 = render(<<<'EOT'
    Raw text without {$variable} interpolation
    EOT
);

// ============================================================================
// MULTILINE CALLS WITH COMMENTS
// ============================================================================

function configure(string $host, int $port, bool $ssl): void {
    // ...
}

// Expected: configure(host: "localhost", port: 8080, ssl: true)
configure(
    "localhost", // development server
    8080, // standard port
    true // enable SSL
);

// With block comments
// Expected: configure(host: "prod.example.com", port: 443, ssl: true)
configure(
    "prod.example.com", /* production */
    443, /* HTTPS port */
    true /* always use SSL in prod */
);

// ============================================================================
// NESTED ARRAYS AND OBJECTS
// ============================================================================

function validateRules(array $rules, array $data): bool {
    return true;
}

// Expected: validateRules(rules: [...], data: [...])
validateRules(
    [
        'email' => ['required', 'email'],
        'age' => ['required', 'integer', 'min:18'],
        'address' => [
            'city' => ['required', 'string'],
            'zip' => ['required', 'numeric'],
        ],
    ],
    [
        'email' => 'user@test.com',
        'age' => 25,
        'address' => [
            'city' => 'New York',
            'zip' => '10001',
        ],
    ]
);

// ============================================================================
// FUNCTION CALLS INSIDE ARRAY LITERALS
// ============================================================================

function getValue(string $key): mixed {
    return null;
}

// Expected hints inside array construction
// getValue(key: 'name'), getValue(key: 'email')
$data = [
    'user_name' => getValue('name'),
    'user_email' => getValue('email'),
    'user_age' => getValue('age'),
];

// ============================================================================
// TERNARY AND NULL COALESCING AS ARGUMENTS
// ============================================================================

function connect(string $host, int $timeout): void {
    // ...
}

// Expected: connect(host: ..., timeout: ...)
connect(
    $config['host'] ?? 'localhost',
    $isProduction ? 30 : 5
);

// ============================================================================
// MATCH EXPRESSIONS (PHP 8.0+)
// ============================================================================

function process(int $code): void {
    // ...
}

// Expected: process(code: match...)
process(match($type) {
    'A' => 1,
    'B' => 2,
    'C' => 3,
    default => 0,
});

// ============================================================================
// ENUMS (PHP 8.1+)
// ============================================================================

enum Status: string {
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
}

function setStatus(Status $status): void {
    // ...
}

// Expected: setStatus(status: Status::ACTIVE)
setStatus(Status::ACTIVE);

// ============================================================================
// ATTRIBUTES (PHP 8.0+)
// ============================================================================

#[\Attribute]
class Route {
    public function __construct(
        public string $path,
        public array $methods = ['GET']
    ) {}
}

// Expected: Route(path: "/api/users", methods: [...])
#[Route("/api/users", ["GET", "POST"])]
class UserController {
    // Method attribute
    // Expected: Route(path: "/api/users/{id}", methods: [...])
    #[Route("/api/users/{id}", ["GET"])]
    public function show(int $id): void {
        // ...
    }
}

// ============================================================================
// CONSTANTS AS ARGUMENTS
// ============================================================================

define('MAX_RETRIES', 3);
const TIMEOUT = 30;

function retry(callable $action, int $maxAttempts): mixed {
    return null;
}

function setTimeout(int $seconds): void {
    // ...
}

// Expected: retry(action: $fetchData, maxAttempts: MAX_RETRIES)
retry($fetchData, MAX_RETRIES);

// Expected: setTimeout(seconds: TIMEOUT)
setTimeout(TIMEOUT);

// ============================================================================
// SPLAT WITH NAMED ARGUMENTS
// ============================================================================

function options(string $name, bool $enabled = true, int $priority = 0): void {
    // ...
}

$args = ['name' => 'feature', 'priority' => 5];

// Expected: options(...$args)
options(...$args);

$positional = ['cache', true, 10];

// Expected: options(...$positional)
options(...$positional);

// ============================================================================
// VARIABLE VARIABLES AND DYNAMIC CALLS
// ============================================================================

$funcName = 'log';

// Expected: log(message: "Dynamic call", level: "debug")
$funcName("Dynamic call", "debug");

// Variable method call
class Service {
    public function execute(string $command): void {
        // ...
    }
}

$service = new Service();
$methodName = 'execute';

// Expected: execute(command: "run")
$service->$methodName("run");

// ============================================================================
// FIRST-CLASS CALLABLES (PHP 8.1+)
// ============================================================================

function transform(string $text): string {
    return strtoupper($text);
}

// Expected: array_map(callback: transform(...), array: $strings)
// $result = array_map(transform(...), $strings);

// ============================================================================
// ARROW FUNCTIONS AS ARGUMENTS
// ============================================================================

// Expected: array_map(callback: fn..., array: $items)
$doubled = array_map(fn($x) => $x * 2, $items);

// Expected: array_filter(array: $numbers, callback: fn...)
$positive = array_filter($numbers, fn($n) => $n > 0);

// ============================================================================
// STATIC CLOSURES
// ============================================================================

// Expected: array_map(callback: static fn..., array: $values)
$result = array_map(static fn($x) => $x * 2, $values);

// ============================================================================
// GENERATOR CALLS
// ============================================================================

function generateNumbers(int $start, int $end): \Generator {
    for ($i = $start; $i <= $end; $i++) {
        yield $i;
    }
}

// Expected: generateNumbers(start: 1, end: 10)
foreach (generateNumbers(1, 10) as $number) {
    // ...
}

// ============================================================================
// ARRAY DESTRUCTURING
// ============================================================================

function point(int $x, int $y): void {
    // ...
}

[$x, $y] = [10, 20];

// Expected: point(x: $x, y: $y)
point($x, $y);

// ============================================================================
// SELF AND PARENT TYPE HINTS
// ============================================================================

class Node {
    public function addChild(self $child): void {
        // ...
    }

    public function merge(self $other): self {
        return $this;
    }
}

$parent = new Node();
$child = new Node();

// Expected: addChild(child: $child)
$parent->addChild($child);

// Expected: merge(other: $sibling)
$parent->merge($sibling);

// ============================================================================
// TRAILING COMMAS IN VARIOUS CONTEXTS
// ============================================================================

function build(string $name, array $options): object {
    return (object)['name' => $name];
}

// In function call
// Expected: build(name: "widget", options: [...])
$widget = build(
    "widget",
    ['color' => 'blue'],
);

// In constructor
class Product {
    public function __construct(
        public string $sku,
        public float $price,
    ) {}
}

// Expected: new Product(sku: "ABC123", price: 99.99)
$product = new Product(
    "ABC123",
    99.99,
);

// ============================================================================
// EMPTY AND SINGLE PARAMETER FUNCTIONS
// ============================================================================

function noParams(): void {
    // ...
}

function singleParam(string $value): void {
    // ...
}

// Expected: NO HINTS (no parameters)
noParams();

// Expected: singleParam(value: "test")
singleParam("test");

// ============================================================================
// VARIABLE NAME MATCHING PARAMETER NAME
// ============================================================================

function setUser(User $user): void {
    // ...
}

// Variable name matches parameter name - hints optional based on config
// Expected: setUser(user: $user) OR NO HINT
setUser($user);

// Variable name differs - should show hint
// Expected: setUser(user: $currentUser)
setUser($currentUser);
