import type { LinearClient } from "@linear/sdk";

export type SdkLinearClient = Pick<
  LinearClient,
  | "issues"
  | "issue"
  | "viewer"
  | "rateLimitStatus"
  | "createIssue"
  | "updateIssue"
  | "deleteIssue"
  | "customers"
  | "customer"
  | "createCustomer"
  | "updateCustomer"
  | "deleteCustomer"
  | "customerNeeds"
  | "customerNeed"
  | "createCustomerNeed"
  | "updateCustomerNeed"
  | "deleteCustomerNeed"
  | "initiatives"
  | "initiative"
  | "createInitiative"
  | "updateInitiative"
  | "deleteInitiative"
  | "initiativeUpdates"
  | "initiativeUpdate"
  | "createInitiativeUpdate"
  | "updateInitiativeUpdate"
  | "archiveInitiativeUpdate"
  | "projects"
  | "project"
  | "createProject"
  | "updateProject"
  | "deleteProject"
  | "projectMilestones"
  | "projectMilestone"
  | "createProjectMilestone"
  | "updateProjectMilestone"
  | "deleteProjectMilestone"
  | "projectUpdates"
  | "projectUpdate"
  | "createProjectUpdate"
  | "updateProjectUpdate"
  | "deleteProjectUpdate"
  | "documents"
  | "document"
  | "createDocument"
  | "updateDocument"
  | "deleteDocument"
  | "cycles"
  | "cycle"
  | "createCycle"
  | "updateCycle"
  | "archiveCycle"
  | "teams"
  | "team"
  | "createTeam"
  | "updateTeam"
  | "deleteTeam"
  | "users"
  | "user"
  | "updateUser"
  | "issueLabels"
  | "issueLabel"
  | "createIssueLabel"
  | "updateIssueLabel"
  | "deleteIssueLabel"
  | "comments"
  | "comment"
  | "createComment"
  | "updateComment"
  | "deleteComment"
  | "attachments"
  | "attachment"
  | "createAttachment"
  | "updateAttachment"
  | "deleteAttachment"
  | "notifications"
  | "notification"
  | "archiveNotification"
  | "updateNotification"
  | "workflowStates"
  | "workflowState"
  | "createWorkflowState"
  | "updateWorkflowState"
  | "archiveWorkflowState"
  | "templates"
  | "template"
  | "createTemplate"
  | "updateTemplate"
  | "deleteTemplate"
>;

export type SdkIssueLike = Awaited<ReturnType<LinearClient["issue"]>>;
export type SdkCustomerLike = Awaited<ReturnType<LinearClient["customer"]>>;
export type SdkCustomerNeedLike = Awaited<ReturnType<LinearClient["customerNeed"]>>;
export type SdkInitiativeLike = Awaited<ReturnType<LinearClient["initiative"]>>;
export type SdkInitiativeUpdateLike = Awaited<ReturnType<LinearClient["initiativeUpdate"]>>;
export type SdkProjectLike = Awaited<ReturnType<LinearClient["project"]>>;
export type SdkProjectMilestoneLike = Awaited<ReturnType<LinearClient["projectMilestone"]>>;
export type SdkProjectUpdateLike = Awaited<ReturnType<LinearClient["projectUpdate"]>>;
export type SdkDocumentLike = Awaited<ReturnType<LinearClient["document"]>>;
export type SdkCycleLike = Awaited<ReturnType<LinearClient["cycle"]>>;
export type SdkTeamLike = Awaited<ReturnType<LinearClient["team"]>>;
export type SdkUserLike = Awaited<ReturnType<LinearClient["user"]>>;
export type SdkIssueLabelLike = Awaited<ReturnType<LinearClient["issueLabel"]>>;
export type SdkCommentLike = Awaited<ReturnType<LinearClient["comments"]>>["nodes"][number];
export type SdkAttachmentLike = Awaited<ReturnType<LinearClient["attachment"]>>;
export type SdkNotificationLike = Awaited<ReturnType<LinearClient["notification"]>>;
export type SdkWorkflowStateLike = Awaited<ReturnType<LinearClient["workflowState"]>>;
export type SdkTemplateLike = Awaited<ReturnType<LinearClient["template"]>>;

export type SdkIssueConnectionLike = Awaited<ReturnType<LinearClient["issues"]>>;
export type SdkCustomerConnectionLike = Awaited<ReturnType<LinearClient["customers"]>>;
export type SdkCustomerNeedConnectionLike = Awaited<ReturnType<LinearClient["customerNeeds"]>>;
export type SdkInitiativeConnectionLike = Awaited<ReturnType<LinearClient["initiatives"]>>;
export type SdkInitiativeUpdateConnectionLike = Awaited<
  ReturnType<LinearClient["initiativeUpdates"]>
>;
export type SdkProjectConnectionLike = Awaited<ReturnType<LinearClient["projects"]>>;
export type SdkProjectMilestoneConnectionLike = Awaited<
  ReturnType<LinearClient["projectMilestones"]>
>;
export type SdkProjectUpdateConnectionLike = Awaited<ReturnType<LinearClient["projectUpdates"]>>;
export type SdkDocumentConnectionLike = Awaited<ReturnType<LinearClient["documents"]>>;
export type SdkCycleConnectionLike = Awaited<ReturnType<LinearClient["cycles"]>>;
export type SdkTeamConnectionLike = Awaited<ReturnType<LinearClient["teams"]>>;
export type SdkUserConnectionLike = Awaited<ReturnType<LinearClient["users"]>>;
export type SdkIssueLabelConnectionLike = Awaited<ReturnType<LinearClient["issueLabels"]>>;
export type SdkCommentConnectionLike = Awaited<ReturnType<LinearClient["comments"]>>;
export type SdkAttachmentConnectionLike = Awaited<ReturnType<LinearClient["attachments"]>>;
export type SdkNotificationConnectionLike = Awaited<ReturnType<LinearClient["notifications"]>>;
export type SdkWorkflowStateConnectionLike = Awaited<ReturnType<LinearClient["workflowStates"]>>;
export type SdkTemplateListLike = Awaited<LinearClient["templates"]>;

export type SdkIssuePayloadLike = Awaited<ReturnType<LinearClient["createIssue"]>>;
export type SdkCustomerPayloadLike = Awaited<ReturnType<LinearClient["createCustomer"]>>;
export type SdkCustomerNeedPayloadLike = Awaited<ReturnType<LinearClient["createCustomerNeed"]>>;
export type SdkInitiativePayloadLike = Awaited<ReturnType<LinearClient["createInitiative"]>>;
export type SdkInitiativeUpdatePayloadLike = Awaited<
  ReturnType<LinearClient["createInitiativeUpdate"]>
>;
export type SdkProjectPayloadLike = Awaited<ReturnType<LinearClient["createProject"]>>;
export type SdkProjectMilestonePayloadLike = Awaited<
  ReturnType<LinearClient["createProjectMilestone"]>
>;
export type SdkProjectUpdatePayloadLike = Awaited<ReturnType<LinearClient["createProjectUpdate"]>>;
export type SdkDocumentPayloadLike = Awaited<ReturnType<LinearClient["createDocument"]>>;
export type SdkCyclePayloadLike = Awaited<ReturnType<LinearClient["createCycle"]>>;
export type SdkTeamPayloadLike = Awaited<ReturnType<LinearClient["createTeam"]>>;
export type SdkUserPayloadLike = Awaited<ReturnType<LinearClient["updateUser"]>>;
export type SdkIssueLabelPayloadLike = Awaited<ReturnType<LinearClient["createIssueLabel"]>>;
export type SdkCommentPayloadLike = Awaited<ReturnType<LinearClient["createComment"]>>;
export type SdkAttachmentPayloadLike = Awaited<ReturnType<LinearClient["createAttachment"]>>;
export type SdkNotificationPayloadLike = Awaited<ReturnType<LinearClient["updateNotification"]>>;
export type SdkWorkflowStatePayloadLike = Awaited<ReturnType<LinearClient["createWorkflowState"]>>;
export type SdkTemplatePayloadLike = Awaited<ReturnType<LinearClient["createTemplate"]>>;

export type SdkIssueInput = Parameters<LinearClient["createIssue"]>[0];
export type SdkIssueUpdateInput = Parameters<LinearClient["updateIssue"]>[1];
export type SdkCustomerInput = Parameters<LinearClient["createCustomer"]>[0];
export type SdkCustomerUpdateInput = Parameters<LinearClient["updateCustomer"]>[1];
export type SdkCustomerNeedInput = Parameters<LinearClient["createCustomerNeed"]>[0];
export type SdkCustomerNeedUpdateInput = Parameters<LinearClient["updateCustomerNeed"]>[1];
export type SdkInitiativeInput = Parameters<LinearClient["createInitiative"]>[0];
export type SdkInitiativeUpdateInput = Parameters<LinearClient["updateInitiative"]>[1];
export type SdkInitiativeUpdateCreateInput = Parameters<LinearClient["createInitiativeUpdate"]>[0];
export type SdkInitiativeUpdateUpdateInput = Parameters<LinearClient["updateInitiativeUpdate"]>[1];
export type SdkProjectInput = Parameters<LinearClient["createProject"]>[0];
export type SdkProjectUpdateInput = Parameters<LinearClient["updateProject"]>[1];
export type SdkProjectMilestoneInput = Parameters<LinearClient["createProjectMilestone"]>[0];
export type SdkProjectMilestoneUpdateInput = Parameters<LinearClient["updateProjectMilestone"]>[1];
export type SdkProjectUpdateCreateInput = Parameters<LinearClient["createProjectUpdate"]>[0];
export type SdkProjectUpdateUpdateInput = Parameters<LinearClient["updateProjectUpdate"]>[1];
export type SdkDocumentInput = Parameters<LinearClient["createDocument"]>[0];
export type SdkDocumentUpdateInput = Parameters<LinearClient["updateDocument"]>[1];
export type SdkCycleInput = Parameters<LinearClient["createCycle"]>[0];
export type SdkCycleUpdateInput = Parameters<LinearClient["updateCycle"]>[1];
export type SdkTeamInput = Parameters<LinearClient["createTeam"]>[0];
export type SdkTeamUpdateInput = Parameters<LinearClient["updateTeam"]>[1];
export type SdkUserUpdateInput = Parameters<LinearClient["updateUser"]>[1];
export type SdkIssueLabelInput = Parameters<LinearClient["createIssueLabel"]>[0];
export type SdkIssueLabelUpdateInput = Parameters<LinearClient["updateIssueLabel"]>[1];
export type SdkCommentInput = Parameters<LinearClient["createComment"]>[0];
export type SdkCommentUpdateInput = Parameters<LinearClient["updateComment"]>[1];
export type SdkAttachmentInput = Parameters<LinearClient["createAttachment"]>[0];
export type SdkAttachmentUpdateInput = Parameters<LinearClient["updateAttachment"]>[1];
export type SdkNotificationUpdateInput = Parameters<LinearClient["updateNotification"]>[1];
export type SdkWorkflowStateInput = Parameters<LinearClient["createWorkflowState"]>[0];
export type SdkWorkflowStateUpdateInput = Parameters<LinearClient["updateWorkflowState"]>[1];
export type SdkTemplateInput = Parameters<LinearClient["createTemplate"]>[0];
export type SdkTemplateUpdateInput = Parameters<LinearClient["updateTemplate"]>[1];
