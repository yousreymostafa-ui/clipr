import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Card from './src/components/Card';
import InputBar from './src/components/InputBar';
import { INITIAL_FEED } from './src/data/mockFeed';
import type { FeedItem, FeedItemType } from './src/types/feed';

type TabKey = 'all' | FeedItemType;

type TabItem = {
  key: TabKey;
  label: string;
};

const TABS: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'link', label: 'Links' },
  { key: 'note', label: 'Notes' },
];

function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);

  const filteredFeed = useMemo(() => {
    if (activeTab === 'all') return feed;
    return feed.filter((item) => item.type === activeTab);
  }, [feed, activeTab]);

  const onCardPress = useCallback((item: FeedItem) => {
    console.log('Open detail:', item.id, item.title);
  }, []);

  const onArchive = useCallback((id: string) => {
    setFeed((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onDelete = useCallback((id: string) => {
    setFeed((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onSubmit = useCallback(() => {
    const value = query.trim();
    if (!value) return;

    const isLink = /^https?:\/\//i.test(value);
    const host = isLink ? new URL(value).hostname.replace('www.', '') : 'quick note';

    const newItem: FeedItem = {
      id: Date.now().toString(),
      title: isLink ? `Saved from ${host}` : value,
      description: isLink ? 'Captured from input bar' : 'Quick note saved from feed',
      url: isLink ? value : '',
      thumbnail: undefined,
      collection: isLink ? 'Inbox Links' : 'Quick Notes',
      savedAgo: 'Saved now',
      type: isLink ? 'link' : 'note',
    };

    if (isLink) {
      console.log('Link detected:', value);
    }

    setFeed((prev) => [newItem, ...prev]);
    setQuery('');
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <Card item={item} onPress={onCardPress} onArchive={onArchive} onDelete={onDelete} />
    ),
    [onCardPress, onArchive, onDelete]
  );

  const emptyComponent = (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIllustration} />
      <Text style={styles.emptyTitle}>No saved content yet</Text>
      <Text style={styles.emptySubtitle}>Paste a link to get started</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.logo}>CL/PR</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Text style={styles.headerIcon}>⌕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn}>
              <Text style={styles.avatarText}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
      >
        <FlatList
          data={filteredFeed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 16 + insets.bottom, flexGrow: filteredFeed.length ? 0 : 1 },
          ]}
          ListEmptyComponent={emptyComponent}
          keyboardShouldPersistTaps="handled"
        />
        <InputBar value={query} onChangeText={setQuery} onSubmit={onSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FeedScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECEA',
    backgroundColor: '#F7F9F8',
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111615',
    letterSpacing: 0.6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F1',
  },
  headerIcon: {
    fontSize: 18,
    color: '#414B49',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8E1DF',
  },
  avatarText: {
    color: '#213130',
    fontWeight: '700',
    fontSize: 15,
  },
  tabsContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: '#E6ECEA',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2A9D8F',
  },
  tabText: {
    color: '#4E5958',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIllustration: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E7ECEA',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1C2423',
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6D7876',
  },
});
