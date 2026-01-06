package com.paymentgateway.payment_gateway.util;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

public class PaymentValidator {

    // VPA (UPI) Validation
    private static final Pattern VPA_PATTERN = Pattern.compile("^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$");

    public static boolean isValidVPA(String vpa) {
        if (vpa == null || vpa.trim().isEmpty()) {
            return false;
        }
        return VPA_PATTERN.matcher(vpa.trim()).matches();
    }

    // Luhn Algorithm for Card Number Validation
    public static boolean isValidCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return false;
        }

        // Remove spaces and dashes
        String cleanedNumber = cardNumber.replaceAll("[\\s\\-]", "");

        // Check if it contains only digits
        if (!cleanedNumber.matches("\\d+")) {
            return false;
        }

        // Check length (between 13 and 19 characters)
        if (cleanedNumber.length() < 13 || cleanedNumber.length() > 19) {
            return false;
        }

        // Apply Luhn algorithm
        int sum = 0;
        boolean alternate = false;

        // Start from the rightmost digit
        for (int i = cleanedNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cleanedNumber.charAt(i));

            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + 1; // Sum of digits (e.g., 16 -> 1+6 = 7)
                }
            }

            sum += digit;
            alternate = !alternate;
        }

        return (sum % 10 == 0);
    }

    // Card Network Detection
    public static String detectCardNetwork(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "unknown";
        }

        // Remove spaces and dashes
        String cleanedNumber = cardNumber.replaceAll("[\\s\\-]", "");

        // Check first digits to determine network
        if (cleanedNumber.startsWith("4")) {
            return "visa";
        } else if (cleanedNumber.matches("^5[1-5].*") || cleanedNumber.matches("^2[2-7].*")) {
            return "mastercard";
        } else if (cleanedNumber.matches("^3[47].*")) {
            return "amex";
        } else if (cleanedNumber.matches("^(6|81|82|508|353|356).*")) {
            return "rupay";
        } else {
            return "unknown";
        }
    }

    // Card Expiry Validation
    public static boolean isValidExpiry(String expiryMonth, String expiryYear) {
        try {
            int month = Integer.parseInt(expiryMonth);
            int year = Integer.parseInt(expiryYear);

            // Validate month range
            if (month < 1 || month > 12) {
                return false;
            }

            // Handle 2-digit year (25 -> 2025)
            if (year < 100) {
                year += 2000;
            }

            // Create YearMonth for expiry date
            YearMonth expiryDate = YearMonth.of(year, month);
            YearMonth currentDate = YearMonth.now();

            // Expiry must be in the future (or current month/year)
            return !expiryDate.isBefore(currentDate);
        } catch (Exception e) {
            return false;
        }
    }

    // Extract last 4 digits of card
    public static String getCardLast4(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return null;
        }

        String cleanedNumber = cardNumber.replaceAll("[\\s\\-]", "");
        
        if (cleanedNumber.length() < 4) {
            return cleanedNumber;
        }

        return cleanedNumber.substring(cleanedNumber.length() - 4);
    }

    // Validate CVV (3 digits for most cards, 4 for Amex)
    public static boolean isValidCVV(String cvv, String cardNetwork) {
        if (cvv == null || !cvv.matches("\\d+")) {
            return false;
        }

        if ("amex".equals(cardNetwork)) {
            return cvv.length() == 4;
        } else {
            return cvv.length() == 3;
        }
    }
}