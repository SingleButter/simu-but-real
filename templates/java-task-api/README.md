# Java Task API Template

这是 Simu but Real 的第一版 Java 训练项目模板。它模拟一个企业内部任务管理 API，适合分配新人级 bug fix、测试补充和小范围接口改造任务。

## Stack

- Java 21
- Spring Boot 3
- Maven
- JUnit 5

## Local Development

推荐使用 Dev Container，但不强制。

```bash
mvn test
mvn spring-boot:run
```

## Training Task Example

任务：修复任务分页排序问题。

验收标准：

- `GET /api/tasks` 支持按 `dueDate` 升序和降序排序。
- 分页参数 `page` 和 `size` 在排序场景下仍然生效。
- 新增至少 2 个覆盖分页排序的测试。
- 不修改任务创建、状态流转和错误响应格式。
