import { Conversation, Message, User } from '../types';

const BASE_URL = `/api`;

export const api = {
  async login(credentials: any): Promise<{ user: User }> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return response.json();
  },

  async register(data: any): Promise<{ user: User }> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
  },

  async getMe(): Promise<{ user: User }> {
    const response = await fetch(`${BASE_URL}/auth/me`);
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async fetchConversations(): Promise<Conversation[]> {
    const response = await fetch(`${BASE_URL}/conversations`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  async createConversation(data: any): Promise<Conversation> {
    const response = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async sendMessage(conversationId: string, data: any): Promise<Message> {
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async reactToMessage(messageId: string, emoji: string): Promise<Message> {
    const response = await fetch(`${BASE_URL}/messages/${messageId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji })
    });
    if (!response.ok) throw new Error('Failed to react');
    return response.json();
  },

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
};
