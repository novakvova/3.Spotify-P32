package org.example.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final int MIN = 10;
    private static final int MAX = 72; // межа BCrypt, довше тихо обрізається

    private static final Pattern LETTER = Pattern.compile("\\p{L}");
    private static final Pattern DIGIT_OR_SPECIAL = Pattern.compile("[\\d\\p{P}\\p{S}]");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        int length = value.codePointCount(0, value.length());
        if (length < MIN || length > MAX) {
            return false;
        }
        return LETTER.matcher(value).find() && DIGIT_OR_SPECIAL.matcher(value).find();
    }
}