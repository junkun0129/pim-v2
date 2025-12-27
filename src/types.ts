// --- Web Catalog Types ---

// --- Channel Export Types ---

// --- Store Types ---
export interface ExtensionMetadata {
  id: ExtensionType;
  name: string;
  description: string;
  price: number;
  icon: any; // We'll use the component key or name for now
}

// --- Notification Types ---
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "PROJECT" | "ORDER" | "ALERT";
  actorId: string; // User ID who performed action
  timestamp: string;
  isRead: boolean;
}
