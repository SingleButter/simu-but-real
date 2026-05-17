package com.simubutreal.taskapi.model;

import java.time.LocalDate;
import java.util.UUID;

public record TaskItem(
    UUID id,
    String title,
    TaskStatus status,
    LocalDate dueDate,
    int priority
) {
}
