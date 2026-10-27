export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Non-sensitive service health */
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/demo-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Demo-only; requires private demo access code, allowlisted identities */
        post: operations["createDemoSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/staff-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Local staff login; server sets HttpOnly staff session */
        post: operations["createStaffSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Invalidate selected server session */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current principal, never client-selected roles */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wallet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own spendable, reserved and growth values */
        get: operations["getMyWallet"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ledger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own ledger entries */
        get: operations["listMyLedger"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rewards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reward catalog with server-calculated availability */
        get: operations["listRewards"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rewards/{rewardId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reward detail */
        get: operations["getReward"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Available activities */
        get: operations["listActivities"];
        put?: never;
        /** createActivity */
        post: operations["createActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities/{activityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Activity detail */
        get: operations["getActivity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities/{activityId}/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register or waitlist; atomic capacity check */
        post: operations["registerActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/registrations/{registrationId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel own registration */
        post: operations["cancelRegistration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/attendance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Validate time-bound token; not automatically grant all points */
        post: operations["recordAttendance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/submissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listSubmissions */
        get: operations["listSubmissions"];
        put?: never;
        /** Create evidence submission; dedupe business artifact */
        post: operations["submitEvidence"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/approvals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Scoped independent reviewer queue */
        get: operations["listApprovals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/approvals/{approvalId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Independent decision; if final, domain transaction grants entitlement */
        post: operations["decideApproval"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own redemption orders */
        get: operations["listMyOrders"];
        put?: never;
        /** Atomically reserve points and stock; application rewards use separate workflow */
        post: operations["createOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{orderId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own or scoped staff order detail */
        get: operations["getOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{orderId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Atomic release; only eligible non-fulfilled states */
        post: operations["cancelOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{orderId}/pickup-credentials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create/rotate short-lived pickup token for owner; never fulfill */
        post: operations["issuePickupCredential"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pickup/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Read-only token check; no fulfillment, no token in query/log */
        post: operations["previewPickup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pickup/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Explicit authenticated staff confirmation; atomic transition */
        post: operations["confirmPickup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAppeals */
        get: operations["listAppeals"];
        put?: never;
        /** Create own appeal against delivered decision */
        post: operations["createAppeal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Restore selected verified session and CSRF context */
        get: operations["getSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities/{activityId}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** publishActivity */
        post: operations["publishActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities/{activityId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** completeActivity */
        post: operations["completeActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activities/{activityId}/attendance-codes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** issueAttendanceCode */
        post: operations["issueAttendanceCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMyRegistrations */
        get: operations["listMyRegistrations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/submissions/{submissionId}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** verifySubmission */
        post: operations["verifySubmission"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ops/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listStaffOrders */
        get: operations["listStaffOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ops/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listInventory */
        get: operations["listInventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{orderId}/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** markOrderReady */
        post: operations["markOrderReady"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{orderId}/expire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** expireOrder */
        post: operations["expireOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roster": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listRoster */
        get: operations["listRoster"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listProjects */
        get: operations["listProjects"];
        put?: never;
        /** createProject */
        post: operations["createProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getProject */
        get: operations["getProject"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/allocation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** updateProjectAllocation */
        post: operations["updateProjectAllocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** confirmProjectAllocation */
        post: operations["confirmProjectAllocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/stages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitProjectStage */
        post: operations["submitProjectStage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** stopProject */
        post: operations["stopProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/competitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCompetitions */
        get: operations["listCompetitions"];
        put?: never;
        /** createCompetition */
        post: operations["createCompetition"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/competition-awards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitCompetitionAward */
        post: operations["submitCompetitionAward"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/award-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAwardRequests */
        get: operations["listAwardRequests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/award-requests/{awardId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideAwardRequest */
        post: operations["decideAwardRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listLearningUnits */
        get: operations["listLearningUnits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/attempts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitLearning */
        post: operations["submitLearning"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/badges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMyBadges */
        get: operations["listMyBadges"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCases */
        get: operations["listCases"];
        put?: never;
        /** createCase */
        post: operations["createCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{caseId}/statements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCaseStatements */
        get: operations["listCaseStatements"];
        put?: never;
        /** addCaseStatement */
        post: operations["addCaseStatement"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{caseId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideCase */
        post: operations["decideCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/appeals/{appealId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideAppeal */
        post: operations["decideAppeal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listNotifications */
        get: operations["listNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/{notificationId}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** readNotification */
        post: operations["readNotification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit-samples": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAuditSamples */
        get: operations["listAuditSamples"];
        put?: never;
        /** createAuditSample */
        post: operations["createAuditSample"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMyFiles */
        get: operations["listMyFiles"];
        put?: never;
        /** uploadFile */
        post: operations["uploadFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getFile */
        get: operations["getFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/{fileId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** readFileContent */
        post: operations["readFileContent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createLearningUnit */
        post: operations["createLearningUnit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units/{unitId}/manage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getLearningUnitManagement */
        get: operations["getLearningUnitManagement"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units/{unitId}/edit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** editLearningUnit */
        post: operations["editLearningUnit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units/{unitId}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** publishLearningUnit */
        post: operations["publishLearningUnit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units/{unitId}/retire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** retireLearningUnit */
        post: operations["retireLearningUnit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/units/{unitId}/claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** claimLearningUnit */
        post: operations["claimLearningUnit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/learning/claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listLearningClaims */
        get: operations["listLearningClaims"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-recruitments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listProjectRecruitments */
        get: operations["listProjectRecruitments"];
        put?: never;
        /** createProjectRecruitment */
        post: operations["createProjectRecruitment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-recruitments/{recruitmentId}/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** applyProject */
        post: operations["applyProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listProjectApplications */
        get: operations["listProjectApplications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-applications/{applicationId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideProjectApplication */
        post: operations["decideProjectApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-recruitments/{recruitmentId}/form": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** formRecruitedProject */
        post: operations["formRecruitedProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/membership-applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMembershipApplications */
        get: operations["listMembershipApplications"];
        put?: never;
        /** applyMembership */
        post: operations["applyMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/membership-applications/{applicationId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideMembershipApplication */
        post: operations["decideMembershipApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/academic-terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAcademicTerms */
        get: operations["listAcademicTerms"];
        put?: never;
        /** createAcademicTerm */
        post: operations["createAcademicTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meetings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMeetings */
        get: operations["listMeetings"];
        put?: never;
        /** createMeeting */
        post: operations["createMeeting"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meetings/{meetingId}/claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitMeetingClaim */
        post: operations["submitMeetingClaim"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meeting-claims": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMeetingClaims */
        get: operations["listMeetingClaims"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meeting-claims/{claimId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideMeetingClaim */
        post: operations["decideMeetingClaim"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/passive-eligibility": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listMyPassiveEligibility */
        get: operations["listMyPassiveEligibility"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/month": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getReportingMonth */
        get: operations["getReportingMonth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/budgets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listReportingBudgets */
        get: operations["listReportingBudgets"];
        put?: never;
        /** setReportingBudget */
        post: operations["setReportingBudget"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/costs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listReportingCosts */
        get: operations["listReportingCosts"];
        put?: never;
        /** recordReportingCost */
        post: operations["recordReportingCost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/costs/{costId}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** reverseReportingCost */
        post: operations["reverseReportingCost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** exportReportingCsv */
        post: operations["exportReportingCsv"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/demo-roster/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** previewDemoRosterImport */
        post: operations["previewDemoRosterImport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reporting/demo-roster/{batchId}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** confirmDemoRosterImport */
        post: operations["confirmDemoRosterImport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/slots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommerceSlots */
        get: operations["listCommerceSlots"];
        put?: never;
        /** createCommerceSlot */
        post: operations["createCommerceSlot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/programs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommercePrograms */
        get: operations["listCommercePrograms"];
        put?: never;
        /** createCommerceProgram */
        post: operations["createCommerceProgram"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommerceRequests */
        get: operations["listCommerceRequests"];
        put?: never;
        /** createCommerceRequest */
        post: operations["createCommerceRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests/{requestId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideCommerceRequest */
        post: operations["decideCommerceRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests/{requestId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** cancelCommerceRequest */
        post: operations["cancelCommerceRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests/{requestId}/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** readyCommerceRequest */
        post: operations["readyCommerceRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests/{requestId}/fulfill": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** fulfillCommerceRequest */
        post: operations["fulfillCommerceRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/stock-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommerceStockRequests */
        get: operations["listCommerceStockRequests"];
        put?: never;
        /** createCommerceStockRequest */
        post: operations["createCommerceStockRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/stock-requests/{requestId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideCommerceStockRequest */
        post: operations["decideCommerceStockRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/returns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommerceReturns */
        get: operations["listCommerceReturns"];
        put?: never;
        /** createCommerceReturn */
        post: operations["createCommerceReturn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/returns/{returnId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideCommerceReturn */
        post: operations["decideCommerceReturn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/returns/{returnId}/receive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** receiveCommerceReturn */
        post: operations["receiveCommerceReturn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/returns/{returnId}/inspect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** inspectCommerceReturn */
        post: operations["inspectCommerceReturn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/requests/{requestId}/files/{fileId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** readCommerceRequestFile */
        post: operations["readCommerceRequestFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/returns/{returnId}/files/{fileId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** readCommerceReturnFile */
        post: operations["readCommerceReturnFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/wishes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCommerceWishes */
        get: operations["listCommerceWishes"];
        put?: never;
        /** createCommerceWish */
        post: operations["createCommerceWish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/commerce/wishes/{wishId}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** reviewCommerceWish */
        post: operations["reviewCommerceWish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/conversion-goals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listConversionGoals */
        get: operations["listConversionGoals"];
        put?: never;
        /** createConversionGoal */
        post: operations["createConversionGoal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/conversion-goals/{goalId}/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitConversionRequest */
        post: operations["submitConversionRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/conversion-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listConversionRequests */
        get: operations["listConversionRequests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/conversion-requests/{requestId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideConversionRequest */
        post: operations["decideConversionRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/point-adjustments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listPointAdjustments */
        get: operations["listPointAdjustments"];
        put?: never;
        /** createPointAdjustment */
        post: operations["createPointAdjustment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/point-adjustments/{adjustmentId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decidePointAdjustment */
        post: operations["decidePointAdjustment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wallet-reconciliation/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getWalletReconciliation */
        get: operations["getWalletReconciliation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/submissions/{submissionId}/resubmit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** resubmitActivityEvidence */
        post: operations["resubmitActivityEvidence"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/submissions/{submissionId}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listActivityEvidenceRevisions */
        get: operations["listActivityEvidenceRevisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{caseId}/review-rounds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCaseReviewRounds */
        get: operations["listCaseReviewRounds"];
        put?: never;
        /** createCaseReviewRound */
        post: operations["createCaseReviewRound"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/case-review-rounds/{reviewId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideCaseReviewRound */
        post: operations["decideCaseReviewRound"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/award-requests/{awardId}/revocations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** requestLearningRevocation */
        post: operations["requestLearningRevocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/access/staff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAccessStaff */
        get: operations["listAccessStaff"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/access/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAccessRequests */
        get: operations["listAccessRequests"];
        put?: never;
        /** createAccessRequest */
        post: operations["createAccessRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/access/requests/{requestId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** decideAccessRequest */
        post: operations["decideAccessRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/access/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listAccessEvents */
        get: operations["listAccessEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/conversion-requests/{requestId}/correction": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 请求独立双审降低原转化奖励 */
        post: operations["requestConversionCorrection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/practice-feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getStudentPracticeFeed */
        get: operations["getStudentPracticeFeed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/approvals/{approvalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getApprovalDetail */
        get: operations["getApprovalDetail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Problem: {
            code: string;
            message: string;
            requestId: string;
            details?: {
                [key: string]: unknown;
            };
        };
        Health: {
            /** @enum {string} */
            status: "ok" | "degraded";
            /** @enum {string} */
            appMode: "demo" | "pilot" | "production";
            version: string;
            contractSha256: string;
            databaseReady: boolean;
        };
        User: {
            id: string;
            displayName: string;
            roles: ("STUDENT" | "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR" | "SYSTEM_ADMIN")[];
            /** @enum {string} */
            membershipStatus: "VISITOR" | "PENDING" | "ACTIVE" | "RESTRICTED";
            demoOnly: boolean;
        };
        Session: {
            user: components["schemas"]["User"];
            /** @enum {string} */
            audience: "student" | "staff";
            /** Format: date-time */
            expiresAt: string;
            requestId: string;
            csrfToken: string;
            /** @description Only returned for explicit student bearer transport. Never persist in logs. */
            accessToken: string | null;
        };
        DemoLoginRequest: {
            demoUserId: string;
            /** @enum {string} */
            audience: "student" | "staff";
            accessCode: string;
            /**
             * @default cookie
             * @enum {string}
             */
            transport: "cookie" | "bearer";
        };
        StaffLoginRequest: {
            login: string;
            password: string;
        };
        Wallet: {
            availablePoints: number;
            frozenPoints: number;
            investigationFrozenPoints: number;
            growthMileage: number;
            recoveryDue: number;
            version: number;
            pendingApprovalPoints: number;
            pendingEligibilityPoints: number;
        };
        LedgerEntry: {
            id: string;
            transactionId: string;
            /** @enum {string} */
            kind: "EARN" | "RESERVE" | "RELEASE" | "SPEND" | "REVERSE" | "EXPIRE" | "RECOVERY" | "REFUND";
            deltaAvailable: number;
            deltaReserved: number;
            sourceType: string;
            sourceId: string;
            ruleVersion: string;
            /** Format: date-time */
            createdAt: string;
            reason: string;
        };
        Reward: {
            id: string;
            name: string;
            category: string;
            /** @enum {string} */
            kind: "physical" | "service" | "application";
            pointsRequired: number;
            /** @enum {string} */
            pointsMode: "THRESHOLD_ONLY" | "SPEND_ON_FULFILLMENT";
            availableQuantity: number;
            imageUrl: string | null;
            isIllustration: boolean;
            demoOnly: boolean;
            requiresApproval: boolean;
            version: number;
        };
        Activity: {
            id: string;
            title: string;
            /** @enum {string} */
            status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
            /** Format: date-time */
            startsAt: string | null;
            /** Format: date-time */
            endsAt: string | null;
            capacity: number;
            registeredCount: number;
            ruleCode: string;
            pointsPreview: number;
            completionRequirements: string;
            version: number;
        };
        Registration: {
            id: string;
            activityId: string;
            userId: string;
            /** @enum {string} */
            status: "REGISTERED" | "WAITLISTED" | "CANCELLED" | "ATTENDED" | "NO_SHOW";
            version: number;
        };
        RegisterRequest: {
            activityVersion: number;
            acceptedRuleVersion: string;
        };
        CancelRequest: {
            expectedVersion: number;
            reason: string;
        };
        AttendanceRequest: {
            activityId: string;
            token: string;
            /** @enum {string} */
            phase: "START" | "END";
        };
        AttendanceResult: {
            activityId: string;
            /** @enum {string} */
            phase: "START" | "END";
            /** Format: date-time */
            recordedAt: string;
            /** @enum {string} */
            completionStatus: "PARTIAL" | "PENDING_VERIFICATION" | "VERIFIED";
            requestId: string;
        };
        SubmissionRequest: {
            /** @enum {string} */
            sourceType: "ACTIVITY" | "PROJECT" | "COMPETITION" | "CONTENT" | "ASSESSMENT";
            sourceId: string;
            artifactId: string;
            evidenceFileIds: string[];
            description: string;
        };
        Submission: {
            id: string;
            sourceType: string;
            sourceId: string;
            /** @enum {string} */
            status: "DRAFT" | "SUBMITTED" | "NEEDS_CHANGES" | "APPROVED" | "REJECTED";
            version: number;
            applicantId: string;
            artifactId: string;
            description: string;
            evidenceFileIds: string[];
            approvalId: string | null;
            factVerified: boolean;
        };
        Approval: {
            id: string;
            sourceType: string;
            sourceId: string;
            applicantId: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";
            proposedPoints: number;
            requiredDistinctApprovers: number;
            completedApprovers: number;
            ruleVersion: string;
            version: number;
            factVerified: boolean;
        };
        DecisionRequest: {
            /** @enum {string} */
            decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
            reason: string;
            expectedVersion: number;
        };
        OrderRequest: {
            rewardId: string;
            quantity: number;
            expectedRewardVersion: number;
            pickupSiteId: string;
            serviceSlotId?: string | null;
        };
        Order: {
            id: string;
            userId: string;
            rewardId: string;
            rewardNameSnapshot: string;
            quantity: number;
            totalPoints: number;
            /** @enum {string} */
            status: "PREPARING" | "READY" | "FULFILLED" | "CANCELLED" | "EXPIRED" | "RETURN_REQUESTED" | "RETURNED";
            pickupSiteId: string;
            /** Format: date-time */
            readyAt: string | null;
            /** Format: date-time */
            expiresAt: string | null;
            version: number;
            requestId: string;
        };
        Credential: {
            orderId: string;
            token: string;
            displayCode: string;
            /** Format: date-time */
            expiresAt: string;
        };
        PreviewRequest: {
            token: string;
        };
        PickupPreview: {
            orderId: string;
            rewardName: string;
            quantity: number;
            maskedDisplayName: string;
            siteId: string;
            status: string;
            version: number;
            eligible: boolean;
        };
        PickupConfirmRequest: {
            token: string;
            orderId: string;
            expectedVersion: number;
        };
        AppealRequest: {
            decisionId: string;
            reason: string;
            evidenceFileIds: string[];
        };
        Appeal: {
            id: string;
            decisionId: string;
            /** @enum {string} */
            status: "SUBMITTED" | "UNDER_REVIEW" | "UPHELD" | "AMENDED" | "REVOKED" | "CONTINUED";
            version: number;
            caseId: string;
            userId: string;
            reason: string;
            evidenceFileIds: string[];
            /** Format: date-time */
            dueAt: string;
            overdue: boolean;
            requiredDistinctApprovers: number;
            completedApprovers: number;
            continuationReviewId?: string | null;
        };
        LedgerEntryPage: {
            items: components["schemas"]["LedgerEntry"][];
            nextCursor: string | null;
        };
        RewardPage: {
            items: components["schemas"]["Reward"][];
            nextCursor: string | null;
        };
        ActivityPage: {
            items: components["schemas"]["Activity"][];
            nextCursor: string | null;
        };
        ApprovalPage: {
            items: components["schemas"]["Approval"][];
            nextCursor: string | null;
        };
        OrderPage: {
            items: components["schemas"]["Order"][];
            nextCursor: string | null;
        };
        AudienceRequest: {
            /** @enum {string} */
            audience: "student" | "staff";
        };
        Ok: {
            ok: boolean;
            requestId: string;
        };
        ActivityCreateRequest: {
            title: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            capacity: number;
            /** @enum {string} */
            ruleCode: "WORKSHOP_2H" | "TRAINING_4H" | "CAMP_8H" | "CAMP_16H";
            completionRequirements: string;
        };
        VersionRequest: {
            expectedVersion: number;
        };
        AttendanceCodeRequest: {
            /** @enum {string} */
            phase: "START" | "END";
        };
        AttendanceCode: {
            activityId: string;
            /** @enum {string} */
            phase: "START" | "END";
            token: string;
            /** Format: date-time */
            expiresAt: string;
        };
        FactRequest: {
            expectedVersion: number;
            reason: string;
        };
        RegistrationPage: {
            items: components["schemas"]["Registration"][];
            nextCursor: string | null;
        };
        SubmissionPage: {
            items: components["schemas"]["Submission"][];
            nextCursor: string | null;
        };
        InventoryItem: {
            rewardId: string;
            siteId: string;
            onHand: number;
            reserved: number;
            quarantine: number;
            available: number;
            version: number;
            demoOnly: boolean;
        };
        InventoryPage: {
            items: components["schemas"]["InventoryItem"][];
            nextCursor: string | null;
        };
        MemberShare: {
            userId: string;
            basisPoints: number;
        };
        CompetitionMember: {
            userId: string;
            /** @enum {integer} */
            coefficientBasisPoints: 10000 | 8000 | 6000 | 4000 | 3000 | 2000;
        };
        Project: {
            id: string;
            title: string;
            /** @enum {string} */
            tier: "P0" | "P1" | "P2" | "P3";
            poolPoints: number;
            /** @enum {string} */
            status: "ACTIVE" | "COMPLETED" | "STOPPED";
            creatorId: string;
            allocationVersion: number;
            completedStage: number;
            version: number;
            members: components["schemas"]["MemberShare"][];
            confirmedMemberIds: string[];
            paidTargets: {
                [key: string]: number;
            };
        };
        ProjectCreateRequest: {
            title: string;
            /** @enum {string} */
            tier: "P0" | "P1" | "P2" | "P3";
            poolPoints: number;
            members: components["schemas"]["MemberShare"][];
        };
        AllocationRequest: {
            expectedVersion: number;
            members: components["schemas"]["MemberShare"][];
            reason: string;
        };
        ConfirmAllocationRequest: {
            allocationVersion: number;
        };
        ProjectStageRequest: {
            expectedVersion: number;
            stage: number;
            artifactId: string;
            evidenceFileIds: string[];
            description: string;
        };
        Competition: {
            id: string;
            title: string;
            series: string;
            edition: string;
            awardTrack: string;
            allowedLevels: ("SCHOOL" | "CITY" | "PROVINCE" | "NATIONAL" | "INTERNATIONAL")[];
            description: string;
            version: number;
        };
        CompetitionCreateRequest: {
            title: string;
            series: string;
            edition: string;
            awardTrack: string;
            allowedLevels: ("SCHOOL" | "CITY" | "PROVINCE" | "NATIONAL" | "INTERNATIONAL")[];
            description: string;
        };
        CompetitionAwardRequest: {
            competitionId: string;
            artifactId: string;
            /** @enum {string} */
            level: "SCHOOL" | "CITY" | "PROVINCE" | "NATIONAL" | "INTERNATIONAL";
            rank: number;
            members: components["schemas"]["CompetitionMember"][];
            correction: boolean;
            evidenceFileIds: string[];
            description: string;
        };
        AwardDetails: {
            stage?: number;
            allocationVersion?: number;
            level?: string;
            rank?: number;
            correction?: boolean;
            unitId?: string;
            score?: number;
            badgeCode?: string | null;
            members?: components["schemas"]["CompetitionMember"][];
            unitVersion?: number;
            publicationUrl?: string | null;
            roleContribution?: string | null;
            revokesAwardId?: string;
            /** @enum {string} */
            revocationMode?: "POINTS_ONLY" | "BADGE_ONLY" | "POINTS_AND_BADGE";
        };
        AwardRequest: {
            id: string;
            /** @enum {string} */
            kind: "PROJECT_STAGE" | "COMPETITION" | "TRAINING" | "CONTENT" | "ASSESSMENT";
            sourceId: string;
            artifactId: string;
            applicantId: string;
            targets: {
                [key: string]: number;
            };
            details: components["schemas"]["AwardDetails"];
            description: string;
            evidenceFileIds: string[];
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED";
            requiredDistinctApprovers: number;
            completedApprovers: number;
            version: number;
            ruleVersion: string;
        };
        Question: {
            id: string;
            prompt: string;
            options: string[];
        };
        LearningUnit: {
            id: string;
            title: string;
            /** @enum {string} */
            kind: "TRAINING" | "CONTENT" | "ASSESSMENT";
            ruleCode: string;
            points: number;
            description: string;
            requirements: string;
            questions: components["schemas"]["Question"][];
            badgeCode: string | null;
            version: number;
            /** @enum {string} */
            status: "DRAFT" | "PUBLISHED" | "RETIRED";
            managed: boolean;
            capacity: number;
        };
        LearningSubmissionRequest: {
            unitId: string;
            artifactId: string;
            answers: number[];
            evidenceFileIds: string[];
            description: string;
            authorizationConfirmed: boolean;
            unitVersion?: number;
            publicationUrl?: string;
            roleContribution?: string;
        };
        LearningAttempt: {
            id: string;
            unitId: string;
            score: number;
            passed: boolean;
            awardRequestId: string | null;
        };
        SkillBadge: {
            badgeCode: string;
            requestId: string;
            /** @enum {string} */
            status: "ACTIVE" | "REVOKED";
            /** Format: date-time */
            awardedAt: string;
        };
        RosterUser: {
            id: string;
            displayName: string;
            roles: string[];
            membershipStatus: string;
            demoOnly: boolean;
        };
        ProjectPage: {
            items: components["schemas"]["Project"][];
            nextCursor: string | null;
        };
        CompetitionPage: {
            items: components["schemas"]["Competition"][];
            nextCursor: string | null;
        };
        AwardRequestPage: {
            items: components["schemas"]["AwardRequest"][];
            nextCursor: string | null;
        };
        LearningUnitPage: {
            items: components["schemas"]["LearningUnit"][];
            nextCursor: string | null;
        };
        SkillBadgePage: {
            items: components["schemas"]["SkillBadge"][];
            nextCursor: string | null;
        };
        RosterUserPage: {
            items: components["schemas"]["RosterUser"][];
            nextCursor: string | null;
        };
        CaseCreateRequest: {
            subjectId: string;
            /** @enum {string} */
            caseType: "REGISTRATION_NO_SHOW" | "PICKUP_NO_SHOW" | "DUPLICATE_ARTIFACT" | "SAFETY" | "OTHER";
            resourceId: string;
            severity: number;
            description: string;
            evidenceFileIds: string[];
            /** Format: date-time */
            occurredAt: string;
        };
        GovernanceCase: {
            id: string;
            subjectId: string;
            caseType: string;
            resourceId: string;
            severity: number;
            description: string;
            evidenceFileIds: string[];
            /** @enum {string} */
            status: "OPEN" | "PARTIAL_APPROVAL" | "CONFIRMED" | "DISMISSED" | "REVOKED";
            proposedDays: number;
            /** @enum {string} */
            restrictionScope: "REGISTRATION" | "REDEMPTION" | "BOTH";
            decisionId: string | null;
            /** Format: date-time */
            deliveredAt: string | null;
            /** Format: date-time */
            occurredAt: string;
            version: number;
        };
        CaseStatementRequest: {
            statement: string;
            evidenceFileIds: string[];
        };
        CaseStatement: {
            id: string;
            caseId: string;
            actorId: string;
            statement: string;
            evidenceFileIds: string[];
            /** Format: date-time */
            createdAt: string;
        };
        CaseDecisionRequest: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "CONFIRM" | "DISMISS";
            reason: string;
        };
        AppealDecisionRequest: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "UPHOLD" | "REVOKE";
            reason: string;
        };
        Notification: {
            id: string;
            eventType: string;
            resourceId: string;
            message: string;
            /** Format: date-time */
            readAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        AuditSampleRequest: {
            month: string;
            seed: string;
        };
        AuditSample: {
            id: string;
            month: string;
            seed: string;
            population: string[];
            selected: string[];
            highRisk: string[];
            /** Format: date-time */
            createdAt: string;
        };
        GovernanceCasePage: {
            items: components["schemas"]["GovernanceCase"][];
            nextCursor: string | null;
        };
        CaseStatementPage: {
            items: components["schemas"]["CaseStatement"][];
            nextCursor: string | null;
        };
        AppealPage: {
            items: components["schemas"]["Appeal"][];
            nextCursor: string | null;
        };
        NotificationPage: {
            items: components["schemas"]["Notification"][];
            nextCursor: string | null;
        };
        AuditSamplePage: {
            items: components["schemas"]["AuditSample"][];
            nextCursor: string | null;
        };
        FileUploadRequest: {
            filename: string;
            /** @enum {string} */
            mimeType: "image/png" | "image/jpeg" | "text/plain";
            base64Data: string;
            /** @enum {string} */
            purpose: "EVIDENCE" | "LICENSE";
            /** @enum {boolean} */
            simulatedOnly: true;
        };
        PrivateFile: {
            id: string;
            ownerId: string;
            filename: string;
            /** @enum {string} */
            mimeType: "image/png" | "image/jpeg" | "text/plain";
            byteSize: number;
            sha256: string;
            /** @enum {string} */
            purpose: "EVIDENCE" | "LICENSE";
            /** @enum {string} */
            visibility: "PRIVATE";
            /** Format: date-time */
            createdAt: string;
        };
        PrivateFilePage: {
            items: components["schemas"]["PrivateFile"][];
            nextCursor: string | null;
        };
        FileContent: {
            file: components["schemas"]["PrivateFile"];
            base64Data: string;
        };
        LearningUnitDraft: {
            title: string;
            /** @enum {string} */
            ruleCode: "TRAINING_2H" | "TRAINING_8H" | "TRAINING_16H" | "SKILL_I" | "SKILL_II" | "SKILL_III" | "CONTENT_COPY" | "CONTENT_POSTER" | "CONTENT_NEWS" | "CONTENT_VIDEO" | "CONTENT_SERIES";
            points: number;
            description: string;
            requirements: string;
            questions: components["schemas"]["Question"][];
            answerKeys: number[];
            capacity: number;
        };
        LearningUnitEdit: {
            title: string;
            /** @enum {string} */
            ruleCode: "TRAINING_2H" | "TRAINING_8H" | "TRAINING_16H" | "SKILL_I" | "SKILL_II" | "SKILL_III" | "CONTENT_COPY" | "CONTENT_POSTER" | "CONTENT_NEWS" | "CONTENT_VIDEO" | "CONTENT_SERIES";
            points: number;
            description: string;
            requirements: string;
            questions: components["schemas"]["Question"][];
            answerKeys: number[];
            capacity: number;
            expectedVersion: number;
        };
        LearningUnitManagement: {
            unit: components["schemas"]["LearningUnit"];
            answerKeys: number[];
        };
        UnitClaim: {
            id: string;
            unitId: string;
            userId: string;
            roleContribution: string;
            /** Format: date-time */
            createdAt: string;
        };
        UnitClaimRequest: {
            unitVersion: number;
            roleContribution: string;
        };
        UnitClaimPage: {
            items: components["schemas"]["UnitClaim"][];
            nextCursor: string | null;
        };
        RecruitmentCreate: {
            title: string;
            description: string;
            /** @enum {string} */
            tier: "P0" | "P1" | "P2" | "P3";
            poolPoints: number;
            capacity: number;
        };
        ProjectRecruitment: {
            id: string;
            title: string;
            description: string;
            /** @enum {string} */
            tier: "P0" | "P1" | "P2" | "P3";
            poolPoints: number;
            capacity: number;
            /** @enum {string} */
            status: "OPEN" | "FORMED" | "CLOSED";
            projectId: string | null;
            version: number;
        };
        RecruitmentPage: {
            items: components["schemas"]["ProjectRecruitment"][];
            nextCursor: string | null;
        };
        ProjectApplication: {
            id: string;
            recruitmentId: string;
            userId: string;
            statement: string;
            /** @enum {string} */
            status: "SUBMITTED" | "ACCEPTED" | "REJECTED";
            decisionReason: string;
            version: number;
        };
        ProjectApplicationPage: {
            items: components["schemas"]["ProjectApplication"][];
            nextCursor: string | null;
        };
        ProjectApplyRequest: {
            expectedVersion: number;
            statement: string;
        };
        ApplicationDecision: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "ACCEPT" | "REJECT";
            reason: string;
        };
        FormProjectRequest: {
            expectedVersion: number;
            members: components["schemas"]["MemberShare"][];
        };
        MembershipApplication: {
            id: string;
            userId: string;
            statement: string;
            /** @enum {string} */
            status: "SUBMITTED" | "ACCEPTED" | "REJECTED";
            decisionReason: string;
            version: number;
        };
        MembershipApplicationPage: {
            items: components["schemas"]["MembershipApplication"][];
            nextCursor: string | null;
        };
        MembershipApplyRequest: {
            statement: string;
        };
        AcademicTermCreate: {
            title: string;
            /** Format: date */
            startsOn: string;
            /** Format: date */
            endsOn: string;
        };
        AcademicTerm: {
            id: string;
            title: string;
            /** Format: date */
            startsOn: string;
            /** Format: date */
            endsOn: string;
            /** @enum {string} */
            ruleVersion: "DRAFT_FOR_DEMO:v1";
        };
        AcademicTermPage: {
            items: components["schemas"]["AcademicTerm"][];
            nextCursor: string | null;
        };
        MeetingCreate: {
            title: string;
            termId: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            capacity: number;
            hostId: string;
            /** @enum {integer} */
            ideaPoints: 5 | 10;
            agenda: string;
        };
        Meeting: {
            id: string;
            termId: string;
            activity: components["schemas"]["Activity"];
            hostId: string;
            ideaPoints: number;
            agenda: string;
        };
        MeetingPage: {
            items: components["schemas"]["Meeting"][];
            nextCursor: string | null;
        };
        MeetingClaimRequest: {
            parts: ("ATTEND" | "PREP" | "IDEA" | "HOST" | "MINUTES")[];
            description: string;
            evidenceFileIds: string[];
        };
        MeetingClaim: {
            id: string;
            meetingId: string;
            userId: string;
            parts: ("ATTEND" | "PREP" | "IDEA" | "HOST" | "MINUTES")[];
            description: string;
            evidenceFileIds: string[];
            activePoints: number;
            passivePoints: number;
            /** @enum {string} */
            status: "SUBMITTED" | "APPROVED" | "REJECTED";
            decisionReason: string;
            version: number;
        };
        MeetingClaimPage: {
            items: components["schemas"]["MeetingClaim"][];
            nextCursor: string | null;
        };
        MeetingClaimDecision: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
        };
        PassiveEligibility: {
            id: string;
            termId: string;
            sourceId: string;
            points: number;
            postedPoints: number;
            pendingPoints: number;
            /** Format: date-time */
            occurredAt: string;
        };
        PassiveEligibilityPage: {
            items: components["schemas"]["PassiveEligibility"][];
            nextCursor: string | null;
        };
        ReportingBudgetRequest: {
            month: string;
            expectedVersion: number;
            budgetCents: number;
            reason: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingBudget: {
            id: string;
            month: string;
            version: number;
            budgetCents: number;
            reason: string;
            actorId: string;
            /** Format: date-time */
            createdAt: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingMonth: {
            month: string;
            /** @enum {string} */
            timezone: "Asia/Shanghai";
            /** @enum {string} */
            currency: "CNY";
            issuedPoints: number;
            spentPoints: number;
            reservedPoints: number;
            releasedPoints: number;
            expiredPoints: number;
            reversedPoints: number;
            netGrowthChange: number;
            closingAvailablePoints: number;
            closingFrozenPoints: number;
            costCents: number;
            budgetCents: number | null;
            budgetVersion: number;
            remainingBudgetCents: number | null;
            /** @enum {string} */
            budgetStatus: "NOT_SET" | "WITHIN_BUDGET" | "EXCEEDED";
            /** Format: date-time */
            asOf: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingCostRequest: {
            businessKey: string;
            amountCents: number;
            description: string;
            /** Format: date-time */
            occurredAt: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingCostReverseRequest: {
            reason: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingCost: {
            id: string;
            businessKey: string;
            /** @enum {string} */
            kind: "DEMO_EXPENSE" | "STOCK_RECEIPT" | "REVERSAL";
            amountCents: number;
            description: string;
            /** Format: date-time */
            occurredAt: string;
            /** Format: date-time */
            createdAt: string;
            actorId: string;
            reversedCostId: string | null;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingCsvRequest: {
            month: string;
            /** @enum {string} */
            dataset: "LEDGER" | "COSTS" | "MONTHLY";
        };
        ReportingCsv: {
            filename: string;
            /** @enum {string} */
            contentType: "text/csv;charset=utf-8";
            csvText: string;
            rowCount: number;
            columns: string[];
            sha256: string;
            /** @enum {boolean} */
            truncated: false;
        };
        DemoRosterPreviewRequest: {
            csvText: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        DemoRosterConfirmRequest: {
            expectedHash: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        DemoRosterIssue: {
            row: number;
            code: string;
            message: string;
        };
        DemoRosterRow: {
            externalKey: string;
            displayName: string;
            /** @enum {string} */
            action: "CREATE" | "EXISTS";
        };
        DemoRosterBatch: {
            id: string;
            sourceHash: string;
            /** @enum {string} */
            status: "INVALID" | "READY" | "CONFIRMED";
            rows: components["schemas"]["DemoRosterRow"][];
            issues: components["schemas"]["DemoRosterIssue"][];
            createdCount: number;
            existingCount: number;
            createdUserIds: string[];
            /** Format: date-time */
            createdAt: string;
            /** @enum {boolean} */
            demoOnly: true;
        };
        ReportingCostPage: {
            items: components["schemas"]["ReportingCost"][];
            nextCursor: string | null;
        };
        ReportingBudgetPage: {
            items: components["schemas"]["ReportingBudget"][];
            nextCursor: string | null;
        };
        CommerceSlotCreate: {
            rewardId: string;
            siteId: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            /** Format: date-time */
            cancelUntil: string;
            capacity: number;
            safetyRequirements: string;
        };
        CommerceSlot: {
            id: string;
            rewardId: string;
            siteId: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            /** Format: date-time */
            cancelUntil: string;
            capacity: number;
            reserved: number;
            fulfilled: number;
            available: number;
            safetyRequired: boolean;
            safetyRequirements: string;
            version: number;
        };
        CommerceSlotPage: {
            items: components["schemas"]["CommerceSlot"][];
            nextCursor: string | null;
        };
        CommerceProgramCreate: {
            rewardId: string;
            siteId: string;
            title: string;
            requirements: string;
            maxSupportCents: number;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            capacity: number;
        };
        CommerceProgram: {
            id: string;
            rewardId: string;
            siteId: string;
            title: string;
            requirements: string;
            maxSupportCents: number;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
            capacity: number;
            reserved: number;
            fulfilled: number;
            available: number;
            version: number;
            /** @enum {boolean} */
            cashPaymentEnabled: false;
        };
        CommerceProgramPage: {
            items: components["schemas"]["CommerceProgram"][];
            nextCursor: string | null;
        };
        CommerceRequestCreate: {
            rewardId: string;
            siteId: string;
            slotId: string | null;
            programId: string | null;
            expectedRewardVersion: number;
            requestedSupportCents: number;
            reason: string;
            evidenceFileIds: string[];
        };
        CommerceRequest: {
            id: string;
            userId: string;
            rewardId: string;
            rewardName: string;
            /** @enum {string} */
            kind: "SERVICE" | "APPLICATION" | "HIGH_VALUE";
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "READY" | "FULFILLED" | "CANCELLED" | "REJECTED" | "EXPIRED";
            siteId: string;
            slotId: string | null;
            programId: string | null;
            requiredPoints: number;
            debitPoints: number;
            requestedSupportCents: number;
            requiredDistinctApprovers: number;
            completedApprovers: number;
            safetyRequired: boolean;
            reason: string;
            evidenceFileIds: string[];
            /** Format: date-time */
            readyAt: string | null;
            /** Format: date-time */
            expiresAt: string | null;
            version: number;
            /** @enum {boolean} */
            cashPaymentEnabled: false;
            reviewHistory: components["schemas"]["CommerceReviewRecord"][];
        };
        CommerceRequestPage: {
            items: components["schemas"]["CommerceRequest"][];
            nextCursor: string | null;
        };
        CommerceDecision: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
        };
        CommerceCancel: {
            expectedVersion: number;
            reason: string;
        };
        CommerceFulfill: {
            expectedVersion: number;
            recipientConfirmed: boolean;
            safetyConfirmed: boolean;
            details: string;
        };
        CommerceStockCreate: {
            rewardId: string;
            siteId: string;
            /** @enum {string} */
            kind: "RECEIPT" | "COUNT_ADJUSTMENT";
            quantity: number;
            unitCostCents: number;
            batchReference: string;
            expectedInventoryVersion: number;
            reason: string;
        };
        CommerceStockRequest: {
            id: string;
            rewardId: string;
            siteId: string;
            /** @enum {string} */
            kind: "RECEIPT" | "COUNT_ADJUSTMENT";
            deltaQuantity: number;
            unitCostCents: number;
            batchReference: string;
            expectedInventoryVersion: number;
            reason: string;
            creatorId: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED";
            completedApprovers: number;
            version: number;
            reviewHistory: components["schemas"]["CommerceReviewRecord"][];
        };
        CommerceStockRequestPage: {
            items: components["schemas"]["CommerceStockRequest"][];
            nextCursor: string | null;
        };
        CommerceReturnCreate: {
            /** @enum {string} */
            sourceType: "ORDER" | "COMMERCE";
            orderId: string;
            reason: string;
            evidenceFileIds: string[];
        };
        CommerceReturn: {
            id: string;
            userId: string;
            /** @enum {string} */
            sourceType: "ORDER" | "COMMERCE";
            orderId: string;
            rewardId: string;
            siteId: string;
            quantity: number;
            totalPoints: number;
            reason: string;
            evidenceFileIds: string[];
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED" | "QUARANTINED" | "RESTOCKED" | "DISPOSED";
            completedApprovers: number;
            refundPoints: number;
            recoverySettledPoints: number;
            version: number;
            reviewHistory: components["schemas"]["CommerceReviewRecord"][];
        };
        CommerceReturnPage: {
            items: components["schemas"]["CommerceReturn"][];
            nextCursor: string | null;
        };
        CommerceReturnReceive: {
            expectedVersion: number;
            allItemsReceived: boolean;
            details: string;
        };
        CommerceReturnInspect: {
            expectedVersion: number;
            /** @enum {string} */
            result: "RESTOCK" | "DISPOSE";
            details: string;
        };
        CommerceReviewRecord: {
            actorId: string;
            action: string;
            details: string;
            /** Format: date-time */
            createdAt: string;
        };
        CommerceWishCreate: {
            rewardId: string | null;
            title: string;
            description: string;
        };
        CommerceWish: {
            id: string;
            userId: string;
            rewardId: string | null;
            title: string;
            description: string;
            /** @enum {string} */
            status: "SUBMITTED" | "REVIEWED" | "PLANNED" | "DECLINED";
            reviewNote: string | null;
            version: number;
        };
        CommerceWishPage: {
            items: components["schemas"]["CommerceWish"][];
            nextCursor: string | null;
        };
        CommerceWishReview: {
            expectedVersion: number;
            /** @enum {string} */
            status: "REVIEWED" | "PLANNED" | "DECLINED";
            reviewNote: string;
        };
        ConversionGoalCreate: {
            unitId: string;
            unitVersion: number;
            activityId: string;
            /** @enum {string} */
            metric: "REGISTRATION" | "ATTENDANCE";
            baseline: number;
        };
        ConversionGoal: {
            id: string;
            unitId: string;
            activityId: string;
            /** @enum {string} */
            metric: "REGISTRATION" | "ATTENDANCE";
            baseline: number;
            /** Format: date-time */
            createdAt: string;
            /** @enum {string} */
            ruleVersion: "DRAFT_FOR_DEMO:v1";
        };
        ConversionGoalPage: {
            items: components["schemas"]["ConversionGoal"][];
            nextCursor: string | null;
        };
        ConversionSubmit: {
            correction: boolean;
            description: string;
        };
        ConversionRequest: {
            id: string;
            goalId: string;
            userId: string;
            baseAwardId: string;
            verifiedCount: number;
            targetPoints: number;
            paidPoints: number;
            correction: boolean;
            description: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED";
            version: number;
            completedApprovers: number;
        };
        ConversionRequestPage: {
            items: components["schemas"]["ConversionRequest"][];
            nextCursor: string | null;
        };
        ConversionDecision: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
        };
        PointAdjustmentCreateRequest: {
            /** @enum {string} */
            kind: "EARN" | "REVERSE";
            beneficiaryId: string;
            originalReference: string | null;
            originalEntryId: string | null;
            points: number | null;
            reason: string;
            evidenceFileIds: string[];
        };
        PointAdjustment: {
            id: string;
            beneficiaryId: string;
            creatorId: string;
            /** @enum {string} */
            kind: "EARN" | "REVERSE";
            originalReference: string;
            originalEntryId: string | null;
            points: number;
            reason: string;
            evidenceFileIds: string[];
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED";
            version: number;
            entryId: string | null;
            requiredDistinctApprovers: number;
            completedApprovers: number;
            /** Format: date-time */
            createdAt: string;
        };
        PointAdjustmentPage: {
            items: components["schemas"]["PointAdjustment"][];
            nextCursor: string | null;
        };
        PointAdjustmentDecisionRequest: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
        };
        WalletReconciliation: {
            userId: string;
            matches: boolean;
            ledger: {
                availablePoints: number;
                frozenPoints: number;
                growthMileage: number;
                recoveryDue: number;
            };
            projection: {
                availablePoints: number;
                frozenPoints: number;
                growthMileage: number;
                recoveryDue: number;
            };
            lots: {
                availablePoints: number;
                frozenPoints: number;
            };
            /** Format: date-time */
            checkedAt: string;
        };
        ActivityEvidenceResubmitRequest: {
            expectedVersion: number;
            description: string;
            evidenceFileIds: string[];
        };
        ActivityEvidenceRevision: {
            submissionId: string;
            round: number;
            approvalId: string;
            description: string;
            evidenceFileIds: string[];
            /** Format: date-time */
            createdAt: string;
        };
        ActivityEvidenceRevisionPage: {
            items: components["schemas"]["ActivityEvidenceRevision"][];
            nextCursor: string | null;
        };
        CaseReviewCreateRequest: {
            expectedCaseVersion: number;
            reason: string;
            evidenceFileIds: string[];
        };
        CaseReviewDecisionRequest: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "UPHOLD" | "REVOKE";
            reason: string;
        };
        CaseReviewDecision: {
            id: string;
            actorId: string;
            /** @enum {string} */
            decision: "UPHOLD" | "REVOKE";
            reason: string;
            /** Format: date-time */
            createdAt: string;
        };
        CaseReviewRound: {
            id: string;
            caseId: string;
            originalDecisionId: string;
            parentReviewId: string | null;
            parentAppealId: string | null;
            sequence: number;
            reason: string;
            evidenceFileIds: string[];
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "DISPUTED" | "UPHELD" | "REVOKED";
            version: number;
            requiredDistinctApprovers: number;
            completedApprovers: number;
            requiresTeacher: boolean;
            teacherApproved: boolean;
            decisions: components["schemas"]["CaseReviewDecision"][];
            /** Format: date-time */
            dueAt: string;
            overdue: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        CaseReviewRoundPage: {
            items: components["schemas"]["CaseReviewRound"][];
            nextCursor: string | null;
        };
        LearningRevocationRequest: {
            expectedVersion: number;
            /** @enum {string} */
            mode: "POINTS_ONLY" | "BADGE_ONLY" | "POINTS_AND_BADGE";
            reason: string;
            evidenceFileIds: string[];
        };
        AccessScope: {
            /** @enum {string} */
            scopeType: "ACTIVITY" | "PROJECT" | "LEARNING" | "REVIEW" | "GROWTH_REVIEW" | "GOVERNANCE" | "PICKUP" | "AUDIT" | "REPORTING" | "ACCESS_APPROVAL";
            scopeId: string;
        };
        AccessStaff: {
            id: string;
            displayName: string;
            roles: ("STUDENT" | "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR" | "SYSTEM_ADMIN")[];
            scopes: components["schemas"]["AccessScope"][];
            active: boolean;
            protectedTechnicalAccount: boolean;
            /** @enum {boolean} */
            demoOnly: true;
            subjectVersion: number;
        };
        AccessStaffPage: {
            items: components["schemas"]["AccessStaff"][];
            nextCursor: string | null;
        };
        AccessRequestCreate: {
            targetId: string;
            /** @enum {string} */
            action: "GRANT_ROLE" | "REVOKE_ROLE" | "GRANT_SCOPE" | "REVOKE_SCOPE";
            /** @enum {string} */
            role: "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR";
            /** @enum {string|null} */
            scopeType: "ACTIVITY" | "PROJECT" | "LEARNING" | "REVIEW" | "GROWTH_REVIEW" | "GOVERNANCE" | "PICKUP" | "AUDIT" | "REPORTING" | "ACCESS_APPROVAL" | null;
            scopeId: string | null;
            expectedSubjectVersion: number;
            reason: string;
        };
        AccessDecisionRecord: {
            actorId: string;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
            /** Format: date-time */
            createdAt: string;
        };
        AccessRequest: {
            id: string;
            targetId: string;
            /** @enum {string} */
            action: "GRANT_ROLE" | "REVOKE_ROLE" | "GRANT_SCOPE" | "REVOKE_SCOPE";
            /** @enum {string} */
            role: "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR";
            /** @enum {string|null} */
            scopeType: "ACTIVITY" | "PROJECT" | "LEARNING" | "REVIEW" | "GROWTH_REVIEW" | "GOVERNANCE" | "PICKUP" | "AUDIT" | "REPORTING" | "ACCESS_APPROVAL" | null;
            scopeId: string | null;
            requesterId: string;
            reason: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL_APPROVAL" | "APPROVED" | "REJECTED";
            beforeRoles: ("STUDENT" | "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR" | "SYSTEM_ADMIN")[];
            beforeScopes: components["schemas"]["AccessScope"][];
            expectedSubjectVersion: number;
            snapshotSha256: string;
            /** @enum {integer} */
            requiredDistinctApprovers: 2;
            completedApprovers: number;
            decisionHistory: components["schemas"]["AccessDecisionRecord"][];
            version: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            appliedAt: string | null;
            /** @enum {string} */
            validity: "IMMEDIATE_UNTIL_REVOKED";
        };
        AccessRequestPage: {
            items: components["schemas"]["AccessRequest"][];
            nextCursor: string | null;
        };
        AccessDecisionCreate: {
            expectedVersion: number;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT";
            reason: string;
        };
        AccessEvent: {
            id: string;
            requestId: string;
            targetId: string;
            action: string;
            /** @enum {string|null} */
            role: "STUDENT_ORGANIZER" | "MENTOR" | "REVIEWER" | "OPS_MANAGER" | "REWARD_OPERATOR" | "AUDITOR" | null;
            /** @enum {string|null} */
            scopeType: "ACTIVITY" | "PROJECT" | "LEARNING" | "REVIEW" | "GROWTH_REVIEW" | "GOVERNANCE" | "PICKUP" | "AUDIT" | "REPORTING" | "ACCESS_APPROVAL" | null;
            scopeId: string | null;
            reason: string;
            actorId: string;
            /** Format: date-time */
            effectiveAt: string;
        };
        AccessEventPage: {
            items: components["schemas"]["AccessEvent"][];
            nextCursor: string | null;
        };
        ConversionCorrectionRequest: {
            expectedVersion: number;
            description: string;
        };
        PracticeTarget: {
            /** @enum {string} */
            section: "活动" | "技能" | "项目" | "订单" | "待结算";
            entityId: string;
            tab: string | null;
            focusId: string | null;
        };
        PracticeItem: {
            id: string;
            /** @enum {string} */
            kind: "ACTIVITY" | "LEARNING" | "PROJECT" | "COMPETITION" | "MEETING" | "ORDER";
            title: string;
            status: string;
            /** @enum {string} */
            bucket: "ACTION" | "WAITING" | "COMPLETE";
            nextStep: string;
            actionLabel: string;
            /** Format: date-time */
            dueAt: string | null;
            target: components["schemas"]["PracticeTarget"];
        };
        PracticeFeed: {
            items: components["schemas"]["PracticeItem"][];
            nextCursor: string | null;
            unreadCount: number;
            /** Format: date-time */
            generatedAt: string;
        };
        ApprovalDecisionRecord: {
            actorId: string;
            actorName: string;
            /** @enum {string} */
            decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
            reason: string;
            /** Format: date-time */
            createdAt: string;
        };
        ApprovalDecisionOption: {
            /** @enum {string} */
            decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
            enabled: boolean;
            reason: string | null;
        };
        ApprovalDetail: {
            approval: components["schemas"]["Approval"];
            submissionId: string;
            artifactId: string;
            applicantName: string;
            activityTitle: string;
            completionRequirements: string;
            round: number;
            evidenceRevision: {
                submissionId: string;
                round: number;
                approvalId: string;
                description: string;
                evidenceFileIds: string[];
                /** Format: date-time */
                createdAt: string;
            } | null;
            factVerifier: {
                id: string;
                name: string;
            } | null;
            decisions: components["schemas"]["ApprovalDecisionRecord"][];
            decisionOptions: components["schemas"]["ApprovalDecisionOption"][];
        };
    };
    responses: never;
    parameters: {
        /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
        SessionAudience: "student" | "staff";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createDemoSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DemoLoginRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createStaffSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffLoginRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
                /** @description Required for cookie sessions; bearer requests use Authorization. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AudienceRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ok"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getMyWallet: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Wallet"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyLedger: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LedgerEntryPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listRewards: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RewardPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getReward: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                rewardId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Reward"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listActivities: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createActivity: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivityCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Activity"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getActivity: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                activityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Activity"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    registerActivity: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                activityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Registration"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    cancelRegistration: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                registrationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Registration"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    recordAttendance: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttendanceRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AttendanceResult"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listSubmissions: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubmissionPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitEvidence: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubmissionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Submission"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listApprovals: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideApproval: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                approvalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Approval"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyOrders: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createOrder: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrderRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getOrder: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    cancelOrder: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    issuePickupCredential: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Credential"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    previewPickup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreviewRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PickupPreview"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirmPickup: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PickupConfirmRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAppeals: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppealPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createAppeal: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppealRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Appeal"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getSession: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    publishActivity: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                activityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Activity"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    completeActivity: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                activityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Activity"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    issueAttendanceCode: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                activityId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttendanceCodeRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AttendanceCode"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyRegistrations: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    verifySubmission: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                submissionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FactRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Submission"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listStaffOrders: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listInventory: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    markOrderReady: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    expireOrder: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listRoster: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RosterUserPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listProjects: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createProject: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getProject: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    updateProjectAllocation: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AllocationRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirmProjectAllocation: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmAllocationRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitProjectStage: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectStageRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AwardRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    stopProject: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCompetitions: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompetitionPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCompetition: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompetitionCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Competition"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitCompetitionAward: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompetitionAwardRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AwardRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAwardRequests: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AwardRequestPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideAwardRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                awardId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AwardRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listLearningUnits: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitLearning: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LearningSubmissionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningAttempt"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyBadges: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SkillBadgePage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCases: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GovernanceCasePage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCase: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaseCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GovernanceCase"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCaseStatements: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                caseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaseStatementPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    addCaseStatement: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                caseId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaseStatementRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaseStatement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideCase: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                caseId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaseDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GovernanceCase"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideAppeal: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                appealId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppealDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Appeal"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listNotifications: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readNotification: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                notificationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Notification"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAuditSamples: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditSamplePage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createAuditSample: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuditSampleRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditSample"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyFiles: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivateFilePage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    uploadFile: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FileUploadRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivateFile"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getFile: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivateFile"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readFileContent: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileContent"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createLearningUnit: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LearningUnitDraft"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitManagement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getLearningUnitManagement: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                unitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitManagement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    editLearningUnit: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                unitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LearningUnitEdit"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitManagement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    publishLearningUnit: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                unitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitManagement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    retireLearningUnit: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                unitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningUnitManagement"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    claimLearningUnit: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                unitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UnitClaimRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UnitClaim"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listLearningClaims: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UnitClaimPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listProjectRecruitments: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecruitmentPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createProjectRecruitment: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecruitmentCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectRecruitment"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    applyProject: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                recruitmentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectApplyRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectApplication"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listProjectApplications: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectApplicationPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideProjectApplication: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                applicationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplicationDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectApplication"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    formRecruitedProject: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                recruitmentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FormProjectRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMembershipApplications: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipApplicationPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    applyMembership: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipApplyRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipApplication"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideMembershipApplication: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                applicationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplicationDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipApplication"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAcademicTerms: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicTermPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createAcademicTerm: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcademicTermCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicTerm"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMeetings: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeetingPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createMeeting: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MeetingCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Meeting"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitMeetingClaim: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                meetingId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MeetingClaimRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeetingClaim"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMeetingClaims: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeetingClaimPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideMeetingClaim: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                claimId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MeetingClaimDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeetingClaim"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listMyPassiveEligibility: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PassiveEligibilityPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getReportingMonth: {
        parameters: {
            query: {
                month: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingMonth"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listReportingBudgets: {
        parameters: {
            query: {
                month: string;
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingBudgetPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    setReportingBudget: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportingBudgetRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingBudget"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listReportingCosts: {
        parameters: {
            query: {
                month: string;
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingCostPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    recordReportingCost: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportingCostRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingCost"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    reverseReportingCost: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                costId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportingCostReverseRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingCost"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    exportReportingCsv: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportingCsvRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportingCsv"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    previewDemoRosterImport: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DemoRosterPreviewRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DemoRosterBatch"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirmDemoRosterImport: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                batchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DemoRosterConfirmRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DemoRosterBatch"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommerceSlots: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceSlotPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceSlot: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceSlotCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceSlot"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommercePrograms: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceProgramPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceProgram: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceProgramCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceProgram"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommerceRequests: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequestPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceRequestCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideCommerceRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    cancelCommerceRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
                "X-Session-Audience": "student" | "staff";
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceCancel"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readyCommerceRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    fulfillCommerceRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceFulfill"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommerceStockRequests: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceStockRequestPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceStockRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceStockCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceStockRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideCommerceStockRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceStockRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommerceReturns: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceReturnPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceReturn: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceReturnCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceReturn"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideCommerceReturn: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                returnId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceReturn"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    receiveCommerceReturn: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                returnId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceReturnReceive"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceReturn"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    inspectCommerceReturn: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                returnId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceReturnInspect"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceReturn"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readCommerceRequestFile: {
        parameters: {
            query?: never;
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path: {
                requestId: string;
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileContent"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readCommerceReturnFile: {
        parameters: {
            query?: never;
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path: {
                returnId: string;
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileContent"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCommerceWishes: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                "X-Session-Audience": "student" | "staff";
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceWishPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCommerceWish: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceWishCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceWish"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    reviewCommerceWish: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                wishId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommerceWishReview"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommerceWish"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listConversionGoals: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionGoalPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createConversionGoal: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionGoalCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionGoal"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    submitConversionRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                goalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionSubmit"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listConversionRequests: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionRequestPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideConversionRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionDecision"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listPointAdjustments: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PointAdjustmentPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createPointAdjustment: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PointAdjustmentCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PointAdjustment"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decidePointAdjustment: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                adjustmentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PointAdjustmentDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PointAdjustment"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getWalletReconciliation: {
        parameters: {
            query?: never;
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletReconciliation"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    resubmitActivityEvidence: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                submissionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivityEvidenceResubmitRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Submission"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listActivityEvidenceRevisions: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                submissionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActivityEvidenceRevisionPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listCaseReviewRounds: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header: {
                /** @description Select only an already authenticated STUDENT or STAFF session context. This header never grants a role. Validate the matching cookie/token audience and resource permissions; do not merge contexts. */
                "X-Session-Audience": components["parameters"]["SessionAudience"];
            };
            path: {
                caseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaseReviewRoundPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createCaseReviewRound: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                caseId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaseReviewCreateRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaseReviewRound"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideCaseReviewRound: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                reviewId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaseReviewDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaseReviewRound"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    requestLearningRevocation: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                awardId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LearningRevocationRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AwardRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAccessStaff: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessStaffPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAccessRequests: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessRequestPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    createAccessRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessRequestCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    decideAccessRequest: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessDecisionCreate"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    listAccessEvents: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessEventPage"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    requestConversionCorrection: {
        parameters: {
            query?: never;
            header: {
                /** @description Scoped by principal+operation and request hash. Business unique key also required. */
                "Idempotency-Key": string;
            };
            path: {
                requestId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionCorrectionRequest"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionRequest"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getStudentPracticeFeed: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string;
                bucket?: "all" | "action" | "active" | "history";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PracticeFeed"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getApprovalDetail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                approvalId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalDetail"];
                };
            };
            /** @description Unauthenticated */
            401: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid request */
            422: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Dependency unavailable */
            503: {
                headers: {
                    /** @description Server-generated request correlation ID; never an authentication credential. */
                    "X-Request-ID"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
}
