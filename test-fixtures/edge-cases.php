<?php

/**
 * Edge Cases and Special Scenarios
 *
 * This file focuses on tricky edge cases that might break naive implementations
 */

// ============================================================================
// EDGE CASE 1: Return type hints - various types
// ============================================================================

// Expected return type hint: : void
function writeLog(string $message, string $level = "info"): void {
    echo "[$level] $message\n";
}

// Expected return type hint: : string|int (union type, PHP 8.0+)
function getId(bool $asString): string|int {
    return $asString ? "123" : 123;
}

// Expected return type hint: : self (self return type)
class Logger {
    public function create(): self {
        return new self();
    }

    // Expected return type hint: : static (static return type)
    public static function getInstance(): static {
        return new static();
    }
}

// Expected return type hint: : mixed (mixed type, PHP 8.0+)
function getValue(string $key): mixed {
    return $_SESSION[$key] ?? null;
}

// Expected return type hint: : never (never type, PHP 8.1+)
function terminate(string $message): never {
    die($message);
}

// Strings containing parentheses, commas, colons
// Expected: writeLog(message: "Error (code: 500), retry", level: "error")
writeLog("Error (code: 500), retry", "error");

// Expected: writeLog(message: "Function call: foo(1, 2, 3)")
writeLog("Function call: foo(1, 2, 3)");

// ============================================================================
// EDGE CASE 2: Multiline function calls
// ============================================================================

function createUser(
    string $username,
    string $password,
    string $email
): User {
    return new User($username, 0, $email);
}

// Expected: createUser(username: "john_doe", password: "secret123", email: "john@example.com")
$user = createUser(
    "john_doe",
    "secret123",
    "john@example.com"
);

// ============================================================================
// EDGE CASE 3: Comments inside function calls
// ============================================================================

function configure(string $host, int $port, bool $ssl): void {
    // ...
}

// Expected hints should still work despite comments
// configure(host: "localhost", port: 8080, ssl: true)
configure(
    "localhost", // development server
    8080, // standard port
    true // enable SSL
);

// ============================================================================
// EDGE CASE 4: Trailing commas (PHP 8.0+)
// ============================================================================

function build(string $name, array $options): object {
    return (object)['name' => $name, 'options' => $options];
}

// Expected: build(name: "widget", options: [...])
$widget = build(
    "widget",
    ['color' => 'blue'],
);

// ============================================================================
// EDGE CASE 5: Heredoc and Nowdoc as arguments
// ============================================================================

function render(string $template, array $vars = []): string {
    return $template;
}

// Expected: render(template: <<<EOT..., vars: [...])
$output = render(<<<EOT
    <div>
        <h1>{$title}</h1>
    </div>
    EOT,
    ['title' => 'Welcome']
);

// ============================================================================
// EDGE CASE 6: Anonymous classes as arguments
// ============================================================================

interface Handler {
    public function handle(): void;
}

function register(Handler $handler): void {
    // ...
}

// Expected: register(handler: new class implements Handler...)
register(new class implements Handler {
    public function handle(): void {
        echo "Handled\n";
    }
});

// ============================================================================
// EDGE CASE 7: Enum arguments (PHP 8.1+)
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
// EDGE CASE 8: Match expressions as arguments (PHP 8.0+)
// ============================================================================

function process(int $code): void {
    // ...
}

// Expected: process(code: match...)
process(match($type) {
    'A' => 1,
    'B' => 2,
    default => 0,
});

// ============================================================================
// EDGE CASE 9: Attribute parameters (PHP 8.0+)
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
    // ...
}

// ============================================================================
// EDGE CASE 10: Constructor property promotion with hints
// ============================================================================

// Expected: new Config(host: "localhost", port: 3306, debug: true)
$config = new Config(
    host: "localhost",
    port: 3306,
    debug: true
);

// ============================================================================
// EDGE CASE 11: Ternary and null coalescing as arguments
// ============================================================================

function connect(string $host, int $timeout): void {
    // ...
}

// Expected: connect(host: $config['host'] ?? 'localhost', timeout: ...)
connect(
    $config['host'] ?? 'localhost',
    $isProduction ? 30 : 5
);

// ============================================================================
// EDGE CASE 12: Array destructuring in parameters
// ============================================================================

// Modern PHP doesn't support this in function signatures directly,
// but we might pass array with destructured values

function point(int $x, int $y): void {
    // ...
}

[$x, $y] = [10, 20];

// Expected: point(x: $x, y: $y)
point($x, $y);

// ============================================================================
// EDGE CASE 13: Splat with named arguments
// ============================================================================

function options(string $name, bool $enabled = true, int $priority = 0): void {
    // ...
}

$args = ['name' => 'feature', 'priority' => 5];

// This is complex - spreading associative array with named args
// Expected: options(...$args)
options(...$args);

// ============================================================================
// EDGE CASE 14: Same function name in different namespaces
// ============================================================================

namespace App\Services;

function transform(string $input): string {
    return strtoupper($input);
}

namespace App\Helpers;

function transform(int $value): int {
    return $value * 2;
}

namespace App;

use function App\Services\transform as serviceTransform;
use function App\Helpers\transform as helperTransform;

// Expected: serviceTransform(input: "hello")
$result1 = serviceTransform("hello");

// Expected: helperTransform(value: 42)
$result2 = helperTransform(42);

// ============================================================================
// EDGE CASE 15: Callable type hints with invocation
// ============================================================================

namespace App;

function execute(callable $callback, mixed $data): mixed {
    return $callback($data);
}

// Expected: execute(callback: $transformer, data: $input)
$result = execute($transformer, $input);

// ============================================================================
// EDGE CASE 16: Short array syntax with complex nesting
// ============================================================================

function validateRules(array $rules, array $data): bool {
    return true;
}

// Expected: validateRules(rules: [...], data: [...])
validateRules(
    [
        'email' => ['required', 'email'],
        'age' => ['required', 'integer', 'min:18'],
    ],
    [
        'email' => 'user@test.com',
        'age' => 25,
    ]
);

// ============================================================================
// EDGE CASE 17: Generator functions
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
// EDGE CASE 18: Mixed with default null
// ============================================================================

function handle(mixed $value = null, ?callable $callback = null): void {
    // ...
}

// Expected: handle(value: $data, callback: null)
handle($data, null);

// Expected: handle()
handle();

// ============================================================================
// EDGE CASE 19: Self and parent type hints
// ============================================================================

class Node {
    public function addChild(self $child): void {
        // ...
    }
}

$parent = new Node();
$child = new Node();

// Expected: addChild(child: $child)
$parent->addChild($child);

// ============================================================================
// EDGE CASE 20: Promoted constructor in inheritance
// ============================================================================

class BaseEntity {
    public function __construct(
        protected int $id,
    ) {}
}

class Article extends BaseEntity {
    public function __construct(
        int $id,
        public string $title,
        public string $content,
    ) {
        parent::__construct($id);
    }
}

// Expected: new Article(id: 1, title: "Hello", content: "World")
$article = new Article(1, "Hello", "World");

// ============================================================================
// EDGE CASE 21: Function calls inside array literals
// ============================================================================

function getValue(string $key): mixed {
    return null;
}

// Expected hints inside array construction
// getValue(key: 'name'), getValue(key: 'email')
$data = [
    'user_name' => getValue('name'),
    'user_email' => getValue('email'),
];

// ============================================================================
// EDGE CASE 22: Constant as argument
// ============================================================================

define('MAX_RETRIES', 3);

function retry(callable $action, int $maxAttempts): mixed {
    return null;
}

// Expected: retry(action: $fetchData, maxAttempts: MAX_RETRIES)
retry($fetchData, MAX_RETRIES);

// ============================================================================
// EDGE CASE 23: Empty function call (syntax error, but parser should handle)
// ============================================================================

// This is a syntax error in PHP, but parser should not crash
// test();
