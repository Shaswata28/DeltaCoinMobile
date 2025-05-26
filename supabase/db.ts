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

export async function deleteTransaction(transactionId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get transaction details before deleting
    const { data: transaction, error: getError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (getError) throw getError
    if (!transaction) throw new Error('Transaction not found')

    // Delete transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Reverse wallet balance change
    const operation = transaction.type === 'income' ? 'subtract' : 'add'
    await updateWalletBalance(transaction.amount, operation)

    return true
  } catch (error) {
    console.error('Delete transaction error:', error)
    throw error
  }
}

// ==================== BUDGET FUNCTIONS ====================

export interface CreateBudgetData {
  month: string // Format: YYYY-MM
  canteen?: number
  library?: number
  lab?: number
  club?: number
  other?: number
}

export async function createOrUpdateBudget(budgetData: CreateBudgetData) {
  try {
    if (!isValidMonth(budgetData.month)) {
      throw new Error('Invalid month format: must be YYYY-MM')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Round all budget amounts to 2 decimal places
    const roundedBudget = {
      user_id: user.id,
      month: budgetData.month,
      canteen: Math.round((budgetData.canteen || 0) * 100) / 100,
      library: Math.round((budgetData.library || 0) * 100) / 100,
      lab: Math.round((budgetData.lab || 0) * 100) / 100,
      club: Math.round((budgetData.club || 0) * 100) / 100,
      other: Math.round((budgetData.other || 0) * 100) / 100,
    }

    const { data, error } = await supabase
      .from('budgets')
      .upsert(roundedBudget)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Create/update budget error:', error)
    throw error
  }
}

export async function getUserBudget(month: string): Promise<Budget | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found" error
    return data
  } catch (error) {
    console.error('Get budget error:', error)
    throw error
  }
}

export async function getUserBudgets(): Promise<Budget[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get budgets error:', error)
    throw error
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Delete budget error:', error)
    throw error
  }
}

// ==================== ANALYTICS FUNCTIONS ====================

export async function getMonthlyExpensesByCategory(month: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const startDate = `${month}-01`
    const endDate = `${month}-31`

    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    // Group by category and sum amounts
    const categoryTotals: Record<string, number> = {}
    data?.forEach(transaction => {
      const category = transaction.category
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount)
    })

    return categoryTotals
  } catch (error) {
    console.error('Get monthly expenses by category error:', error)
    throw error
  }
}

export async function getIncomeVsExpenses(month: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const startDate = `${month}-01`
    const endDate = `${month}-31`

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    let totalIncome = 0
    let totalExpenses = 0

    data?.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += Number(transaction.amount)
      } else {
        totalExpenses += Number(transaction.amount)
      }
    })

    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses
    }
  } catch (error) {
    console.error('Get income vs expenses error:', error)
    throw error
  }
}