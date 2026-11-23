import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, useColorScheme, View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CheckCheck, CreditCard, Handshake, Info, Trash2, TriangleAlert } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';

import { Button } from '@/components/common/Button';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SegmentedTabs } from '@/components/common/SegmentedTabs';
import { deleteAllNotifications, getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/supabase/db';
import type { Notification } from '@/supabase/client';

type Filter = 'all' | 'unread';

const notificationIcons = {
  transaction: { Icon: CreditCard, color: '#4D9FFF' },
  budget_alert: { Icon: TriangleAlert, color: '#DFA40D' },
  friend_request: { Icon: Handshake, color: '#10B981' },
  money_request: { Icon: CreditCard, color: '#A78BFA' },
  system: { Icon: Info, color: '#8694A6' },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  const reload = useCallback(async (pullToRefresh = false) => {
    if (pending.current) return;
    pending.current = true;
    setRefreshing(pullToRefresh);
    setError(null);
    try {
      setItems(await getUserNotifications());
    } catch {
      setError('Could not load notifications.');
    } finally {
      pending.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void reload();
  }, [reload]));

  const mutateInbox = async (write: () => Promise<void>, update: (current: Notification[]) => Notification[]) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await write();
      setItems(update);
    } catch {
      setError('Could not update your inbox. Please try again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const clearInbox = () => {
    Alert.alert('Delete all notifications?', 'This will clear your inbox.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete all', style: 'destructive', onPress: () => void mutateInbox(deleteAllNotifications, () => []) },
    ]);
  };

  const unread = items.filter(item => !item.read_status);
  const visible = filter === 'unread' ? unread : items;
  const todayKey = new Date().toDateString();
  const today = visible.filter(item => new Date(item.created_at).toDateString() === todayKey);
  const earlier = visible.filter(item => new Date(item.created_at).toDateString() !== todayKey);
  const sections = [
    { title: 'Today', data: today },
    { title: 'Earlier', data: earlier },
  ].filter(section => section.data.length > 0);
  const disabled = busy || loading || refreshing;

  return (
    <View style={[styles.screen, dark && styles.screenDark, { paddingTop: insets.top }]}>
      <ScreenHeader title="Notifications" action={items.length > 0 && (
        <Pressable style={[styles.tool, dark && styles.surfaceDark]} disabled={disabled}
          onPress={clearInbox} accessibilityRole="button" accessibilityLabel="Delete all notifications">
          <Trash2 size={18} color={dark ? '#B8B8B8' : '#5A626D'} />
        </Pressable>
      )} />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => void reload(true)}
        ListHeaderComponent={
          <View style={styles.controls}>
            <View style={styles.summary}>
              <View style={styles.summaryIcon}><Bell size={20} color="#FFDA57" /></View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryTitle}>{loading || (error && !items.length) ? 'Inbox' : `${unread.length} unread`}</Text>
              </View>
              {unread.length > 0 && (
                <Pressable style={[styles.readAll, disabled && styles.disabled]} accessibilityRole="button"
                  onPress={() => void mutateInbox(markAllNotificationsAsRead, list => list.map(item => ({ ...item, read_status: true })))}
                  disabled={disabled}>
                  <CheckCheck size={15} color="#FFDA57" />
                  <Text style={styles.readAllText}>Mark all read</Text>
                </Pressable>
              )}
            </View>
            <SegmentedTabs value={filter} onChange={setFilter} options={[
              { value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' },
            ]} />
            {!!error && (
              <View style={styles.error}>
                <Text accessibilityRole="alert" style={[styles.detail, dark && styles.detailDark]}>{error}</Text>
                <Button title="Retry" size="small" onPress={() => void reload()} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={loading ? (
          <ActivityIndicator style={styles.empty} color="#B68900" accessibilityLabel="Loading notifications" />
        ) : error ? undefined : (
          <View style={[styles.empty, styles.surface, dark && styles.surfaceDark]}>
            <View style={[styles.emptyIcon, dark && styles.emptyIconDark]}>
              <Bell size={22} color={dark ? '#FFD700' : '#725400'} />
            </View>
            <Text style={[styles.heading, dark && styles.headingDark]}>{filter === 'unread' ? 'All caught up' : 'Your inbox is empty'}</Text>
            <Text style={[styles.detail, dark && styles.detailDark, styles.center]}>
              {filter === 'unread' ? 'There are no unread notifications.' : 'Activity from your wallet and friends will appear here.'}
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={[styles.sectionTitle, dark && styles.detailDark]}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const { Icon, color } = notificationIcons[item.type as keyof typeof notificationIcons] ?? { Icon: Bell, color: '#8694A6' };
          const isUnread = !item.read_status;
          const date = new Date(item.created_at);
          const time = date.toDateString() === todayKey ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
            : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const content = (
            <>
              <View style={[styles.rowIcon, { backgroundColor: color + '22' }]}><Icon size={19} color={color} /></View>
              <View style={styles.rowContent}>
                <Text style={[styles.heading, dark && styles.headingDark]}>{item.title}</Text>
                <Text style={[styles.detail, dark && styles.detailDark]}>{item.message}</Text>
                <Text style={[styles.time, dark && styles.detailDark]}>{time}</Text>
              </View>
              {isUnread && <View style={styles.unreadDot} />}
            </>
          );
          const rowStyles = [styles.row, styles.surface, dark && styles.surfaceDark,
            isUnread && (dark ? styles.unreadDark : styles.unread)];
          return (
            <Animated.View entering={FadeInDown.duration(180).reduceMotion(ReduceMotion.System)}
              exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}>
              {isUnread ? (
                <Pressable style={rowStyles} disabled={disabled} accessibilityRole="button" accessibilityHint="Marks this notification as read"
                  onPress={() => void mutateInbox(() => markNotificationAsRead(item.id), list =>
                    list.map(notification => notification.id === item.id ? { ...notification, read_status: true } : notification))}>
                  {content}
                </Pressable>
              ) : <View style={rowStyles}>{content}</View>}
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  screenDark: { backgroundColor: '#121212' },
  content: { paddingHorizontal: 20 },
  controls: { gap: 14, marginBottom: 10 },
  summary: { minHeight: 76, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 13, borderRadius: 19, backgroundColor: '#252117' },
  summaryIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#42391C' },
  summaryText: { flexGrow: 1, flexShrink: 1, gap: 3 },
  summaryTitle: { fontSize: 17, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  readAll: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 6 },
  readAllText: { color: '#FFDA57', fontSize: 12, fontFamily: 'Inter-SemiBold' },
  disabled: { opacity: 0.5 },
  tool: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  surface: { backgroundColor: '#FFFFFF', borderColor: '#E7E8EA', borderWidth: 1, borderRadius: 16 },
  surfaceDark: { backgroundColor: '#1E1E1E', borderColor: '#333333' },
  unread: { backgroundColor: '#FFF9E8', borderColor: '#ECE0B6' },
  unreadDark: { backgroundColor: '#282315', borderColor: '#473B20' },
  sectionTitle: { marginTop: 9, marginBottom: 8, fontSize: 13, color: '#59616D', fontFamily: 'Inter-SemiBold' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 12, marginBottom: 8 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, gap: 4 },
  heading: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#252525' },
  headingDark: { color: '#F7F7F7' },
  detail: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter-Regular', color: '#525A66' },
  detailDark: { color: '#B8B8B8' },
  time: { fontSize: 11, fontFamily: 'Inter-Medium', color: '#626A75' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D7AA16', marginTop: 6 },
  empty: { padding: 22, marginTop: 8, alignItems: 'center', gap: 8 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2C9', marginBottom: 4 },
  emptyIconDark: { backgroundColor: '#352E18' },
  center: { textAlign: 'center' },
  error: { alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
});
