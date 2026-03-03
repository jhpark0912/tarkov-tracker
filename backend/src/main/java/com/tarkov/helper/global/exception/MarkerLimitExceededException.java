package com.tarkov.helper.global.exception;

public class MarkerLimitExceededException extends RuntimeException {
    public MarkerLimitExceededException(String message) {
        super(message);
    }
}
