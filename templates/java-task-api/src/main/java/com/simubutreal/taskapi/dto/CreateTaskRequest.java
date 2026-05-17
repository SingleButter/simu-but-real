package com.simubutreal.taskapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateTaskRequest(
    @NotBlank String title,
    @NotNull LocalDate dueDate,
    int priority
) {
}
