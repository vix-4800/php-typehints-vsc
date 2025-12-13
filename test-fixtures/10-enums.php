<?php

/**
 * Enums (PHP 8.1+)
 *
 * Tests support for enum parameters and backed enums
 */

// ============================================================================
// BASIC ENUMS
// ============================================================================

enum Status {
    case Pending;
    case Active;
    case Completed;
    case Cancelled;
}

function setStatus(Status $status): void {
    // ...
}

// Expected: setStatus(status: Status::Active)
setStatus(Status::Active);

// Expected: setStatus(status: Status::Pending)
setStatus(Status::Pending);

// ============================================================================
// BACKED ENUMS - String
// ============================================================================

enum Color: string {
    case Red = 'red';
    case Green = 'green';
    case Blue = 'blue';
}

function setColor(Color $color): void {
    // ...
}

// Expected: setColor(color: Color::Red)
setColor(Color::Red);

// Expected: setColor(color: Color::Blue)
setColor(Color::Blue);

// ============================================================================
// BACKED ENUMS - Integer
// ============================================================================

enum Priority: int {
    case Low = 1;
    case Medium = 2;
    case High = 3;
    case Critical = 4;
}

function setPriority(Priority $priority, bool $notify = false): void {
    // ...
}

// Expected: setPriority(priority: Priority::High, notify: true)
setPriority(Priority::High, true);

// Expected: setPriority(priority: Priority::Low)
setPriority(Priority::Low);

// ============================================================================
// ENUM METHODS
// ============================================================================

enum HttpStatus: int {
    case OK = 200;
    case Created = 201;
    case BadRequest = 400;
    case NotFound = 404;
    case InternalError = 500;

    public function isSuccess(): bool {
        return $this->value >= 200 && $this->value < 300;
    }

    public function isError(): bool {
        return $this->value >= 400;
    }
}

function respond(HttpStatus $status, string $message = ""): void {
    // ...
}

// Expected: respond(status: HttpStatus::OK, message: "Success")
respond(HttpStatus::OK, "Success");

// Expected: respond(status: HttpStatus::NotFound)
respond(HttpStatus::NotFound);

// ============================================================================
// ENUMS IN CONSTRUCTORS
// ============================================================================

class Task {
    public function __construct(
        public string $title,
        public Status $status = Status::Pending,
        public Priority $priority = Priority::Medium
    ) {}
}

// Expected: new Task(title: "Fix bug", status: Status::Active, priority: Priority::High)
$task = new Task("Fix bug", Status::Active, Priority::High);

// Expected: new Task(title: "Review code")
$task2 = new Task("Review code");

// ============================================================================
// ENUMS WITH UNION TYPES
// ============================================================================

function updateStatus(int|Status $status): void {
    // ...
}

// Expected: updateStatus(status: Status::Active)
updateStatus(Status::Active);

// Expected: updateStatus(status: 1)
updateStatus(1);

// ============================================================================
// ENUMS IN METHOD CHAINING
// ============================================================================

class QueryBuilder {
    public function where(string $field, mixed $value): self {
        return $this;
    }

    public function status(Status $status): self {
        return $this;
    }

    public function priority(Priority $priority): self {
        return $this;
    }
}

$query = new QueryBuilder();

// Expected: where(field: "name", value: "test"), status(status: Status::Active)
$result = $query
    ->where("name", "test")
    ->status(Status::Active)
    ->priority(Priority::High);

// ============================================================================
// ENUM STATIC METHODS
// ============================================================================

enum Role: string {
    case Admin = 'admin';
    case User = 'user';
    case Guest = 'guest';

    public static function fromString(string $value): ?self {
        return match($value) {
            'admin' => self::Admin,
            'user' => self::User,
            'guest' => self::Guest,
            default => null,
        };
    }
}

function assignRole(Role $role, int $userId): void {
    // ...
}

// Expected: fromString(value: "admin")
$role = Role::fromString("admin");

if ($role) {
    // Expected: assignRole(role: $role, userId: 123)
    assignRole($role, 123);
}

// ============================================================================
// VARIADIC ENUM PARAMETERS
// ============================================================================

function hasAnyStatus(Status ...$statuses): bool {
    return count($statuses) > 0;
}

// Expected: hasAnyStatus(statuses: Status::Active, statuses: Status::Pending)
$check = hasAnyStatus(Status::Active, Status::Pending, Status::Completed);
