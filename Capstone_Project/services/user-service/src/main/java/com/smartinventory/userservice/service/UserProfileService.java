package com.smartinventory.userservice.service;

import com.smartinventory.userservice.domain.UserProfile;
import com.smartinventory.userservice.dto.*;
import com.smartinventory.userservice.repository.UserProfileRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {
    private final UserProfileRepository repository;
    public UserProfileService(UserProfileRepository repository){this.repository=repository;}
    public List<UserProfileResponse> list(){return repository.findAll().stream().map(this::toResponse).toList();}
    public UserProfileResponse get(UUID id){return repository.findById(id).map(this::toResponse).orElseThrow(() -> new IllegalArgumentException("User profile not found"));}
    @Transactional public UserProfileResponse create(UserProfileRequest request){return toResponse(repository.save(new UserProfile(request.email(), request.fullName(), request.role(), request.phone(), request.warehouseCode(), request.jobTitle())));} 
    @Transactional public UserProfileResponse update(UUID id, UserProfileRequest request){UserProfile profile=repository.findById(id).orElseThrow(() -> new IllegalArgumentException("User profile not found")); profile.update(request.fullName(), request.role(), request.phone(), request.warehouseCode(), request.jobTitle()); return toResponse(profile);} 
    @Transactional public void delete(UUID id){repository.deleteById(id);} 
    private UserProfileResponse toResponse(UserProfile profile){return new UserProfileResponse(profile.getId(), profile.getEmail(), profile.getFullName(), profile.getRole(), profile.getPhone(), profile.getWarehouseCode(), profile.getJobTitle(), profile.getCreatedAt());}
}
