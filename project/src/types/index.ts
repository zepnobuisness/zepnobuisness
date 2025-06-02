export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
  icon?: string;
}

export interface OtpSession {
  id: string;
  userId: string;
  serviceId: string;
  operatorId: string;
  number: string;
  otp: string | null;
  sessionToken: string;
  status: 'pending' | 'success' | 'canceled';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  purpose: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}