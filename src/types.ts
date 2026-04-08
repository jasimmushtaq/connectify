export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  reactions?: string; // JSON string
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConversationData {
  participants?: string | string[];
  last_message?: string;
  last_message_time?: string;
  last_sender?: string;
}
