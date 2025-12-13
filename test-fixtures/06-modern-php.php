<?php

/**
 * Modern PHP Features (8.0+)
 *
 * Tests support for recent PHP language features
 */

// ============================================================================
// NAMED ARGUMENTS (PHP 8.0+)
// ============================================================================

function createUser(string $name, int $age, string $email): User {
    return new User($name);
}

// Fully named - NO HINTS EXPECTED
createUser(
    name: "John",
    age: 30,
    email: "john@example.com"
);

// Mixed order named - NO HINTS EXPECTED
createUser(
    email: "jane@example.com",
    name: "Jane",
    age: 25
);

// Partial named
// Expected: createUser(name: "Bob", age: [no hint], email: [no hint])
createUser("Bob", age: 28, email: "bob@example.com");

// ============================================================================
// UNION TYPES (PHP 8.0+)
// ============================================================================

function processValue(int|float|string $value): string {
    return (string) $value;
}

function findRecord(int|string $id): ?object {
    return null;
}

// Expected: processValue(value: 42)
processValue(42);

// Expected: processValue(value: "text")
processValue("text");

// Expected: findRecord(id: 123)
findRecord(123);

// Expected: findRecord(id: "ABC")
findRecord("ABC");

// ============================================================================
// MIXED TYPE (PHP 8.0+)
// ============================================================================

function handle(mixed $value, mixed $default = null): mixed {
    return $value ?? $default;
}

// Expected: handle(value: $data, default: 0)
handle($data, 0);

// Expected: handle(value: "test")
handle("test");

// ============================================================================
// NULLSAFE OPERATOR (PHP 8.0+)
// ============================================================================

class City {
    public function __construct(public string $name) {}
}

class Address {
    public function __construct(public ?City $city = null) {}

    public function setCity(?City $city): void {
        $this->city = $city;
    }
}

class User {
    public function __construct(public ?Address $address = null) {}
}

$user = new User();

// Nullsafe chain
$cityName = $user?->address?->city?->name;

// Method call with nullsafe
// Expected: setCity(city: $newCity)
$user->address?->setCity($newCity);

// ============================================================================
// MATCH EXPRESSION (PHP 8.0+)
// ============================================================================

function getStatusCode(string $status): int {
    return match($status) {
        'success' => 200,
        'created' => 201,
        'error' => 500,
        default => 400,
    };
}

function route(string $method, string $path): void {
    // ...
}

// Expected: route(method: match..., path: "/api/users")
route(
    match($requestType) {
        'api' => 'POST',
        'web' => 'GET',
        default => 'GET',
    },
    "/api/users"
);

// ============================================================================
// CONSTRUCTOR PROPERTY PROMOTION (PHP 8.0+)
// ============================================================================

class Point {
    public function __construct(
        public float $x,
        public float $y,
        public float $z = 0.0,
    ) {}
}

// Expected: new Point(x: 1.5, y: 2.5, z: 3.5)
$point = new Point(1.5, 2.5, 3.5);

// Expected: new Point(x: 10.0, y: 20.0)
$point2 = new Point(10.0, 20.0);

// ============================================================================
// ATTRIBUTES (PHP 8.0+)
// ============================================================================

#[\Attribute]
class Cache {
    public function __construct(
        public int $ttl = 3600,
        public ?string $key = null,
    ) {}
}

#[\Attribute(\Attribute::TARGET_METHOD)]
class Validate {
    public function __construct(
        public array $rules,
        public string $message = 'Validation failed',
    ) {}
}

class CachedService {
    // Expected: Cache(ttl: 7200, key: "service:data")
    #[Cache(7200, "service:data")]
    public function getData(): array {
        return [];
    }

    // Expected: Validate(rules: [...], message: "Invalid input")
    #[Validate(['email', 'required'], "Invalid input")]
    public function process(string $email): void {
        // ...
    }
}

// ============================================================================
// ENUMS (PHP 8.1+)
// ============================================================================

enum Color: string {
    case RED = 'red';
    case GREEN = 'green';
    case BLUE = 'blue';
}

enum Priority: int {
    case LOW = 1;
    case MEDIUM = 5;
    case HIGH = 10;
}

function setColor(Color $color): void {
    // ...
}

function setPriority(Priority $priority): void {
    // ...
}

// Expected: setColor(color: Color::RED)
setColor(Color::RED);

// Expected: setPriority(priority: Priority::HIGH)
setPriority(Priority::HIGH);

// ============================================================================
// FIRST-CLASS CALLABLE SYNTAX (PHP 8.1+)
// ============================================================================

function upper(string $text): string {
    return strtoupper($text);
}

class Formatter {
    public function format(string $text): string {
        return trim($text);
    }
}

// First-class callable with built-in
// Expected: array_map(callback: strtolower(...), array: $strings)
// $lower = array_map(strtolower(...), $strings);

// First-class callable with user function
// Expected: array_map(callback: upper(...), array: $texts)
// $upper = array_map(upper(...), $texts);

// First-class callable with method
$formatter = new Formatter();
// Expected: array_map(callback: $formatter->format(...), array: $items)
// $formatted = array_map($formatter->format(...), $items);

// ============================================================================
// READONLY PROPERTIES (PHP 8.1+)
// ============================================================================

class ImmutablePoint {
    public function __construct(
        public readonly float $x,
        public readonly float $y,
    ) {}
}

// Expected: new ImmutablePoint(x: 5.0, y: 10.0)
$point = new ImmutablePoint(5.0, 10.0);

// ============================================================================
// NEVER TYPE (PHP 8.1+)
// ============================================================================

function abort(string $message, int $code = 500): never {
    http_response_code($code);
    die($message);
}

function redirect(string $url): never {
    header("Location: $url");
    exit;
}

// Expected: abort(message: "Unauthorized", code: 401)
abort("Unauthorized", 401);

// Expected: redirect(url: "/login")
redirect("/login");

// ============================================================================
// INTERSECTION TYPES (PHP 8.1+)
// ============================================================================

interface Loggable {
    public function log(): void;
}

interface Serializable {
    public function serialize(): string;
}

// Commented out as it requires both interfaces to be implemented
// function process(Loggable&Serializable $object): void {
//     $object->log();
//     $object->serialize();
// }

// ============================================================================
// NEW IN INITIALIZERS (PHP 8.1+)
// ============================================================================

class Service {
    public function __construct(
        private Logger $logger = new Logger(),
    ) {}
}

class Logger {
    public function __construct(
        public string $level = 'info',
    ) {}
}

// Default object in parameter
$service = new Service();

// Expected: new Service(logger: new Logger(level: "debug"))
$service2 = new Service(new Logger("debug"));

// ============================================================================
// FINAL CLASS CONSTANTS (PHP 8.1+)
// ============================================================================

class Config {
    final public const VERSION = '1.0.0';
    final public const MAX_SIZE = 1024;
}

function checkVersion(string $version): bool {
    return $version === Config::VERSION;
}

// Expected: checkVersion(version: Config::VERSION)
checkVersion(Config::VERSION);

// ============================================================================
// PURE INTERSECTION TYPES (PHP 8.1+)
// ============================================================================

interface Countable {
    public function count(): int;
}

interface Arrayable {
    public function toArray(): array;
}

class Collection implements Countable, Arrayable {
    public function count(): int {
        return 0;
    }

    public function toArray(): array {
        return [];
    }
}

// function aggregate(Countable&Arrayable $data): array {
//     return [];
// }

// Expected: aggregate(data: $collection)
// aggregate($collection);

// ============================================================================
// DNF TYPES - Disjunctive Normal Form (PHP 8.2+)
// ============================================================================

// Commented out - requires PHP 8.2+
// function process((Countable&Arrayable)|null $data): void {
//     // ...
// }

// Expected: process(data: $collection)
// process($collection);

// Expected: process(data: null)
// process(null);
