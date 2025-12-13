<?php

class Config {
    public static function findOne(array $condition, ?array $options = null) {
        return new static();
    }

    public $value;
}

class TwoCaptcha {
    public function __construct(string $apiKey) {
    }
}

$solver = new TwoCaptcha(Config::findOne(['key' => '2captcha/auth-key'])?->value);
