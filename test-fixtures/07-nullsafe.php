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

class User {
    public $uniqid;
    public function getShortName(): string {
        return 'User';
    }
}

class Model {
    public ?User $createdBy = null;
}

class Html {
    public static function a(string $text, array $url): string {
        return '<a href="#">' . $text . '</a>';
    }
}

$solver = new TwoCaptcha(Config::findOne(['key' => '2captcha/auth-key'])?->value);

$model = new Model();
$result = Html::a($model->createdBy?->getShortName(), ['/user/view', 'id' => $model->createdBy->uniqid]);
