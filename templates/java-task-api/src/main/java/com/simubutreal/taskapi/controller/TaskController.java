package com.simubutreal.taskapi.controller;

import com.simubutreal.taskapi.dto.CreateTaskRequest;
import com.simubutreal.taskapi.dto.PageResponse;
import com.simubutreal.taskapi.model.TaskItem;
import com.simubutreal.taskapi.service.TaskService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public PageResponse<TaskItem> listTasks(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "dueDate") String sortBy,
        @RequestParam(defaultValue = "asc") String direction
    ) {
        return taskService.listTasks(page, size, sortBy, direction);
    }

    @PostMapping
    public TaskItem createTask(@Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @PatchMapping("/{id}/complete")
    public TaskItem completeTask(@PathVariable UUID id) {
        return taskService.completeTask(id);
    }
}
