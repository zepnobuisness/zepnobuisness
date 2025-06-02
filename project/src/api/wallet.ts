import { Transaction, ApiResponse } from '../types';

// Mock transactions for development
const mockTransactions: Transaction[] = [];

import { supabase } from '../lib/supabase';

export const getUserBalance = async (userId: string): Promise<ApiResponse<number>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return {
      success: true,
      data: data.balance,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || 'Failed to get user balance',
    };
  }
};

export const addFunds = async (userId: string, amount: number): Promise<ApiResponse<Transaction>> => {
  // In a real app, this would call payment processor and then backend API
  
  try {
    // Create a new transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      type: 'credit',
      amount,
      purpose: 'Wallet top-up',
      createdAt: new Date().toISOString(),
    };
    
    // Add to mock transactions
    mockTransactions.push(newTransaction);
    
    return {
      success: true,
      data: newTransaction,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to add funds',
    };
  }
};

export const deductFunds = async (userId: string, amount: number, purpose: string): Promise<ApiResponse<Transaction>> => {
  // In a real app, this would call backend API
  
  try {
    // Check if user has enough balance
    const balanceResponse = await getUserBalance(userId);
    if (!balanceResponse.success || !balanceResponse.data) {
      return {
        success: false,
        error: 'Failed to get user balance',
      };
    }
    
    if (balanceResponse.data < amount) {
      return {
        success: false,
        error: 'Insufficient balance',
      };
    }
    
    // Create a new transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      type: 'debit',
      amount,
      purpose,
      createdAt: new Date().toISOString(),
    };
    
    // Add to mock transactions
    mockTransactions.push(newTransaction);
    
    return {
      success: true,
      data: newTransaction,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to deduct funds',
    };
  }
};

export const getTransactions = async (userId: string): Promise<ApiResponse<Transaction[]>> => {
  // In a real app, this would fetch from backend API
  
  try {
    const userTransactions = mockTransactions.filter(t => t.userId === userId);
    return {
      success: true,
      data: userTransactions,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get transactions',
    };
  }
};