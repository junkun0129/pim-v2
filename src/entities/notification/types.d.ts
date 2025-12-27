export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "PROJECT" | "ORDER" | "ALERT";
  actorId: string; // User ID who performed action
  timestamp: string;
  isRead: boolean;
}
