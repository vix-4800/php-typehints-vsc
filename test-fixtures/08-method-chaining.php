<?php

class Query {
    public function select(array $columns): static {
        return $this;
    }

    public function where(string $condition, array $params = []): static {
        return $this;
    }

    public function andWhere(array|string $condition, array $params = []): static {
        return $this;
    }

    public function orderBy(string|array $columns): static {
        return $this;
    }

    public function with(array $relations): static {
        return $this;
    }

    public function all(): array {
        return [];
    }
}

class Category {
    public static function find(): Query {
        return new Query();
    }
}

class SourceEnum {
    public const YII = 'yii';
}

class Test {
    private function getCategories(): array
    {
        return Category::find()
            ->select(['id', 'name', 'icon', 'access'])
            ->where("access is not null OR name = 'Главная'")
            ->andWhere(['category_id' => null])
            ->andWhere(['source' => SourceEnum::YII])
            ->andWhere(['not', ['name' => '']])
            ->andWhere(['not', ['name' => null]])
            ->orderBy('sort')
            ->with(['items', 'subcategories'])
            ->all();
    }
}
