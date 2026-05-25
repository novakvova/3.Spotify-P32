package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.services.GlobalSearchService;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
@Tag(name = "Search", description = "Global Search API")
public class GlobalSearchController {
    private final GlobalSearchService searchService;

    @GetMapping("/search")
    @Operation(summary = "Global search", description = "Search in artists, albums and songs")
    @ApiResponse(responseCode = "200", description = "Successful")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String query) {
        return ResponseEntity.ok(searchService.globalSearch(query));
}

}
