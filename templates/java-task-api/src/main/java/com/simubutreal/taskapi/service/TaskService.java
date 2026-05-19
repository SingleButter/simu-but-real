package com.simubutreal.taskapi.service;

import com.simubutreal.taskapi.dto.CreateTaskRequest;
import com.simubutreal.taskapi.dto.PageResponse;
import com.simubutreal.taskapi.model.TaskItem;
import com.simubutreal.taskapi.model.TaskStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    private final List<TaskItem> tasks = new ArrayList<>();

    public TaskService() {
        tasks.add(new TaskItem(UUID.randomUUID(), "Prepare API review", TaskStatus.TODO, LocalDate.now().plusDays(2), 2));
        tasks.add(new TaskItem(UUID.randomUUID(), "Validate task status changes", TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(1), 1));
        tasks.add(new TaskItem(UUID.randomUUID(), "Write service tests", TaskStatus.TODO, LocalDate.now().plusDays(5), 3));
        tasks.add(new TaskItem(UUID.randomUUID(), "Update README", TaskStatus.DONE, LocalDate.now().plusDays(7), 4));
    }

    public PageResponse<TaskItem> listTasks(int page, int size, String sortBy, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);

        List<TaskItem> sorted = tasks.stream()
            .sorted(resolveComparator(sortBy, direction))
            .toList();

        int fromIndex = Math.min(safePage * safeSize, sorted.size());
        int toIndex = Math.min(fromIndex + safeSize, sorted.size());
        List<TaskItem> items = sorted.subList(fromIndex, toIndex);
        int totalPages = (int) Math.ceil((double) sorted.size() / safeSize);

        return new PageResponse<>(items, safePage, safeSize, sorted.size(), totalPages);
    }

    public TaskItem createTask(CreateTaskRequest request) {
        TaskItem task = new TaskItem(
            UUID.randomUUID(),
            request.title(),
            TaskStatus.TODO,
            request.dueDate(),
            request.priority()
        );
        tasks.add(task);
        return task;
    }

    public TaskItem completeTask(UUID id) {
        return updateTaskStatus(id, TaskStatus.DONE);
    }

    public TaskItem updateTaskStatus(UUID id, TaskStatus status) {
        TaskItem existing = tasks.stream()
            .filter(task -> task.id().equals(id))
            .findFirst()
            .orElseThrow(() -> new NoSuchElementException("Task not found"));

        TaskItem updated = new TaskItem(
            existing.id(),
            existing.title(),
            status,
            existing.dueDate(),
            existing.priority()
        );
        tasks.remove(existing);
        tasks.add(updated);
        return updated;
    }

    private Comparator<TaskItem> resolveComparator(String sortBy, String direction) {
        Comparator<TaskItem> comparator = switch (sortBy) {
            case "priority" -> Comparator.comparing(TaskItem::priority);
            case "title" -> Comparator.comparing(TaskItem::title);
            default -> Comparator.comparing(TaskItem::dueDate);
        };

        if ("desc".equalsIgnoreCase(direction)) {
            return comparator.reversed();
        }

        return comparator;
    }
}
