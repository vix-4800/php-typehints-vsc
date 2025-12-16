<?php

/**
 * Type Normalization Tests
 *
 * Tests that PHPDoc types are normalized to valid PHP return types.
 * Complex types like Object[], array<T>, Collection<T> are converted
 * to their valid PHP equivalents.
 */

// ============================================================================
// ARRAY NOTATIONS -> array
// ============================================================================

/**
 * @return string[]
 */
function getStrings() {
    return ["a", "b", "c"];
}
// Expected: : array

/**
 * @return int[]
 */
function getNumbers() {
    return [1, 2, 3];
}
// Expected: : array

/**
 * @return User[]
 */
function getUsers() {
    return [new User("John"), new User("Jane")];
}
// Expected: : array

/**
 * @return Object[]
 */
function getObjects() {
    return [(object)["id" => 1], (object)["id" => 2]];
}
// Expected: : array

/**
 * @return array<string>
 */
function getStringList() {
    return ["a", "b"];
}
// Expected: : array

/**
 * @return array<int, string>
 */
function getMap() {
    return [1 => "one", 2 => "two"];
}
// Expected: : array

/**
 * @return list<int>
 */
function getIntList() {
    return [1, 2, 3];
}
// Expected: : array

/**
 * @return non-empty-array<string>
 */
function getNonEmptyArray() {
    return ["value"];
}
// Expected: : array

/**
 * @return array{name: string, age: int}
 */
function getPersonShape() {
    return ["name" => "John", "age" => 30];
}
// Expected: : array

/**
 * @return array{title: string|null, body: string}
 */
function getNotificationSimple() {
    return ["title" => null, "body" => "Message"];
}
// Expected: : array

/**
 * @return array{title: string|null, body: string, icon: string, type: TypeEnum, link: string|null}
 */
function getNotificationData() {
    return [
        "title" => "Title",
        "body" => "Message body",
        "icon" => "icon.png",
        "type" => TypeEnum::INFO,
        "link" => null
    ];
}
// Expected: : array

/**
 * @return array<array<string>>
 */
function getNestedStringArray() {
    return [["a", "b"], ["c", "d"]];
}
// Expected: : array

/**
 * @return array<array<string, array|bool|string>>
 */
function getComplexNestedArray() {
    return [
        ["key" => ["nested"], "flag" => true, "text" => "value"]
    ];
}
// Expected: : array

// ============================================================================
// GENERIC CLASSES -> Class (without generics)
// ============================================================================

/**
 * @return Collection<User>
 */
function getUserCollection() {
    return new Collection();
}
// Expected: : Collection

/**
 * @return Iterator<string>
 */
function getIterator() {
    return new ArrayIterator(["a", "b"]);
}
// Expected: : Iterator

/**
 * @return Generator<int, string, mixed, void>
 */
function generateItems() {
    yield "a";
    yield "b";
}
// Expected: : Generator

/**
 * @return Illuminate\Support\Collection<User>
 */
function getLaravelCollection() {
    return collect();
}
// Expected: : Illuminate\Support\Collection

// ============================================================================
// CALLABLE SIGNATURES -> callable/Closure
// ============================================================================

/**
 * @return callable(int): string
 */
function getIntToStringFormatter() {
    return fn($n) => (string)$n;
}
// Expected: : callable

/**
 * @return callable(string, int): bool
 */
function getValidator() {
    return fn($str, $len) => strlen($str) > $len;
}
// Expected: : callable

/**
 * @return Closure(User): string
 */
function getUserFormatter() {
    return fn($user) => $user->name;
}
// Expected: : Closure

// ============================================================================
// NULLABLE TYPES (? shorthand)
// ============================================================================

/**
 * @return ?string
 */
function maybeGetString() {
    return null;
}
// Expected: : string|null

/**
 * @return ?User
 */
function maybeGetUser() {
    return null;
}
// Expected: : User|null

// ============================================================================
// UNION TYPES WITH NORMALIZATION
// ============================================================================

/**
 * @return string[]|null
 */
function maybeGetStrings() {
    return null;
}
// Expected: : array|null

/**
 * @return Collection<User>|null
 */
function maybeGetCollection() {
    return null;
}
// Expected: : Collection|null

/**
 * @return string[]|int[]
 */
function getMixedArray() {
    return ["a", "b"];
}
// Expected: : array (both parts normalize to array, deduplicated)

/**
 * @return array<string>|array<int>|null
 */
function getComplexArray() {
    return null;
}
// Expected: : array|null (all array types merge, then union with null)

/**
 * @return Collection<User>|Collection<Post>
 */
function getAnyCollection() {
    return new Collection();
}
// Expected: : Collection (both normalize to Collection, deduplicated)

// ============================================================================
// SPECIAL PHPSTAN/PSALM TYPES
// ============================================================================

/**
 * @return class-string<User>
 */
function getUserClassName() {
    return User::class;
}
// Expected: : string

/**
 * @return positive-int
 */
function getPositiveInt() {
    return 42;
}
// Expected: : int

/**
 * @return negative-int
 */
function getNegativeInt() {
    return -42;
}
// Expected: : int

/**
 * @return non-empty-string
 */
function getNonEmptyString() {
    return "value";
}
// Expected: : string

/**
 * @return literal-string
 */
function getLiteralString() {
    return "literal";
}
// Expected: : string

/**
 * @return numeric-string
 */
function getNumericString() {
    return "123";
}
// Expected: : string

// ============================================================================
// VALID PHP TYPES (should remain unchanged)
// ============================================================================

/**
 * @return int
 */
function getInt() {
    return 42;
}
// Expected: : int

/**
 * @return string
 */
function getString() {
    return "text";
}
// Expected: : string

/**
 * @return array
 */
function getArray() {
    return [];
}
// Expected: : array

/**
 * @return bool
 */
function getBool() {
    return true;
}
// Expected: : bool

/**
 * @return void
 */
function doSomething() {
    echo "done";
}
// Expected: : void

/**
 * @return mixed
 */
function getMixed() {
    return null;
}
// Expected: : mixed

// ============================================================================
// CLASS METHODS WITH SPECIAL RETURN TYPES
// ============================================================================

class TypeTestClass {
    /**
     * @return self
     */
    public function getSelf() {
        return new self();
    }
    // Expected: : self

    /**
     * @return static
     */
    public static function getStatic() {
        return new static();
    }
    // Expected: : static

    /**
     * Inferred return type from $this
     */
    public function getThis() {
        return $this;
    }
    // Expected: : static (normalized from $this)
}

/**
 * @return User|Post|Comment
 */
function getEntity() {
    return new User("test");
}
// Expected: : User|Post|Comment

// ============================================================================
// HELPER CLASSES
// ============================================================================

class User {
    public function __construct(public string $name) {}
}

class Post {
    public function __construct(public string $title) {}
}

class Comment {
    public function __construct(public string $text) {}
}

class Collection {
    private array $items = [];

    public function __construct(array $items = []) {
        $this->items = $items;
    }
}
