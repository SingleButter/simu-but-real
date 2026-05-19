package com.simubutreal.taskapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.simubutreal.taskapi.dto.PageResponse;
import com.simubutreal.taskapi.model.TaskItem;
import com.simubutreal.taskapi.model.TaskStatus;
import com.simubutreal.taskapi.service.TaskService;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class TaskServiceTest {
    @Test
    void listTasksKeepsRequestedPageAndSize() {
        TaskService service = new TaskService();

        PageResponse<TaskItem> result = service.listTasks(1, 2, "dueDate", "asc");

        assertThat(result.page()).isEqualTo(1);
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.items()).hasSize(2);
    }

    @Test
    void listTasksCanSortByPriorityDescending() {
        TaskService service = new TaskService();

        PageResponse<TaskItem> result = service.listTasks(0, 2, "priority", "desc");

        assertThat(result.items()).hasSize(2);
        assertThat(result.items().get(0).priority())
            .isGreaterThanOrEqualTo(result.items().get(1).priority());
    }

    @Test
    void updateTaskStatusCanMoveTodoTaskToInProgress() {
        TaskService service = new TaskService();
        UUID taskId = firstTaskWithStatus(service, TaskStatus.TODO).id();

        TaskItem result = service.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);

        assertThat(result.status()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void completeTaskMarksTaskAsDone() {
        TaskService service = new TaskService();
        UUID taskId = firstTaskWithStatus(service, TaskStatus.IN_PROGRESS).id();

        TaskItem result = service.completeTask(taskId);

        assertThat(result.status()).isEqualTo(TaskStatus.DONE);
    }

    private TaskItem firstTaskWithStatus(TaskService service, TaskStatus status) {
        return service.listTasks(0, 10, "dueDate", "asc").items().stream()
            .filter(task -> task.status() == status)
            .findFirst()
            .orElseThrow();
    }
}
