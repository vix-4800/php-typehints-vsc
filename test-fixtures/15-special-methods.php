<?php

class TestClass {
    // __construct should NOT get return type hint
    public function __construct($param) {
        $this->param = $param;
    }

    // __destruct should NOT get return type hint
    public function __destruct() {
        // cleanup
    }

    // __clone should NOT get return type hint
    public function __clone() {
        // clone logic
    }

    // Regular methods SHOULD get return type hints if missing
    public function regularMethod() {
        return "test";
    }

    public function anotherMethod($x) {
        return $x * 2;
    }
}

// Regular function should get return type hint
function regularFunction() {
    return 42;
}
