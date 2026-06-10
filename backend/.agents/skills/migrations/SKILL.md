# Настройка и использование миграций через Alembic

## Цель

Необходимо добавить в проект поддержку миграций базы данных через Alembic.

### Требования к структуре проекта

В директории `backend` должна присутствовать папка `migrations` со следующей структурой:

```text
backend/
├── migrations/
│   ├── env.py
│   └── versions/
```

* `env.py` — основной конфигурационный файл Alembic.
* `versions/` — директория для автоматически генерируемых миграций.

## Источник моделей

Все модели базы данных должны находиться в директории:

```text
backend/models/
```

Alembic должен быть настроен таким образом, чтобы автогенерация миграций происходила на основе моделей из папки `models`.

## Генерация миграций

Необходимо настроить Alembic для поддержки команды автогенерации миграций на основе изменений в моделях.

Пример:

```bash
alembic revision --autogenerate -m "create users table"
```

Сгенерированные файлы должны автоматически сохраняться в:

```text
backend/migrations/versions/
```

## Make-команды

В корне проекта необходимо добавить `Makefile` с командами для работы с миграциями.

### Создание миграции

```makefile
migration:
	alembic revision --autogenerate -m "$(name)"
```

Пример использования:

```bash
make migration name="add_users_table"
```

### Накат миграций

```makefile
migrate:
	alembic upgrade head
```

Пример:

```bash
make migrate
```

### Откат на одну миграцию

```makefile
downgrade:
	alembic downgrade -1
```

Пример:

```bash
make downgrade
```

### Откат до конкретной ревизии

```makefile
downgrade-to:
	alembic downgrade $(revision)
```

Пример:

```bash
make downgrade-to revision=abc123def456
```

### Просмотр текущей ревизии

```makefile
current:
	alembic current
```

### История миграций

```makefile
history:
	alembic history
```

## Критерии готовности

1. В проекте подключён Alembic.
2. В `backend/migrations` присутствуют:

   * `env.py`
   * `versions/`
3. Alembic использует модели из `backend/models`.
4. Автогенерация миграций работает через `alembic revision --autogenerate` и префикс должен начинаться с даты пример 2026-05-31.
5. В корне проекта присутствует `Makefile`.
6. Реализованы команды:

   * `make migrate.gen`
   * `make migrate.up`
   * `make migrate.down`

7. Все новые миграции создаются в `backend/migrations/versions`.
8. Нужен клиент для работы с sqlalchemy в backend/clients/db там нужно прбросить из backend/.env -> backend/settings.py валидацию по конфига для бд ориентируйся на пароль из docker-compose.yml
