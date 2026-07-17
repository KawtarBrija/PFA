package com.somaport.backend.domain;

public enum AuditEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    ACCOUNT_LOCKED,
    LOGOUT,
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    PASSWORD_RESET
}
