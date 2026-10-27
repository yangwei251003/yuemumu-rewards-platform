// Generated from OpenAPI; do not edit.
export const operations = {
  "getHealth": {
    "method": "GET",
    "path": "/health",
    "capability": "VERIFIED"
  },
  "createDemoSession": {
    "method": "POST",
    "path": "/auth/demo-sessions",
    "capability": "VERIFIED"
  },
  "createStaffSession": {
    "method": "POST",
    "path": "/auth/staff-sessions",
    "capability": "VERIFIED"
  },
  "logout": {
    "method": "POST",
    "path": "/auth/logout",
    "capability": "VERIFIED"
  },
  "getMe": {
    "method": "GET",
    "path": "/me",
    "capability": "VERIFIED"
  },
  "getMyWallet": {
    "method": "GET",
    "path": "/wallet",
    "capability": "VERIFIED"
  },
  "listMyLedger": {
    "method": "GET",
    "path": "/ledger",
    "capability": "VERIFIED"
  },
  "listRewards": {
    "method": "GET",
    "path": "/rewards",
    "capability": "VERIFIED"
  },
  "getReward": {
    "method": "GET",
    "path": "/rewards/{rewardId}",
    "capability": "VERIFIED"
  },
  "listActivities": {
    "method": "GET",
    "path": "/activities",
    "capability": "VERIFIED"
  },
  "createActivity": {
    "method": "POST",
    "path": "/activities",
    "capability": "VERIFIED"
  },
  "getActivity": {
    "method": "GET",
    "path": "/activities/{activityId}",
    "capability": "VERIFIED"
  },
  "registerActivity": {
    "method": "POST",
    "path": "/activities/{activityId}/registrations",
    "capability": "VERIFIED"
  },
  "cancelRegistration": {
    "method": "POST",
    "path": "/registrations/{registrationId}/cancel",
    "capability": "VERIFIED"
  },
  "recordAttendance": {
    "method": "POST",
    "path": "/attendance",
    "capability": "VERIFIED"
  },
  "submitEvidence": {
    "method": "POST",
    "path": "/submissions",
    "capability": "VERIFIED"
  },
  "listSubmissions": {
    "method": "GET",
    "path": "/submissions",
    "capability": "VERIFIED"
  },
  "listApprovals": {
    "method": "GET",
    "path": "/approvals",
    "capability": "VERIFIED"
  },
  "decideApproval": {
    "method": "POST",
    "path": "/approvals/{approvalId}/decisions",
    "capability": "VERIFIED"
  },
  "listMyOrders": {
    "method": "GET",
    "path": "/orders",
    "capability": "VERIFIED"
  },
  "createOrder": {
    "method": "POST",
    "path": "/orders",
    "capability": "VERIFIED"
  },
  "getOrder": {
    "method": "GET",
    "path": "/orders/{orderId}",
    "capability": "VERIFIED"
  },
  "cancelOrder": {
    "method": "POST",
    "path": "/orders/{orderId}/cancel",
    "capability": "VERIFIED"
  },
  "issuePickupCredential": {
    "method": "POST",
    "path": "/orders/{orderId}/pickup-credentials",
    "capability": "VERIFIED"
  },
  "previewPickup": {
    "method": "POST",
    "path": "/pickup/preview",
    "capability": "VERIFIED"
  },
  "confirmPickup": {
    "method": "POST",
    "path": "/pickup/confirm",
    "capability": "VERIFIED"
  },
  "createAppeal": {
    "method": "POST",
    "path": "/appeals",
    "capability": "VERIFIED"
  },
  "listAppeals": {
    "method": "GET",
    "path": "/appeals",
    "capability": "VERIFIED"
  },
  "getSession": {
    "method": "GET",
    "path": "/auth/session",
    "capability": "VERIFIED"
  },
  "publishActivity": {
    "method": "POST",
    "path": "/activities/{activityId}/publish",
    "capability": "VERIFIED"
  },
  "completeActivity": {
    "method": "POST",
    "path": "/activities/{activityId}/complete",
    "capability": "VERIFIED"
  },
  "issueAttendanceCode": {
    "method": "POST",
    "path": "/activities/{activityId}/attendance-codes",
    "capability": "VERIFIED"
  },
  "listMyRegistrations": {
    "method": "GET",
    "path": "/registrations",
    "capability": "VERIFIED"
  },
  "verifySubmission": {
    "method": "POST",
    "path": "/submissions/{submissionId}/verify",
    "capability": "VERIFIED"
  },
  "listStaffOrders": {
    "method": "GET",
    "path": "/ops/orders",
    "capability": "VERIFIED"
  },
  "listInventory": {
    "method": "GET",
    "path": "/ops/inventory",
    "capability": "VERIFIED"
  },
  "markOrderReady": {
    "method": "POST",
    "path": "/orders/{orderId}/ready",
    "capability": "VERIFIED"
  },
  "expireOrder": {
    "method": "POST",
    "path": "/orders/{orderId}/expire",
    "capability": "VERIFIED"
  },
  "listRoster": {
    "method": "GET",
    "path": "/roster",
    "capability": "VERIFIED"
  },
  "listProjects": {
    "method": "GET",
    "path": "/projects",
    "capability": "VERIFIED"
  },
  "createProject": {
    "method": "POST",
    "path": "/projects",
    "capability": "VERIFIED"
  },
  "getProject": {
    "method": "GET",
    "path": "/projects/{projectId}",
    "capability": "VERIFIED"
  },
  "updateProjectAllocation": {
    "method": "POST",
    "path": "/projects/{projectId}/allocation",
    "capability": "VERIFIED"
  },
  "confirmProjectAllocation": {
    "method": "POST",
    "path": "/projects/{projectId}/confirm",
    "capability": "VERIFIED"
  },
  "submitProjectStage": {
    "method": "POST",
    "path": "/projects/{projectId}/stages",
    "capability": "VERIFIED"
  },
  "stopProject": {
    "method": "POST",
    "path": "/projects/{projectId}/stop",
    "capability": "VERIFIED"
  },
  "listCompetitions": {
    "method": "GET",
    "path": "/competitions",
    "capability": "VERIFIED"
  },
  "createCompetition": {
    "method": "POST",
    "path": "/competitions",
    "capability": "VERIFIED"
  },
  "submitCompetitionAward": {
    "method": "POST",
    "path": "/competition-awards",
    "capability": "VERIFIED"
  },
  "listAwardRequests": {
    "method": "GET",
    "path": "/award-requests",
    "capability": "VERIFIED"
  },
  "decideAwardRequest": {
    "method": "POST",
    "path": "/award-requests/{awardId}/decisions",
    "capability": "VERIFIED"
  },
  "listLearningUnits": {
    "method": "GET",
    "path": "/learning",
    "capability": "VERIFIED"
  },
  "submitLearning": {
    "method": "POST",
    "path": "/learning/attempts",
    "capability": "VERIFIED"
  },
  "listMyBadges": {
    "method": "GET",
    "path": "/badges",
    "capability": "VERIFIED"
  },
  "listCases": {
    "method": "GET",
    "path": "/cases",
    "capability": "VERIFIED"
  },
  "createCase": {
    "method": "POST",
    "path": "/cases",
    "capability": "VERIFIED"
  },
  "listCaseStatements": {
    "method": "GET",
    "path": "/cases/{caseId}/statements",
    "capability": "VERIFIED"
  },
  "addCaseStatement": {
    "method": "POST",
    "path": "/cases/{caseId}/statements",
    "capability": "VERIFIED"
  },
  "decideCase": {
    "method": "POST",
    "path": "/cases/{caseId}/decisions",
    "capability": "VERIFIED"
  },
  "decideAppeal": {
    "method": "POST",
    "path": "/appeals/{appealId}/decisions",
    "capability": "VERIFIED"
  },
  "listNotifications": {
    "method": "GET",
    "path": "/notifications",
    "capability": "VERIFIED"
  },
  "readNotification": {
    "method": "POST",
    "path": "/notifications/{notificationId}/read",
    "capability": "VERIFIED"
  },
  "listAuditSamples": {
    "method": "GET",
    "path": "/audit-samples",
    "capability": "VERIFIED"
  },
  "createAuditSample": {
    "method": "POST",
    "path": "/audit-samples",
    "capability": "VERIFIED"
  },
  "uploadFile": {
    "method": "POST",
    "path": "/files",
    "capability": "VERIFIED"
  },
  "listMyFiles": {
    "method": "GET",
    "path": "/files",
    "capability": "VERIFIED"
  },
  "getFile": {
    "method": "GET",
    "path": "/files/{fileId}",
    "capability": "VERIFIED"
  },
  "readFileContent": {
    "method": "POST",
    "path": "/files/{fileId}/content",
    "capability": "VERIFIED"
  },
  "createLearningUnit": {
    "method": "POST",
    "path": "/learning/units",
    "capability": "VERIFIED"
  },
  "getLearningUnitManagement": {
    "method": "GET",
    "path": "/learning/units/{unitId}/manage",
    "capability": "VERIFIED"
  },
  "editLearningUnit": {
    "method": "POST",
    "path": "/learning/units/{unitId}/edit",
    "capability": "VERIFIED"
  },
  "publishLearningUnit": {
    "method": "POST",
    "path": "/learning/units/{unitId}/publish",
    "capability": "VERIFIED"
  },
  "retireLearningUnit": {
    "method": "POST",
    "path": "/learning/units/{unitId}/retire",
    "capability": "VERIFIED"
  },
  "claimLearningUnit": {
    "method": "POST",
    "path": "/learning/units/{unitId}/claims",
    "capability": "VERIFIED"
  },
  "listLearningClaims": {
    "method": "GET",
    "path": "/learning/claims",
    "capability": "VERIFIED"
  },
  "listProjectRecruitments": {
    "method": "GET",
    "path": "/project-recruitments",
    "capability": "VERIFIED"
  },
  "createProjectRecruitment": {
    "method": "POST",
    "path": "/project-recruitments",
    "capability": "VERIFIED"
  },
  "applyProject": {
    "method": "POST",
    "path": "/project-recruitments/{recruitmentId}/applications",
    "capability": "VERIFIED"
  },
  "listProjectApplications": {
    "method": "GET",
    "path": "/project-applications",
    "capability": "VERIFIED"
  },
  "decideProjectApplication": {
    "method": "POST",
    "path": "/project-applications/{applicationId}/decision",
    "capability": "VERIFIED"
  },
  "formRecruitedProject": {
    "method": "POST",
    "path": "/project-recruitments/{recruitmentId}/form",
    "capability": "VERIFIED"
  },
  "applyMembership": {
    "method": "POST",
    "path": "/membership-applications",
    "capability": "VERIFIED"
  },
  "listMembershipApplications": {
    "method": "GET",
    "path": "/membership-applications",
    "capability": "VERIFIED"
  },
  "decideMembershipApplication": {
    "method": "POST",
    "path": "/membership-applications/{applicationId}/decision",
    "capability": "VERIFIED"
  },
  "createAcademicTerm": {
    "method": "POST",
    "path": "/academic-terms",
    "capability": "VERIFIED"
  },
  "listAcademicTerms": {
    "method": "GET",
    "path": "/academic-terms",
    "capability": "VERIFIED"
  },
  "createMeeting": {
    "method": "POST",
    "path": "/meetings",
    "capability": "VERIFIED"
  },
  "listMeetings": {
    "method": "GET",
    "path": "/meetings",
    "capability": "VERIFIED"
  },
  "submitMeetingClaim": {
    "method": "POST",
    "path": "/meetings/{meetingId}/claims",
    "capability": "VERIFIED"
  },
  "listMeetingClaims": {
    "method": "GET",
    "path": "/meeting-claims",
    "capability": "VERIFIED"
  },
  "decideMeetingClaim": {
    "method": "POST",
    "path": "/meeting-claims/{claimId}/decision",
    "capability": "VERIFIED"
  },
  "listMyPassiveEligibility": {
    "method": "GET",
    "path": "/passive-eligibility",
    "capability": "VERIFIED"
  },
  "getReportingMonth": {
    "method": "GET",
    "path": "/reporting/month",
    "capability": "VERIFIED"
  },
  "setReportingBudget": {
    "method": "POST",
    "path": "/reporting/budgets",
    "capability": "VERIFIED"
  },
  "listReportingBudgets": {
    "method": "GET",
    "path": "/reporting/budgets",
    "capability": "VERIFIED"
  },
  "recordReportingCost": {
    "method": "POST",
    "path": "/reporting/costs",
    "capability": "VERIFIED"
  },
  "listReportingCosts": {
    "method": "GET",
    "path": "/reporting/costs",
    "capability": "VERIFIED"
  },
  "reverseReportingCost": {
    "method": "POST",
    "path": "/reporting/costs/{costId}/reverse",
    "capability": "VERIFIED"
  },
  "exportReportingCsv": {
    "method": "POST",
    "path": "/reporting/exports",
    "capability": "VERIFIED"
  },
  "previewDemoRosterImport": {
    "method": "POST",
    "path": "/reporting/demo-roster/preview",
    "capability": "VERIFIED"
  },
  "confirmDemoRosterImport": {
    "method": "POST",
    "path": "/reporting/demo-roster/{batchId}/confirm",
    "capability": "VERIFIED"
  },
  "listCommerceSlots": {
    "method": "GET",
    "path": "/commerce/slots",
    "capability": "VERIFIED"
  },
  "createCommerceSlot": {
    "method": "POST",
    "path": "/commerce/slots",
    "capability": "VERIFIED"
  },
  "listCommercePrograms": {
    "method": "GET",
    "path": "/commerce/programs",
    "capability": "VERIFIED"
  },
  "createCommerceProgram": {
    "method": "POST",
    "path": "/commerce/programs",
    "capability": "VERIFIED"
  },
  "listCommerceRequests": {
    "method": "GET",
    "path": "/commerce/requests",
    "capability": "VERIFIED"
  },
  "createCommerceRequest": {
    "method": "POST",
    "path": "/commerce/requests",
    "capability": "VERIFIED"
  },
  "decideCommerceRequest": {
    "method": "POST",
    "path": "/commerce/requests/{requestId}/decisions",
    "capability": "VERIFIED"
  },
  "cancelCommerceRequest": {
    "method": "POST",
    "path": "/commerce/requests/{requestId}/cancel",
    "capability": "VERIFIED"
  },
  "readyCommerceRequest": {
    "method": "POST",
    "path": "/commerce/requests/{requestId}/ready",
    "capability": "VERIFIED"
  },
  "fulfillCommerceRequest": {
    "method": "POST",
    "path": "/commerce/requests/{requestId}/fulfill",
    "capability": "VERIFIED"
  },
  "listCommerceStockRequests": {
    "method": "GET",
    "path": "/commerce/stock-requests",
    "capability": "VERIFIED"
  },
  "createCommerceStockRequest": {
    "method": "POST",
    "path": "/commerce/stock-requests",
    "capability": "VERIFIED"
  },
  "decideCommerceStockRequest": {
    "method": "POST",
    "path": "/commerce/stock-requests/{requestId}/decisions",
    "capability": "VERIFIED"
  },
  "listCommerceReturns": {
    "method": "GET",
    "path": "/commerce/returns",
    "capability": "VERIFIED"
  },
  "createCommerceReturn": {
    "method": "POST",
    "path": "/commerce/returns",
    "capability": "VERIFIED"
  },
  "decideCommerceReturn": {
    "method": "POST",
    "path": "/commerce/returns/{returnId}/decisions",
    "capability": "VERIFIED"
  },
  "receiveCommerceReturn": {
    "method": "POST",
    "path": "/commerce/returns/{returnId}/receive",
    "capability": "VERIFIED"
  },
  "inspectCommerceReturn": {
    "method": "POST",
    "path": "/commerce/returns/{returnId}/inspect",
    "capability": "VERIFIED"
  },
  "readCommerceRequestFile": {
    "method": "POST",
    "path": "/commerce/requests/{requestId}/files/{fileId}/content",
    "capability": "VERIFIED"
  },
  "readCommerceReturnFile": {
    "method": "POST",
    "path": "/commerce/returns/{returnId}/files/{fileId}/content",
    "capability": "VERIFIED"
  },
  "listCommerceWishes": {
    "method": "GET",
    "path": "/commerce/wishes",
    "capability": "VERIFIED"
  },
  "createCommerceWish": {
    "method": "POST",
    "path": "/commerce/wishes",
    "capability": "VERIFIED"
  },
  "reviewCommerceWish": {
    "method": "POST",
    "path": "/commerce/wishes/{wishId}/review",
    "capability": "VERIFIED"
  },
  "createConversionGoal": {
    "method": "POST",
    "path": "/conversion-goals",
    "capability": "VERIFIED"
  },
  "listConversionGoals": {
    "method": "GET",
    "path": "/conversion-goals",
    "capability": "VERIFIED"
  },
  "submitConversionRequest": {
    "method": "POST",
    "path": "/conversion-goals/{goalId}/requests",
    "capability": "VERIFIED"
  },
  "listConversionRequests": {
    "method": "GET",
    "path": "/conversion-requests",
    "capability": "VERIFIED"
  },
  "decideConversionRequest": {
    "method": "POST",
    "path": "/conversion-requests/{requestId}/decision",
    "capability": "VERIFIED"
  },
  "listPointAdjustments": {
    "method": "GET",
    "path": "/point-adjustments",
    "capability": "VERIFIED"
  },
  "createPointAdjustment": {
    "method": "POST",
    "path": "/point-adjustments",
    "capability": "VERIFIED"
  },
  "decidePointAdjustment": {
    "method": "POST",
    "path": "/point-adjustments/{adjustmentId}/decisions",
    "capability": "VERIFIED"
  },
  "getWalletReconciliation": {
    "method": "GET",
    "path": "/wallet-reconciliation/{userId}",
    "capability": "VERIFIED"
  },
  "resubmitActivityEvidence": {
    "method": "POST",
    "path": "/submissions/{submissionId}/resubmit",
    "capability": "VERIFIED"
  },
  "listActivityEvidenceRevisions": {
    "method": "GET",
    "path": "/submissions/{submissionId}/revisions",
    "capability": "VERIFIED"
  },
  "listCaseReviewRounds": {
    "method": "GET",
    "path": "/cases/{caseId}/review-rounds",
    "capability": "VERIFIED"
  },
  "createCaseReviewRound": {
    "method": "POST",
    "path": "/cases/{caseId}/review-rounds",
    "capability": "VERIFIED"
  },
  "decideCaseReviewRound": {
    "method": "POST",
    "path": "/case-review-rounds/{reviewId}/decisions",
    "capability": "VERIFIED"
  },
  "requestLearningRevocation": {
    "method": "POST",
    "path": "/award-requests/{awardId}/revocations",
    "capability": "VERIFIED"
  },
  "listAccessStaff": {
    "method": "GET",
    "path": "/access/staff",
    "capability": "VERIFIED"
  },
  "listAccessRequests": {
    "method": "GET",
    "path": "/access/requests",
    "capability": "VERIFIED"
  },
  "createAccessRequest": {
    "method": "POST",
    "path": "/access/requests",
    "capability": "VERIFIED"
  },
  "decideAccessRequest": {
    "method": "POST",
    "path": "/access/requests/{requestId}/decisions",
    "capability": "VERIFIED"
  },
  "listAccessEvents": {
    "method": "GET",
    "path": "/access/events",
    "capability": "VERIFIED"
  },
  "requestConversionCorrection": {
    "method": "POST",
    "path": "/conversion-requests/{requestId}/correction",
    "capability": "VERIFIED"
  },
  "getStudentPracticeFeed": {
    "method": "GET",
    "path": "/me/practice-feed",
    "capability": "IMPLEMENTED"
  },
  "getApprovalDetail": {
    "method": "GET",
    "path": "/approvals/{approvalId}",
    "capability": "IMPLEMENTED"
  }
} as const;
