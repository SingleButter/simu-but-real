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

任务：补全任务状态校验逻辑。

验收标准：

- 已完成任务不能被改回 `TODO` 或 `IN_PROGRESS`。
- 非法状态流转返回清晰的业务错误。
- 新增至少 2 个状态流转相关测试。
- 不修改任务创建接口和响应字段结构。
