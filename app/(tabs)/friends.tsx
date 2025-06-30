import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {
  Users,
  UserPlus,
  Search,
  Send,
  Check,
  X,
  Clock,
  MessageCircle,
  UserCheck,
  UserX,
  Plus,
  ArrowRight,
  DollarSign,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriendsList,
  getMoneyRequests,
  approveMoneyRequest,
  rejectMoneyRequest,
  sendMoneyRequest,
  type UserSearchResult,
  type FriendWithProfile,
  type MoneyRequestWithProfile,
} from '../../supabase/friends';
import { supabase } from '../../supabase/client';
import { PROFILE_IMAGES } from '../../components/constants/images';

export default function FriendsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendWithProfile[]>([]);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequestWithProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCurrentUser();
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const loadFriends = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const friendsData = await getFriendsList(currentUserId);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      
      // Load incoming friend requests
      const friendRequestsData = await getFriendRequests(currentUserId, 'incoming');
      setFriendRequests(friendRequestsData);

      // Load incoming money requests
      const moneyRequestsData = await getMoneyRequests(currentUserId, 'incoming');
      setMoneyRequests(moneyRequestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;
    
    try {
      await sendFriendRequest(currentUserId, friendId);
      Alert.alert('Success', 'Friend request sent!');
      
      // Add to sent requests set
      setSentRequests(prev => new Set(prev).add(friendId));
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  };

  const handleRespondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      if (accept) {
        await acceptFriendRequest(requestId);
        Alert.alert('Success', 'Friend request accepted!');
        loadFriends(); // Refresh friends list
      } else {
        await rejectFriendRequest(requestId);
        Alert.alert('Success', 'Friend request rejected');
      }
      
      loadRequests(); // Refresh requests
    } catch (error: any) {
      console.error('Error responding to friend request:', error);
      Alert.alert('Error', error.message || 'Failed to respond to friend request');
    }
  };

  const handleApproveMoneyRequest = async (requestId: string) => {
    try {
      await approveMoneyRequest(requestId);
      Alert.alert('Success', 'Money request approved!');
      loadRequests(); // Refresh requests
    } catch (error: any) {
      console.error('Error approving money request:', error);
      Alert.alert('Error', error.message || 'Failed to approve money request');
    }
  };

  const handleRejectMoneyRequest = async (requestId: string) => {
    try {
      await rejectMoneyRequest(requestId);
      Alert.alert('Success', 'Money request rejected');
      loadRequests(); // Refresh requests
    } catch (error: any) {
      console.error('Error rejecting money request:', error);
      Alert.alert('Error', error.message || 'Failed to reject money request');
    }
  };

  const handleMoneyTransfer = (friend: UserSearchResult, type: 'send' | 'request') => {
    // Navigate to money transfer page with friend data and type
    router.push({
      pathname: '/money-transfer',
      params: {
        friend: JSON.stringify(friend),
        type: type,
      },
    });
  };

  const renderTabButton = (
    tab: 'friends' | 'requests' | 'search',
    icon: React.ReactNode,
    label: string,
    count?: number
  ) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tab && styles.activeTab,
        isDark && styles.tabDark,
        activeTab === tab && isDark && styles.activeTabDark,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <View style={styles.tabContent}>
        <Text
          style={[
            styles.tabText,
            activeTab === tab && styles.activeTabText,
            isDark && styles.tabTextDark,
            activeTab === tab && isDark && styles.activeTabTextDark,
          ]}
        >
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFriendCard = (friend: FriendWithProfile, index: number) => (
    <Animated.View
      key={friend.id}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[styles.friendCard, isDark && styles.friendCardDark]}
    >
      <View style={styles.friendContent}>
        <Image
          source={{
            uri: friend.friend_profile?.profile_picture_url || PROFILE_IMAGES.defaultAvatar
          }}
          style={styles.avatarSmall}
        />
        <View style={styles.friendTextContainer}>
          <Text style={[styles.friendName, isDark && styles.friendNameDark]}>
            {friend.friend_profile?.full_name}
          </Text>
          <View style={styles.friendActionsCompact}>
            <TouchableOpacity 
              style={[styles.actionButtonCompact, styles.requestButtonCompact]}
              onPress={() => friend.friend_profile && handleMoneyTransfer(friend.friend_profile, 'request')}
            >
              <MessageCircle size={14} color="#4D9FFF" />
              <Text style={[styles.actionTextCompact, { color: '#4D9FFF' }]}>Request</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButtonCompact, styles.sendButtonCompact]}
              onPress={() => friend.friend_profile && handleMoneyTransfer(friend.friend_profile, 'send')}
            >
              <Send size={14} color="#10B981" />
              <Text style={[styles.actionTextCompact, { color: '#10B981' }]}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderFriendRequestCard = (request: FriendWithProfile, index: number) => (
    <Animated.View
      key={request.id}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[styles.requestCard, isDark && styles.requestCardDark]}
    >
      <View style={styles.requestInfo}>
        <Image
          source={{
            uri: request.user_profile?.profile_picture_url ||
              PROFILE_IMAGES.defaultAvatar
          }}
          style={styles.avatar}
        />
        <View style={styles.requestDetails}>
          <Text style={[styles.requestName, isDark && styles.requestNameDark]}>
            {request.user_profile?.full_name}
          </Text>
          <Text style={[styles.requestUsername, isDark && styles.requestUsernameDark]}>
            @{request.user_profile?.username}
          </Text>
          <Text style={[styles.requestTime, isDark && styles.requestTimeDark]}>
            {new Date(request.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRespondToFriendRequest(request.id, true)}
        >
          <Check size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRespondToFriendRequest(request.id, false)}
        >
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMoneyRequestCard = (request: MoneyRequestWithProfile, index: number) => {
    const isIncoming = request.receiver_id === currentUserId;
    const profile = isIncoming ? request.sender_profile : request.receiver_profile;
    
    return (
      <Animated.View
        key={request.id}
        entering={FadeInDown.delay(index * 100).duration(400)}
        style={[styles.friendCard, isDark && styles.friendCardDark]}
      >
        <View style={styles.friendContent}>
          <Image
            source={{
              uri: profile?.profile_picture_url || PROFILE_IMAGES.defaultAvatar
            }}
            style={styles.avatarSmall}
          />
          <View style={styles.friendTextContainer}>
            <Text style={[styles.friendName, isDark && styles.friendNameDark]}>
              {profile?.full_name}
            </Text>
            <Text style={[styles.moneyAmount, isDark && styles.moneyAmountDark]}>
              ৳{Number(request.amount).toFixed(2)}
            </Text>
            {request.message && (
              <Text style={[styles.requestMessage, isDark && styles.requestMessageDark]}>
                {request.message}
              </Text>
            )}
          </View>
          {isIncoming && (
            <View style={styles.friendActionsCompact}>
              <TouchableOpacity
                style={[styles.actionButtonCompact, styles.acceptButtonCompact]}
                onPress={() => handleApproveMoneyRequest(request.id)}
              >
                <Check size={16} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButtonCompact, styles.rejectButtonCompact]}
                onPress={() => handleRejectMoneyRequest(request.id)}
              >
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderSearchResult = (user: UserSearchResult, index: number) => {
    const hasRequestSent = sentRequests.has(user.id);
    
    return (
      <Animated.View
        key={user.id}
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={[styles.searchResultCard, isDark && styles.searchResultCardDark]}
      >
        <View style={styles.searchResultInfo}>
          <Image
            source={{
              uri: user.profile_picture_url || PROFILE_IMAGES.defaultAvatar
            }}
            style={styles.avatar}
          />
          <View style={styles.searchResultDetails}>
            <Text style={[styles.searchResultName, isDark && styles.searchResultNameDark]}>
              {user.full_name}
            </Text>
            <Text style={[styles.searchResultUsername, isDark && styles.searchResultUsernameDark]}>
              @{user.username}
            </Text>
            <Text style={[styles.searchResultId, isDark && styles.searchResultIdDark]}>
              ID: {user.student_id}
            </Text>
          </View>
        </View>
        
        {hasRequestSent ? (
          <View style={[styles.requestSentButton, isDark && styles.requestSentButtonDark]}>
            <Check size={16} color="#10B981" />
            <Text style={styles.requestSentText}>Request Sent</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addButton, isDark && styles.addButtonDark]}
            onPress={() => handleSendFriendRequest(user.id)}
          >
            <UserPlus size={20} color="#FFD700" />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (loading && activeTab !== 'search') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Loading...
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'friends':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
                <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                  No Friends Yet
                </Text>
                <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                  Start by searching for friends to connect with
                </Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, isDark && styles.emptyStateButtonDark]}
                  onPress={() => setActiveTab('search')}
                >
                  <Search size={20} color="#FFFFFF" />
                  <Text style={styles.emptyStateButtonText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map((friend, index) => renderFriendCard(friend, index))}
              </View>
            )}
          </ScrollView>
        );

      case 'requests':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {friendRequests.length === 0 && moneyRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
                <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                  No Pending Requests
                </Text>
                <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                  Friend and money requests will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {friendRequests.length > 0 && (
                  <View style={styles.requestSection}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                      Friend Requests
                    </Text>
                    {friendRequests.map((request, index) => renderFriendRequestCard(request, index))}
                  </View>
                )}
                {moneyRequests.length > 0 && (
                  <View style={styles.requestSection}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                      Money Requests
                    </Text>
                    {moneyRequests.map((request, index) => renderMoneyRequestCard(request, index))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        );

      case 'search':
        return (
          <View style={styles.searchTabContainer}>
            {/* Static Search Bar */}
            <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
              <Search size={20} color={isDark ? '#A6A6A6' : '#6B7280'} />
              <TextInput
                style={[styles.searchInput, isDark && styles.searchInputDark]}
                placeholder="Search by name, username, or student ID"
                placeholderTextColor={isDark ? '#A6A6A6' : '#6B7280'}
                value={searchQuery}
                onChangeText={handleSearchUsers}
              />
            </View>

            {/* Scrollable Search Results */}
            <ScrollView 
              style={styles.searchResults} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsContent}
            >
              {loading ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                    Searching...
                  </Text>
                </View>
              ) : searchResults.length === 0 && searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                  <Search size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    No Results Found
                  </Text>
                  <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                    Try searching with a different term
                  </Text>
                </View>
              ) : searchQuery.length === 0 ? (
                <View style={styles.emptyState}>
                  <Search size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
                  <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                    Search for Friends
                  </Text>
                  <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                    Enter a name, username, or student ID to find friends
                  </Text>
                </View>
              ) : (
                searchResults.map((user, index) => renderSearchResult(user, index))
              )}
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Friends</Text>
        <View style={[styles.tabs, isDark && styles.tabsDark]}>
          {renderTabButton(
            'friends',
            <Users size={20} color={activeTab === 'friends' ? '#000000' : (isDark ? '#A6A6A6' : '#6B7280')} />,
            'Friends',
            friends.length
          )}
          {renderTabButton(
            'requests',
            <Clock size={20} color={activeTab === 'requests' ? '#000000' : (isDark ? '#A6A6A6' : '#6B7280')} />,
            'Requests',
            friendRequests.length + moneyRequests.length
          )}
          {renderTabButton(
            'search',
            <Search size={20} color={activeTab === 'search' ? '#000000' : (isDark ? '#A6A6A6' : '#6B7280')} />,
            'Search'
          )}
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsDark: {
    backgroundColor: '#1E1E1E',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabDark: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  activeTabDark: {
    backgroundColor: '#FFD700',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  tabTextDark: {
    color: '#A6A6A6',
  },
  activeTabText: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  activeTabTextDark: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchTabContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#A6A6A6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateTitleDark: {
    color: '#FFFFFF',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateTextDark: {
    color: '#A6A6A6',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonDark: {
    backgroundColor: '#FFD700',
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  friendsList: {
    gap: 16,
  },
  friendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendCardDark: {
    backgroundColor: '#1E1E1E',
  },
  friendContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendTextContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  friendNameDark: {
    color: '#FFFFFF',
  },
  moneyAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  moneyAmountDark: {
    color: '#FFD700',
  },
  requestMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  requestMessageDark: {
    color: '#A6A6A6',
  },
  friendActionsCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  requestButtonCompact: {
    backgroundColor: 'rgba(77, 159, 255, 0.1)',
    borderColor: 'rgba(77, 159, 255, 0.3)',
  },
  sendButtonCompact: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  acceptButtonCompact: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  rejectButtonCompact: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  actionTextCompact: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsList: {
    gap: 24,
  },
  requestSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  requestCardDark: {
    backgroundColor: '#1E1E1E',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  requestNameDark: {
    color: '#FFFFFF',
  },
  requestUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  requestUsernameDark: {
    color: '#A6A6A6',
  },
  requestTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  requestTimeDark: {
    color: '#6B7280',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    marginLeft: 12,
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  searchResults: {
    flex: 1,
  },
  searchResultsContent: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultCardDark: {
    backgroundColor: '#1E1E1E',
  },
  searchResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  searchResultNameDark: {
    color: '#FFFFFF',
  },
  searchResultUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  searchResultUsernameDark: {
    color: '#A6A6A6',
  },
  searchResultId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  searchResultIdDark: {
    color: '#6B7280',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  addButtonDark: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  requestSentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  requestSentButtonDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  requestSentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
});