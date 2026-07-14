package com.somaport.backend.exception;

public class NoAllocationAvailableException extends RuntimeException {
    public NoAllocationAvailableException(String message) {
        super(message);
    }
}
