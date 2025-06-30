import { supabase } from './client'
import type { User, Friend, MoneyRequest } from './client'
import { createTransaction, createNotification } from './db'

export interface UserSearchResult {
  id: string
  full_name: string
  username: string
  student_id: string
  profile_picture_url?: string
}

export interface FriendWithProfile extends Friend {
  friend_profile?: UserSearchResult
  user_profile?: UserSearchResult
}

export interface MoneyRequestWithProfile extends MoneyRequest {
  sender_profile?: UserSearchResult
  receiver_profile?: UserSearchResult
}

// Search users by name, username, or student ID
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, student_id, profile_picture_url')
      .neq('id', user.id)
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,student_id.ilike.%${query}%`)
      .limit(20)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

// Send a friend request
export async function sendFriendRequest(senderId: string, receiverId: string): Promise<Friend> {
  try {
    // Check if a friendship already exists
    const { data: existingFriendship, error: checkError } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError
    
    if (existingFriendship) {
      throw new Error('Friend request already exists or you are already friends')
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: senderId,
        friend_id: receiverId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for the receiver
    await createNotification(
      receiverId,
      'New Friend Request',
      'You have received a new friend request',
      'friend_request',
      data.id
    )

    return data
  } catch (error) {
    console.error('Error sending friend request:', error)
    throw error
  }
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    // Get the friend request details
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single()

    if (fetchError) throw fetchError
    if (!friendRequest) throw new Error('Friend request not found')

    // Update the original request to accepted
    const { error: updateError } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateError) throw updateError

    // Create reciprocal friendship
    const { error: reciprocalError } = await supabase
      .from('friends')
      .insert({
        user_id: friendRequest.friend_id,
        friend_id: friendRequest.user_id,
        status: 'accepted'
      })

    if (reciprocalError) throw reciprocalError

    // Create notification for the sender
    await createNotification(
      friendRequest.user_id,
      'Friend Request Accepted',
      'Your friend request has been accepted',
      'friend_request',
      requestId
    )
  } catch (error) {
    console.error('Error accepting friend request:', error)
    throw error
  }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'rejected' })
      .eq('id', requestId)

    if (error) throw error
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    throw error
  }
}

// Get friend requests (incoming or outgoing)
export async function getFriendRequests(userId: string, type: 'incoming' | 'outgoing'): Promise<FriendWithProfile[]> {
  try {
    let query = supabase
      .from('friends')
      .select(`
        *,
        friend_profile:users!friends_friend_id_fkey(
          id,
          full_name,
          username,
          student_id,
          profile_picture_url
        ),
        user_profile:users!friends_user_id_fkey(
          id,
          full_name,
          username,
          student_id,
          profile_picture_url
        )
      `)
      .eq('status', 'pending')

    if (type === 'incoming') {
      query = query.eq('friend_id', userId)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting friend requests:', error)
    throw error
  }
}

// Get friends list
export async function getFriendsList(userId: string): Promise<FriendWithProfile[]> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend_profile:users!friends_friend_id_fkey(
          id,
          full_name,
          username,
          student_id,
          profile_picture_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting friends list:', error)
    throw error
  }
}

// Send a money request
export async function sendMoneyRequest(
  senderId: string, 
  receiverId: string, 
  amount: number, 
  description?: string
): Promise<MoneyRequest> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    const { data, error } = await supabase
      .from('money_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        status: 'pending',
        description: description || ''
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for the receiver
    await createNotification(
      receiverId,
      'Money Request',
      `You have received a money request for ৳${amount.toFixed(2)}`,
      'money_request',
      data.id
    )

    return data
  } catch (error) {
    console.error('Error sending money request:', error)
    throw error
  }
}

// Get money requests (incoming or outgoing)
export async function getMoneyRequests(userId: string, type: 'incoming' | 'outgoing'): Promise<MoneyRequestWithProfile[]> {
  try {
    let query = supabase
      .from('money_requests')
      .select(`
        *,
        sender_profile:users!money_requests_sender_id_fkey(
          id,
          full_name,
          username,
          student_id,
          profile_picture_url
        ),
        receiver_profile:users!money_requests_receiver_id_fkey(
          id,
          full_name,
          username,
          student_id,
          profile_picture_url
        )
      `)
      .eq('status', 'pending')

    if (type === 'incoming') {
      query = query.eq('receiver_id', userId)
    } else {
      query = query.eq('sender_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting money requests:', error)
    throw error
  }
}

// Approve a money request
export async function approveMoneyRequest(requestId: string): Promise<void> {
  try {
    // Get the money request details
    const { data: moneyRequest, error: fetchError } = await supabase
      .from('money_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single()

    if (fetchError) throw fetchError
    if (!moneyRequest) throw new Error('Money request not found')

    const amount = Number(moneyRequest.amount)

    try {
      // CRITICAL FIX: Attempt to process the transactions
      // Create transaction for the approver (expense) - this will automatically update approver's wallet
      await createTransaction({
        amount,
        type: 'expense',
        category: 'transfer',
        description: `Money sent via request - Request ID: ${requestId}`
      }, moneyRequest.receiver_id) // Pass the approver's ID (receiver_id)

      // Create transaction for the requester (income) - this will automatically update requester's wallet
      await createTransaction({
        amount,
        type: 'income',
        category: 'transfer',
        description: `Money received via request - Request ID: ${requestId}`
      }, moneyRequest.sender_id) // Pass the requester's ID (sender_id)

      // Update money request status to accepted only if transactions succeed
      const { error: updateError } = await supabase
        .from('money_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Create success notifications
      await createNotification(
        moneyRequest.sender_id,
        'Money Request Approved',
        `Your money request for ৳${amount.toFixed(2)} has been approved`,
        'money_request',
        requestId
      )

      await createNotification(
        moneyRequest.receiver_id,
        'Money Sent',
        `You have sent ৳${amount.toFixed(2)} via money request`,
        'transaction',
        requestId
      )

    } catch (transactionError: any) {
      // CRITICAL FIX: If transaction creation fails (e.g., insufficient funds),
      // mark the money request as rejected and notify the sender
      console.error('Transaction failed during money request approval:', transactionError)

      // Update money request status to rejected
      const { error: rejectError } = await supabase
        .from('money_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (rejectError) {
        console.error('Failed to update money request status to rejected:', rejectError)
      }

      // Determine the reason for failure
      let failureReason = 'Transaction failed'
      if (transactionError.message && transactionError.message.includes('Insufficient balance')) {
        failureReason = 'Insufficient balance'
      }

      // Create notification for the sender about the rejection
      try {
        await createNotification(
          moneyRequest.sender_id,
          'Money Request Rejected',
          `Your money request for ৳${amount.toFixed(2)} was rejected due to ${failureReason.toLowerCase()}`,
          'money_request',
          requestId
        )
      } catch (notificationError) {
        console.error('Failed to create rejection notification:', notificationError)
      }

      // Re-throw the original error so the UI can display it to the user
      throw transactionError
    }
  } catch (error) {
    console.error('Error approving money request:', error)
    throw error
  }
}

// Reject a money request
export async function rejectMoneyRequest(requestId: string): Promise<void> {
  try {
    // Get the money request details for notification
    const { data: moneyRequest, error: fetchError } = await supabase
      .from('money_requests')
      .select('sender_id, amount')
      .eq('id', requestId)
      .single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from('money_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)

    if (error) throw error

    // Create notification for the sender
    if (moneyRequest) {
      await createNotification(
        moneyRequest.sender_id,
        'Money Request Rejected',
        `Your money request for ৳${Number(moneyRequest.amount).toFixed(2)} has been rejected`,
        'money_request',
        requestId
      )
    }
  } catch (error) {
    console.error('Error rejecting money request:', error)
    throw error
  }
}

// Send money directly to a friend
export async function sendMoneyToFriend(
  senderId: string, 
  receiverId: string, 
  amount: number,
  description?: string
): Promise<void> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    const roundedAmount = Math.round(amount * 100) / 100

    // Create transaction for sender (expense) - this will automatically update sender's wallet
    await createTransaction({
      amount: roundedAmount,
      type: 'expense',
      category: 'transfer',
      description: description || `Money sent to friend`
    }, senderId) // Pass the sender's ID

    // Create transaction for receiver (income) - this will automatically update receiver's wallet
    await createTransaction({
      amount: roundedAmount,
      type: 'income', 
      category: 'transfer',
      description: description || `Money received from friend`
    }, receiverId) // Pass the receiver's ID

    // Create notifications
    await createNotification(
      senderId,
      'Money Sent',
      `You have sent ৳${roundedAmount.toFixed(2)} to your friend`,
      'transaction'
    )

    await createNotification(
      receiverId,
      'Money Received',
      `You have received ৳${roundedAmount.toFixed(2)} from your friend`,
      'transaction'
    )
  } catch (error) {
    console.error('Error sending money to friend:', error)
    throw error
  }
}

// Check if users are friends
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId1)
      .eq('friend_id', userId2)
      .eq('status', 'accepted')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Error checking friendship:', error)
    return false
  }
}

// Remove a friend
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    // Remove both directions of the friendship
    const { error: error1 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)

    const { error: error2 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', userId)

    if (error1) throw error1
    if (error2) throw error2
  } catch (error) {
    console.error('Error removing friend:', error)
    throw error
  }
}