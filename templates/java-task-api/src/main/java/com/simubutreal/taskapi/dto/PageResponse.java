package com.simubutreal.taskapi.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> items,
    int page,
    int size,
    int totalItems,
    int totalPages
) {
}
