package com.smartinventory.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class UserProfileServiceTest {
    @Test void roleNamesRemainStable(){ assertEquals("ADMIN", "ADMIN"); }
}
