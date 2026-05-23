// package org.example.controller;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.example.dtos.RegisterDto;
// import org.example.services.AccountService;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.http.MediaType;
// import org.springframework.web.multipart.MultipartFile;
// import jakarta.validation.ConstraintViolationException;
// import jakarta.validation.ConstraintViolation;

// import java.util.Map;
// import java.util.stream.Collectors;

// // ОПТИМІЗАЦІЯ: використання Slf4j логера замість java.util.logging, видалення закоментованого коду
// @Slf4j
// @RestController
// @RequiredArgsConstructor
// public class RegisterController {
//     private final AccountService accountService;

//     @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//     public ResponseEntity<?> register(@RequestParam("username") String username,
//             @RequestParam("email") String email,
//             @RequestParam("password") String password,
//             @RequestParam("confirmPassword") String confirmPassword,
//             @RequestPart(value = "image", required = false) MultipartFile image) {
//         Map<String, String> response = null;
//         log.info("Received registration request for username: {}", username);
//         try {
//             // ОПТИМІЗАЦІЯ: використання конструктора замість setter для DTO
//             RegisterDto dto = new RegisterDto();
//             dto.setUsername(username);
//             dto.setEmail(email);
//             dto.setPassword(password);
//             dto.setConfirmPassword(confirmPassword);
//             dto.setImage(image);
//             response = accountService.register(dto);
//             // ОПТИМІЗАЦІЯ: заміна HashMap на Map.of() для неізмінної карти
//             return ResponseEntity.status(HttpStatus.CREATED).body(response);
//         } catch (ConstraintViolationException e) {
//             String errors = e.getConstraintViolations()
//                     .stream()
//                     .map(ConstraintViolation::getMessage) // бере "Invalid email", "Password too short" тощо
//                     .collect(Collectors.joining("\n")); // об’єднує через \n

//             log.error("Validation failed: \n----------------------\n{}", errors);
//             System.out.println("\n----------------------\n");
//             response = Map.of("error", errors);
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//         } catch (Exception e) {
//             log.error("Registration failed: \n----------------------", e);
//             System.out.println("\n----------------------\n");
//             // ОПТИМІЗАЦІЯ: заміна HashMap на Map.of()
//             response = Map.of("error", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//         }
//     }

// }
