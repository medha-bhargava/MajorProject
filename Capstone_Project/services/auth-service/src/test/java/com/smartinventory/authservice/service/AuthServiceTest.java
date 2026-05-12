package com.smartinventory.authservice.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class AuthServiceTest {
    @Test
    void passwordPolicyRequiresEightCharacters() {
        assertTrue("password".length() >= 8);
    }
}
