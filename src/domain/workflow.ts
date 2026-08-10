export const recommendationStates = [
  "draft",
  "review",
  "approved",
  "planned",
  "in_progress",
  "completed",
  "verified",
] as const;

export type RecommendationState = (typeof recommendationStates)[number];
export type WorkflowRole = "owner" | "editor" | "reviewer" | "viewer";

const transitions: Record<RecommendationState, RecommendationState | null> = {
  draft: "review",
  review: "approved",
  approved: "planned",
  planned: "in_progress",
  in_progress: "completed",
  completed: "verified",
  verified: null,
};

export function nextRecommendationState(state: RecommendationState) {
  return transitions[state];
}

export function canAdvanceRecommendation(
  current: RecommendationState,
  next: RecommendationState,
  role: WorkflowRole,
) {
  if (transitions[current] !== next) return false;
  if (next === "approved" || next === "verified") return role === "owner" || role === "reviewer";
  return role === "owner" || role === "editor";
}
