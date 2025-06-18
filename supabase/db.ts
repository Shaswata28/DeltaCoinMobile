// supabase/db.ts
import { supabase } from './client'
import type { Transaction, TransactionType, Budget, Wallet } from './client'

// ==================== WALLET FUNCTIONS ====================

export async function getUserWallet(): Promise<Wallet | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get wallet error:', error)
    throw error
  }
}

// Validation functions
function isValidAmount(amount: number): boolean {
  return amount >= 0 && Number.isFinite(amount)
}

function isValidMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month)
}

export async function updateWalletBalance(amount: number, operation: 'add' | 'subtract' = 'add') {
  try {
    if (!isValidAmount(amount)) {
      throw new Error('Invalid amount: must be a positive number')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const wallet = await getUserWallet()
    if (!wallet) throw new Error('Wallet not found')

    const newBalance = operation === 'add' 
      ? Number(wallet.balance) + amount 
      : Number(wallet.balance) - amount

    if (newBalance < 0) {
      throw new Error('Insufficient balance')
    }

    // Round to 2 decimal places
    const roundedBalance = Math.round(newBalance * 100) / 100

    const { data, error } = await supabase
      .from('wallets')
      .update({ balance: roundedBalance })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Update wallet balance error:', error)
    throw error
  }
}

// ==================== TRANSACTION FUNCTIONS ====================

export interface CreateTransactionData {
  amount: number
  type: TransactionType
  category: string
  description?: string
  date?: string
}

export async function createTransaction(transactionData: CreateTransactionData) {
  try {
    if (!isValidAmount(transactionData.amount)) {
      throw new Error('Invalid amount: must be a positive number')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Round amount to 2 decimal places
    const roundedAmount = Math.round(transactionData.amount * 100) / 100

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: roundedAmount,
        type: transactionData.type,
        category: transactionData.category,
        description: transactionData.description || '',
        date: transactionData.date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Update wallet balance
    const operation = transactionData.type === 'income' ? 'add' : 'subtract'
    await updateWalletBalance(roundedAmount, operation)

    return transaction
  } catch (error) {
    console.error('Create transaction error:', error)
    throw error
  }
}

export async function getUserTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 10) - 1)

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get transactions error:', error)
    throw error
  }
}

export async function getUserTransactionCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Get transaction count error:', error)
    throw error
  }
}

export async function getTransactionsByCategory(category: string): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get transactions by category error:', error)
    throw error
  }
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get transactions by date range error:', error)
    throw error
  }
}

// ==================== HOMEPAGE FUNCTIONS ====================

export interface HomeWalletData {
  balance: number;
  monthlySpent: number;
  monthlyLimit: number;
  recentTransactions: {
    id: string;
    type: 'send' | 'receive';
    amount: number;
    recipient: string;
    category: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'failed';
  }[];
}

export async function getHomeWalletData(): Promise<HomeWalletData> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (walletError) throw walletError

    // Get current month's budget
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (budgetError && budgetError.code !== 'PGRST116') throw budgetError

    // Calculate total monthly limit from budget
    const monthlyLimit = budget ? 
      Number(budget.canteen) + 
      Number(budget.library) + 
      Number(budget.lab) + 
      Number(budget.club) + 
      Number(budget.other) : 0

    // Get current month's transactions for monthly spending calculation
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Query for all transactions in the month to calculate monthly spent
    const { data: monthlyTransactions, error: monthlyTransactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0])
      .eq('type', 'expense')

    if (monthlyTransactionsError) throw monthlyTransactionsError

    // Calculate monthly spent from all transactions
    const monthlySpent = monthlyTransactions
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Get recent transactions (limited to 5) for display
    const { data: recentTransactionsData, error: recentTransactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)

    if (recentTransactionsError) throw recentTransactionsError

    // Transform recent transactions to match the interface
    const recentTransactions = recentTransactionsData.map(t => ({
      id: t.id,
      type: t.type === 'income' ? 'receive' as const : 'send' as const,
      amount: Number(t.amount),
      recipient: t.description || 'Unknown',
      category: t.category,
      timestamp: new Date(t.date),
      status: 'completed' as const // Default to completed since we don't have status in our schema
    }))

    return {
      balance: Number(wallet.balance),
      monthlySpent,
      monthlyLimit,
      recentTransactions
    }
  } catch (error) {
    console.error('Get home wallet data error:', error)
    throw error
  }
}

// Helper function to get category-wise spending
export async function getCategorySpending(month: string): Promise<Record<string, number>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Parse the month string (format: 'YYYY-MM')
    const [year, monthNum] = month.split('-').map(num => parseInt(num))
    
    // Calculate the last day of the month
    // By setting day to 0 of next month, we get the last day of current month
    const lastDay = new Date(year, monthNum, 0).getDate()
    
    const startDate = `${month}-01`
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    // Group by category and sum amounts
    const categoryTotals: Record<string, number> = {}
    transactions?.forEach(transaction => {
      const category = transaction.category
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount)
    })

    return categoryTotals
  } catch (error) {
    console.error('Get category spending error:', error)
    throw error
  }
}

// Helper function to get budget progress
export async function getBudgetProgress(month: string): Promise<{
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get budget for the month
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    if (budgetError && budgetError.code !== 'PGRST116') throw budgetError
    if (!budget) return []

    // Parse the month string (format: 'YYYY-MM')
    const [year, monthNum] = month.split('-').map(num => parseInt(num))
    const lastDay = new Date(year, monthNum, 0).getDate()
    const startDate = `${month}-01`
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

    // Get all expenses for the month
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (transactionsError) throw transactionsError

    // Calculate spending per category (case-insensitive)
    const categorySpending: Record<string, number> = {}
    transactions?.forEach(transaction => {
      const category = transaction.category.toLowerCase()
      categorySpending[category] = (categorySpending[category] || 0) + Number(transaction.amount)
    })

    // Map budget categories to their progress with proper casing
    const budgetCategories = {
      canteen: { name: 'Canteen', limit: Number(budget.canteen) },
      library: { name: 'Library', limit: Number(budget.library) },
      lab: { name: 'Lab', limit: Number(budget.lab) },
      club: { name: 'Club', limit: Number(budget.club) },
      other: { name: 'Other', limit: Number(budget.other) }
    }

    return Object.entries(budgetCategories).map(([key, { name, limit }]) => ({
      category: name,
      spent: categorySpending[key] || 0,
      limit,
      percentage: limit > 0 ? (categorySpending[key] || 0) / limit * 100 : 0
    }))
  } catch (error) {
    console.error('Get budget progress error:', error)
    throw error
  }
}