# FastAPI Endpoint Template

При генерации кода придерживайся существующей архитектуры проекта.

Используй следующую цепочку:

```text
Request → Schema → View → UseCase → Repository → Database
```

Правила:

* FastAPI использует Lifespan.
* Роуты описываются через APIRouter.
* Views содержат только HTTP-логику.
* UseCases содержат бизнес-логику.
* Repositories содержат только работу с БД.
* Все входящие данные валидируются через Pydantic Request Schemas.
* Все ответы возвращаются через Pydantic Response Schemas.
* Используй async/await и type hints.
* Используй Dependency Injection через Depends.
* Перед генерацией анализируй существующую структуру проекта и переиспользуй существующие файлы.

Запрещено:

* SQL в Views.
* ORM в Views.
* ORM в UseCases.
* Бизнес-логика в Views.
* Прямое обращение к БД из Views.
* HTTPException в Repositories.

Всегда соблюдай разделение ответственности:

```text
View → UseCase → Repository → Database
```
