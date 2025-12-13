<?php

/**
 * Test fixture for PHP Parameter Hints
 *
 * This file contains various PHP function/method call patterns to test
 * the inlay hints functionality. Expected hints are marked with comments.
 */

// ============================================================================
// 1. BUILT-IN PHP FUNCTIONS
// ============================================================================

// String functions
// Expected: substr(string: $text, offset: 0, length: 5)
$result = substr($text, 0, 5);

// Expected: str_replace(search: "old", replace: "new", subject: $content)
$newText = str_replace("old", "new", $content);

// Expected: array_map(callback: $transformer, array: $items)
$mapped = array_map($transformer, $items);

// Expected: sprintf(format: "User: %s", values: $username)
$formatted = sprintf("User: %s", $username);

// Array functions
// Expected: array_filter(array: $data, callback: $predicate)
$filtered = array_filter($data, $predicate);

// Expected: in_array(needle: $value, haystack: $array, strict: true)
$exists = in_array($value, $array, true);

// ============================================================================
// 2. USER-DEFINED FUNCTIONS
// ============================================================================

function greet(string $name, string $greeting = "Hello", int $times = 1): void {
    for ($i = 0; $i < $times; $i++) {
        echo "$greeting, $name!\n";
    }
}

// Traditional positional arguments
// Expected: greet(name: "John", greeting: "Hi", times: 2)
greet("John", "Hi", 2);

// Named arguments in order - NO HINTS EXPECTED (already named)
greet(name: "Jane", greeting: "Hey", times: 3);

// Named arguments in different order - NO HINTS EXPECTED
greet(greeting: "Howdy", name: "Bob", times: 1);

// Named arguments mixed order - NO HINTS EXPECTED
greet(name: "Alice", times: 2, greeting: "Greetings");

// Only some named arguments - PARTIAL HINTS
// Expected: greet(name: [no hint because named])
greet(name: "Charlie");

// Mixed positional and named arguments
// Expected: greet(name: "Dave", greeting: [no hint because named])
greet("Dave", greeting: "Aloha");

// With default parameters skipped
// Expected: greet(name: "Eve")
greet("Eve");

// ============================================================================
// 3. CLASS CONSTRUCTORS
// ============================================================================

class User {
    public function __construct(
        public string $name,
        public int $age,
        public ?string $email = null
    ) {}
}

// Expected: new User(name: "Alice", age: 30, email: "alice@example.com")
$user1 = new User("Alice", 30, "alice@example.com");

// Expected: new User(name: "Bob", age: 25)
$user2 = new User("Bob", 25);

// Named constructor arguments - NO HINTS EXPECTED
$user3 = new User(name: "Charlie", age: 35);

// ============================================================================
// 4. CLASS METHODS
// ============================================================================

class Calculator {
    public function add(int $a, int $b): int {
        return $a + $b;
    }

    public function divide(float $dividend, float $divisor): float {
        return $dividend / $divisor;
    }

    public static function multiply(int $x, int $y): int {
        return $x * $y;
    }
}

$calc = new Calculator();

// Instance method calls
// Expected: add(a: 5, b: 3)
$sum = $calc->add(5, 3);

// Expected: divide(dividend: 10.0, divisor: 2.0)
$quotient = $calc->divide(10.0, 2.0);

// Static method calls
// Expected: multiply(x: 4, y: 6)
$product = Calculator::multiply(4, 6);

// ============================================================================
// 5. CHAINED METHOD CALLS
// ============================================================================

class QueryBuilder {
    public function where(string $field, mixed $value): self {
        return $this;
    }

    public function orderBy(string $column, string $direction = 'ASC'): self {
        return $this;
    }

    public function limit(int $count): self {
        return $this;
    }
}

$query = new QueryBuilder();

// Expected hints on each method call
// where(field: 'status', value: 'active')
// orderBy(column: 'created_at', direction: 'DESC')
// limit(count: 10)
$result = $query
    ->where('status', 'active')
    ->orderBy('created_at', 'DESC')
    ->limit(10);

// ============================================================================
// 6. CLOSURES AND CALLBACKS
// ============================================================================

// Closure as parameter
// Expected: array_map(callback: function...)
$squared = array_map(function($n) { return $n * $n; }, $numbers);

// Arrow function (PHP 7.4+)
// Expected: array_filter(array: $items, callback: fn...)
$positive = array_filter($items, fn($x) => $x > 0);

// ============================================================================
// 7. VARIADIC FUNCTIONS
// ============================================================================

function sum(int ...$numbers): int {
    return array_sum($numbers);
}

// Expected: sum(...numbers: 1, ...numbers: 2, ...numbers: 3, ...numbers: 4)
// OR: sum(numbers: 1, numbers: 2, numbers: 3, numbers: 4)
$total = sum(1, 2, 3, 4);

// ============================================================================
// 8. NULLSAFE OPERATOR (PHP 8.0+)
// ============================================================================

class Address {
    public function __construct(public ?string $city = null) {}
}

class Person {
    public function __construct(public ?Address $address = null) {}

    public function setAddress(?Address $addr): void {
        $this->address = $addr;
    }
}

$person = new Person();

// Expected: setAddress(addr: new Address(...))
// And for inner: new Address(city: "NYC")
$person->setAddress(new Address("NYC"));

// Nullsafe method call with parameters
// Expected: setAddress(addr: $newAddress) if setAddress exists
$city = $person?->address?->city;

// ============================================================================
// 9. ARRAY PARAMETERS
// ============================================================================

function processData(array $data, array $options = []): void {
    // ...
}

// Expected: processData(data: [...], options: [...])
processData(['key' => 'value'], ['sort' => true]);

// Expected: processData(data: $items)
processData($items);

// ============================================================================
// 10. UNION TYPES (PHP 8.0+)
// ============================================================================

function format(string|int $value, bool $strict = false): string {
    return (string) $value;
}

// Expected: format(value: 123, strict: true)
format(123, true);

// Expected: format(value: "text")
format("text");

// ============================================================================
// 11. INTERSECTION TYPES (PHP 8.1+)
// ============================================================================

interface Loggable {
    public function log(): void;
}

interface Serializable {
    public function serialize(): string;
}

// This would need PHP 8.1+
// function process(Loggable&Serializable $object): void {}

// ============================================================================
// 12. NESTED FUNCTION CALLS
// ============================================================================

function outer(string $text): string {
    return strtoupper($text);
}

function inner(int $length): int {
    return $length * 2;
}

// Expected hints for both outer and inner calls
// outer(text: substr(string: $data, offset: 0, length: inner(length: 5)))
$nested = outer(substr($data, 0, inner(5)));

// ============================================================================
// 13. STATIC CLOSURES (PHP 8.0+)
// ============================================================================

// Expected: array_map(callback: static fn...)
$doubled = array_map(static fn($x) => $x * 2, $values);

// ============================================================================
// 14. FIRST-CLASS CALLABLE SYNTAX (PHP 8.1+)
// ============================================================================

// Expected: array_map(callback: strtoupper(...), array: $strings)
// $uppercase = array_map(strtoupper(...), $strings);

// ============================================================================
// 15. EDGE CASE: VARIABLE NAME MATCHES PARAMETER NAME
// ============================================================================

function setUser(User $user): void {
    // ...
}

// Expected: NO HINT (or optional based on config)
// Because variable name $user matches parameter name
setUser($user);

// But this should show hint:
// Expected: setUser(user: $currentUser)
setUser($currentUser);

// ============================================================================
// 16. MULTIPLE PARAMETERS WITH SAME TYPE
// ============================================================================

function compare(int $first, int $second, bool $strict = true): int {
    // ...
}

// Expected: compare(first: 10, second: 20, strict: false)
compare(10, 20, false);

// ============================================================================
// 17. SPREAD OPERATOR IN ARGUMENTS
// ============================================================================

$params = [1, 2, 3];

// Expected: sum(...numbers: ...$params)
// This is tricky - spread operator unpacks array
$total = sum(...$params);

// ============================================================================
// 18. REFERENCE PARAMETERS
// ============================================================================

function increment(int &$value): void {
    $value++;
}

$counter = 0;

// Expected: increment(value: $counter)
// The & is in function definition, not in call
increment($counter);

// ============================================================================
// 19. METHOD WITH NO PARAMETERS
// ============================================================================

class Service {
    public function start(): void {
        // ...
    }
}

$service = new Service();

// Expected: NO HINTS (no parameters)
$service->start();

// ============================================================================
// 20. COMPLEX REAL-WORLD SCENARIO
// ============================================================================

class EmailService {
    public function send(
        string $to,
        string $subject,
        string $body,
        array $attachments = [],
        bool $html = true,
        ?string $from = null
    ): bool {
        return true;
    }
}

$emailService = new EmailService();

// Expected full hints:
// send(to: "user@example.com", subject: "Welcome", body: $emailBody,
//      attachments: [], html: true, from: "noreply@example.com")
$emailService->send(
    "user@example.com",
    "Welcome",
    $emailBody,
    [],
    true,
    "noreply@example.com"
);

// Mixed named and positional:
// Expected: send(to: "admin@example.com", subject: "Alert", body: [no hint])
$emailService->send(
    "admin@example.com",
    "Alert",
    body: $message
);
