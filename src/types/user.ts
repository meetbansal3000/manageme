// Type Definitions: User Profiles, Settings, Logs & Community Chat

export interface AppSettings {
  theme: string;
  fontScale: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  hideFloatingDock: boolean;
  autoHideDockWhenTyping: boolean;
  dockPosition: 'center' | 'left' | 'right';
  dockCollapsed: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'api' | 'storage';
  message: string;
  details?: any;
}

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActive: number;
}

export interface ChatMessage {
  id: string;
  channelId: string; // "general" or dm ID like "userA_userB"
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'location';
  mediaMeta?: any;
  sharedCard?: {
    type: 'news' | 'trading' | 'job' | 'trip';
    title: string;
    description: string;
    url?: string;
    extraData?: any;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'dm';
  participants?: string[];
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}

export interface GoogleSyncState {
  isConnected: boolean;
  userEmail: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
  accessToken: string | null;
}
