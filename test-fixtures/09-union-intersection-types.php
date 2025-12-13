<?php

/**
 * Union and Intersection Types (PHP 8.0+)
 *
 * Tests support for union types, intersection types, and DNF types
 */

// ============================================================================
// UNION TYPES (PHP 8.0+)
// ============================================================================

function processValue(int|float|string $value): string {
    return (string) $value;
}

function findRecord(int|string $id): ?object {
    return null;
}

function calculate(int|float $a, int|float $b): int|float {
    return $a + $b;
}

// Expected: processValue(value: 42)
processValue(42);

// Expected: processValue(value: 3.14)
processValue(3.14);

// Expected: processValue(value: "text")
processValue("text");

// Expected: findRecord(id: 123)
findRecord(123);

// Expected: findRecord(id: "ABC")
findRecord("ABC");

// Expected: calculate(a: 10, b: 20.5)
calculate(10, 20.5);

// ============================================================================
// NULLABLE UNION TYPES
// ============================================================================

function getData(int|string|null $key = null): mixed {
    return null;
}

// Expected: getData(key: 42)
getData(42);

// Expected: getData(key: "key")
getData("key");

// Expected: getData(key: null)
getData(null);

// Expected: getData()
getData();

// ============================================================================
// UNION TYPES WITH OBJECTS
// ============================================================================

interface Renderable {
    public function render(): string;
}

class HtmlView implements Renderable {
    public function render(): string { return "<html></html>"; }
}

class JsonView implements Renderable {
    public function render(): string { return "{}"; }
}

function display(HtmlView|JsonView|string $content): void {
    // ...
}

// Expected: display(content: new HtmlView())
display(new HtmlView());

// Expected: display(content: new JsonView())
display(new JsonView());

// Expected: display(content: "<div>Raw HTML</div>")
display("<div>Raw HTML</div>");

// ============================================================================
// INTERSECTION TYPES (PHP 8.1+)
// ============================================================================

interface Countable {
    public function count(): int;
}

interface Serializable {
    public function serialize(): string;
}

// Note: Intersection types only work with interfaces/classes
// function process(Countable&Serializable $object): void {
//     // ...
// }

// ============================================================================
// DNF TYPES - Disjunctive Normal Form (PHP 8.2+)
// ============================================================================

// DNF allows combining union and intersection types
// Example: (A&B)|C means either (A AND B) OR C

// interface A {}
// interface B {}
// interface C {}

// function handle((A&B)|C $value): void {
//     // ...
// }

// ============================================================================
// UNION WITH FALSE/NULL/TRUE (PHP 8.2+)
// ============================================================================

function validate(string $input): true|string {
    if (strlen($input) > 0) {
        return true;
    }
    return "Input is empty";
}

// Expected: validate(input: "test")
$result = validate("test");

// Expected: validate(input: "")
$error = validate("");

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

// Expected: handle(value: [1, 2, 3], default: [])
handle([1, 2, 3], []);

// ============================================================================
// COMPLEX UNION RETURN TYPES
// ============================================================================

function parse(string $json): array|false {
    $result = json_decode($json, true);
    return $result ?? false;
}

// Expected: parse(json: '{"key": "value"}')
$data = parse('{"key": "value"}');

function fetchUser(int $id): User|null {
    return null;
}

// Expected: fetchUser(id: 123)
$user = fetchUser(123);

// ============================================================================
// UNION TYPES IN CONSTRUCTORS
// ============================================================================

class Logger {
    public function __construct(
        private string|resource $output,
        private int|false $level = false
    ) {}
}

// Expected: new Logger(output: "log.txt", level: 3)
$logger = new Logger("log.txt", 3);

// Expected: new Logger(output: STDOUT)
$logger2 = new Logger(STDOUT);

// ============================================================================
// HELPER CLASSES
// ============================================================================

class User {
    public function __construct(public string $name) {}
}
