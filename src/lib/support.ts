import { apiClient, unwrap } from '@/api/client';
import { postSupportConversations } from '@/api/generated/sdk.gen';

export const postSupportConversation = (text: string, subject?: string) =>
  unwrap(postSupportConversations({ client: apiClient, body: { text, ...(subject ? { subject } : {}) } }));
