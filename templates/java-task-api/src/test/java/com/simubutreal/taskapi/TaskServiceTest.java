package com.simubutreal.taskapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.simubutreal.taskapi.dto.PageResponse;
import com.simubutreal.taskapi.model.TaskItem;
import com.simubutreal.taskapi.service.TaskService;
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
}
