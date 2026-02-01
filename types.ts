
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed';
  amount?: number;
}

export interface AssistantConfig {
  name: string;
  tone: 'professional' | 'friendly' | 'strict';
  whatsappNumber: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface FinancialData {
  transactions: Transaction[];
  reminders: Reminder[];
  config: AssistantConfig;
}
