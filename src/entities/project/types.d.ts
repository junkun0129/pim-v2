export interface Project {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  memberIds: string[];
  createdAt: string;
  dueDate?: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "FILE";
  url: string;
  size?: string;
}

export interface BrainstormIdea {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  color: "yellow" | "pink" | "blue" | "green";
  votes: number; // simple like count
  attachments: FileAttachment[]; // New: support for multimedia
  linkedDraftId?: string; // New: link to a created draft
}

export type DraftStatus = "PROPOSAL" | "REVIEW" | "APPROVED" | "REJECTED";

export interface SkuDraft {
  id: string;
  projectId: string;
  name: string;
  proposedSkuId: string;
  price?: number;
  description: string;
  status: DraftStatus;
  authorId: string;
  createdAt: string;
  linkedIdeaId?: string; // New: link back to idea
}
