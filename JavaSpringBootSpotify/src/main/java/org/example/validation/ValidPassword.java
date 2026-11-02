// ===== validation/ValidPassword.java =====
package org.example.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Пароль має містити щонайменше 10 символів, 1 літеру та 1 число або спеціальний символ";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}