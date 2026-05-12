package com.smartinventory.userservice.controller;

import com.smartinventory.userservice.dto.*;
import com.smartinventory.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserProfileController {
    private final UserProfileService service;
    public UserProfileController(UserProfileService service){this.service=service;}
    @GetMapping public List<UserProfileResponse> list(){return service.list();}
    @GetMapping("/{id}") public UserProfileResponse get(@PathVariable UUID id){return service.get(id);} 
    @PostMapping public UserProfileResponse create(@Valid @RequestBody UserProfileRequest request){return service.create(request);} 
    @PutMapping("/{id}") public UserProfileResponse update(@PathVariable UUID id, @Valid @RequestBody UserProfileRequest request){return service.update(id, request);} 
    @DeleteMapping("/{id}") public void delete(@PathVariable UUID id){service.delete(id);} 
}
