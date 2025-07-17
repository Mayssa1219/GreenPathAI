export type NotificationType = "INFORMATIONAL" | "ACTIONABLE";

export interface AppNotification {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date; // ISO string
}
