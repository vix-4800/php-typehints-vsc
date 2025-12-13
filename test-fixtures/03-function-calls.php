<?php

/**
 * Function Calls - Parameter Hints
 *
 * Tests parameter hints for user-defined function calls
 */

// ============================================================================
// BASIC FUNCTION CALLS
// ============================================================================

function greet(string $name, string $greeting = "Hello", int $times = 1): void {
    for ($i = 0; $i < $times; $i++) {
        echo "$greeting, $name!\n";
    }
}

function add(int $a, int $b): int {
    return $a + $b;
}

function formatName(string $first, string $last): string {
    return "$first $last";
}

// Positional arguments
// Expected: greet(name: "John", greeting: "Hi", times: 2)
greet("John", "Hi", 2);

// Expected: add(a: 5, b: 3)
$sum = add(5, 3);

// Expected: formatName(first: "Jane", last: "Doe")
$name = formatName("Jane", "Doe");

// ============================================================================
// DEFAULT PARAMETERS
// ============================================================================

// With defaults omitted
// Expected: greet(name: "Eve")
greet("Eve");

// Expected: greet(name: "Alice", greeting: "Hey")
greet("Alice", "Hey");

// ============================================================================
// NAMED ARGUMENTS (PHP 8.0+)
// ============================================================================

// Named arguments in order - NO HINTS EXPECTED
greet(name: "Jane", greeting: "Hey", times: 3);

// Named arguments in different order - NO HINTS EXPECTED
greet(greeting: "Howdy", name: "Bob", times: 1);

// Named arguments mixed order - NO HINTS EXPECTED
greet(name: "Alice", times: 2, greeting: "Greetings");

// Mixed positional and named
// Expected: greet(name: "Dave", greeting: [no hint because named])
greet("Dave", greeting: "Aloha");

// ============================================================================
// VARIADIC FUNCTIONS
// ============================================================================

function sum(int ...$numbers): int {
    return array_sum($numbers);
}

function concat(string $separator, string ...$parts): string {
    return implode($separator, $parts);
}

// Expected: sum(numbers: 1, numbers: 2, numbers: 3, numbers: 4)
$total = sum(1, 2, 3, 4);

// Expected: concat(separator: ", ", parts: "a", parts: "b", parts: "c")
$text = concat(", ", "a", "b", "c");

// ============================================================================
// REFERENCE PARAMETERS
// ============================================================================

function increment(int &$value): void {
    $value++;
}

function swap(mixed &$a, mixed &$b): void {
    $temp = $a;
    $a = $b;
    $b = $temp;
}

$counter = 0;

// Expected: increment(value: $counter)
increment($counter);

// Expected: swap(a: $x, b: $y)
swap($x, $y);

// ============================================================================
// SPREAD OPERATOR
// ============================================================================

$params = [1, 2, 3];

// Expected: sum(...$params)
$total = sum(...$params);

$args = ['name' => 'Alice', 'greeting' => 'Hello'];

// Expected: greet(...$args)
greet(...$args);

// ============================================================================
// CALLBACKS AND CLOSURES
// ============================================================================

function execute(callable $callback, mixed $data): mixed {
    return $callback($data);
}

function retry(callable $action, int $maxAttempts): mixed {
    return $action();
}

// Expected: execute(callback: $transformer, data: $input)
$result = execute($transformer, $input);

// Expected: retry(action: $fetchData, maxAttempts: 3)
$output = retry($fetchData, 3);

// Inline closures
// Expected: execute(callback: function..., data: $value)
$result = execute(function($x) { return $x * 2; }, $value);

// Expected: retry(action: fn..., maxAttempts: 5)
$result = retry(fn() => getData(), 5);

// ============================================================================
// NESTED FUNCTION CALLS
// ============================================================================

function outer(string $text): string {
    return strtoupper($text);
}

function inner(int $length): int {
    return $length * 2;
}

// Expected: outer(text: substr(string: $data, offset: 0, length: inner(length: 5)))
$nested = outer(substr($data, 0, inner(5)));

// Expected: add(a: add(a: 1, b: 2), b: add(a: 3, b: 4))
$result = add(add(1, 2), add(3, 4));

// ============================================================================
// ARRAY/OBJECT PARAMETERS
// ============================================================================

function processData(array $data, array $options = []): void {
    // ...
}

function configure(object $config): void {
    // ...
}

// Expected: processData(data: [...], options: [...])
processData(['key' => 'value'], ['sort' => true]);

// Expected: processData(data: $items)
processData($items);

// Expected: configure(config: $settings)
configure($settings);

// ============================================================================
// UNION TYPE PARAMETERS
// ============================================================================

function format(string|int $value, bool $strict = false): string {
    return (string) $value;
}

// Expected: format(value: 123, strict: true)
format(123, true);

// Expected: format(value: "text")
format("text");

// ============================================================================
// NULLABLE PARAMETERS
// ============================================================================

function setName(?string $name): void {
    // ...
}

function findById(?int $id = null): mixed {
    return null;
}

// Expected: setName(name: "John")
setName("John");

// Expected: setName(name: null)
setName(null);

// Expected: findById(id: 123)
findById(123);

// Expected: findById()
findById();

// ============================================================================
// MIXED TYPE PARAMETERS
// ============================================================================

function handle(mixed $value = null, ?callable $callback = null): void {
    // ...
}

// Expected: handle(value: $data, callback: $processor)
handle($data, $processor);

// Expected: handle(value: 123)
handle(123);

// Expected: handle()
handle();

// ============================================================================
// MULTILINE FUNCTION CALLS
// ============================================================================

function createUser(
    string $username,
    string $password,
    string $email
): User {
    return new User($username);
}

// Expected: createUser(username: "john_doe", password: "secret123", email: "john@example.com")
$user = createUser(
    "john_doe",
    "secret123",
    "john@example.com"
);

// ============================================================================
// FUNCTION CALLS WITH COMMENTS
// ============================================================================

function connect(string $host, int $port, bool $ssl): void {
    // ...
}

// Expected: connect(host: "localhost", port: 8080, ssl: true)
connect(
    "localhost", // development server
    8080, // standard port
    true // enable SSL
);

// ============================================================================
// TRAILING COMMAS (PHP 8.0+)
// ============================================================================

function build(string $name, array $options): object {
    return (object)['name' => $name, 'options' => $options];
}

// Expected: build(name: "widget", options: [...])
$widget = build(
    "widget",
    ['color' => 'blue'],
);
