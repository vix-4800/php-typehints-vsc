<?php

/**
 * Class Methods and Constructors
 *
 * Tests parameter hints for class constructors and method calls
 */

// ============================================================================
// CONSTRUCTORS
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
// CONSTRUCTOR PROPERTY PROMOTION (PHP 8.0+)
// ============================================================================

class Config {
    public function __construct(
        public string $host,
        public int $port,
        public bool $debug = false,
    ) {}
}

// Expected: new Config(host: "localhost", port: 3306, debug: true)
$config = new Config("localhost", 3306, true);

// ============================================================================
// INSTANCE METHODS
// ============================================================================

class Calculator {
    public function add(int $a, int $b): int {
        return $a + $b;
    }

    public function divide(float $dividend, float $divisor): float {
        return $dividend / $divisor;
    }

    public function power(int $base, int $exponent): int {
        return $base ** $exponent;
    }
}

$calc = new Calculator();

// Expected: add(a: 5, b: 3)
$sum = $calc->add(5, 3);

// Expected: divide(dividend: 10.0, divisor: 2.0)
$quotient = $calc->divide(10.0, 2.0);

// Expected: power(base: 2, exponent: 8)
$result = $calc->power(2, 8);

// ============================================================================
// STATIC METHODS
// ============================================================================

class MathUtils {
    public static function multiply(int $x, int $y): int {
        return $x * $y;
    }

    public static function max(int ...$numbers): int {
        return max(...$numbers);
    }
}

// Expected: multiply(x: 4, y: 6)
$product = MathUtils::multiply(4, 6);

// Expected: max(numbers: 1, numbers: 5, numbers: 3)
$maximum = MathUtils::max(1, 5, 3);

// ============================================================================
// CHAINED METHOD CALLS
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

    public function offset(int $offset): self {
        return $this;
    }
}

$query = new QueryBuilder();

// Expected hints on each method call:
// where(field: 'status', value: 'active')
// orderBy(column: 'created_at', direction: 'DESC')
// limit(count: 10)
$result = $query
    ->where('status', 'active')
    ->orderBy('created_at', 'DESC')
    ->limit(10);

// With offset
// Expected: offset(offset: 20)
$paginated = $query->offset(20);

// ============================================================================
// NULLSAFE OPERATOR (PHP 8.0+)
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

// Expected: setAddress(addr: new Address(city: "NYC"))
$person->setAddress(new Address("NYC"));

// Nullsafe method call
$city = $person?->address?->city;

// ============================================================================
// INHERITANCE
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
// ABSTRACT CLASSES
// ============================================================================

abstract class AbstractService {
    abstract public function process(array $data, bool $validate = true): mixed;
}

class ConcreteService extends AbstractService {
    public function process(array $data, bool $validate = true): mixed {
        return $data;
    }
}

$service = new ConcreteService();

// Expected: process(data: $input, validate: false)
$service->process($input, false);

// ============================================================================
// INTERFACES
// ============================================================================

interface Handler {
    public function handle(mixed $data): void;
}

class LogHandler implements Handler {
    public function handle(mixed $data): void {
        echo json_encode($data);
    }
}

$handler = new LogHandler();

// Expected: handle(data: $event)
$handler->handle($event);

// ============================================================================
// MAGIC METHODS
// ============================================================================

class Container {
    private array $items = [];

    public function __get(string $name): mixed {
        return $this->items[$name] ?? null;
    }

    public function __set(string $name, mixed $value): void {
        $this->items[$name] = $value;
    }

    public function __call(string $method, array $arguments): mixed {
        return null;
    }
}

$container = new Container();

// Magic methods are called implicitly, no hints needed
$container->service = $myService;
$value = $container->service;

// ============================================================================
// ANONYMOUS CLASSES
// ============================================================================

interface Processor {
    public function execute(string $input): string;
}

function register(Processor $processor): void {
    // ...
}

// Expected: register(processor: new class implements Processor...)
register(new class implements Processor {
    public function execute(string $input): string {
        return strtoupper($input);
    }
});

// ============================================================================
// COMPLEX REAL-WORLD EXAMPLE
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
