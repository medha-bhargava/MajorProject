package com.smartinventory.procurementservice.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/procurements")
public class ProcurementWorkflowController {
    @GetMapping("/workflow")
    public List<WorkflowStep> workflow() {
        return List.of(
                new WorkflowStep("PENDING", "Purchase request created and waiting for approval"),
                new WorkflowStep("APPROVED", "Procurement manager approved the request"),
                new WorkflowStep("IN_PROGRESS", "Purchase order issued to supplier"),
                new WorkflowStep("COMPLETED", "Goods received note recorded and inventory update event published"),
                new WorkflowStep("REJECTED", "Request rejected with business justification")
        );
    }
    public record WorkflowStep(String status, String description) {}
}
