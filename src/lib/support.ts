import { request } from '@/services/api';

export const postSupportConversation = (text: string, subject?: string) =>
  request<{ success: boolean; conversationId: string }>('/support/conversations', {
    method: 'POST',
    body: { text, subject },
  });
