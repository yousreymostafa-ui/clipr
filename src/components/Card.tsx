import { memo, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { FeedItem } from '../types/feed';
import Tag from './Tag';

type CardProps = {
  item: FeedItem;
  onPress: (item: FeedItem) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
};

const ACTIONS_WIDTH = 136;

function Card({ item, onPress, onArchive, onDelete }: CardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const settleTo = (toValue: number) => {
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        const nextX = Math.max(-ACTIONS_WIDTH, Math.min(0, gestureState.dx));
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -45) {
          settleTo(-ACTIONS_WIDTH);
        } else {
          settleTo(0);
        }
      },
      onPanResponderTerminate: () => settleTo(0),
    })
  ).current;

  const animatePress = (value: number) => {
    Animated.spring(pressScale, {
      toValue: value,
      useNativeDriver: true,
      stiffness: 260,
      damping: 18,
      mass: 0.6,
    }).start();
  };

  return (
    <View style={styles.rowWrap}>
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.actionButton, styles.archiveButton]}
          onPress={() => onArchive(item.id)}
        >
          <Text style={styles.actionText}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.animatedCard,
          {
            transform: [{ translateX }, { scale: pressScale }],
          },
        ]}
      >
        <Pressable
          onPress={() => onPress(item)}
          onLongPress={() => animatePress(0.97)}
          onPressOut={() => animatePress(1)}
          style={styles.card}
        >
          <View style={styles.thumbWrap}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={styles.placeholderThumb}>
                <Text style={styles.placeholderText}>Note</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {item.description}
            </Text>
            <View style={styles.metaRow}>
              <Text numberOfLines={1} style={styles.metaText}>
                {item.url ? new URL(item.url).hostname.replace('www.', '') : 'note'}
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text numberOfLines={1} style={styles.metaText}>
                {item.savedAgo}
              </Text>
            </View>
            <Tag label={item.collection} />
          </View>

          <TouchableOpacity
            style={styles.bookmarkButton}
            hitSlop={8}
            onPress={() => console.log(`Save toggle: ${item.id}`)}
          >
            <Text style={styles.bookmarkIcon}>⌁</Text>
          </TouchableOpacity>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default memo(Card);

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: 12,
    minHeight: 86,
    justifyContent: 'center',
  },
  actions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingLeft: 88,
  },
  actionButton: {
    width: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveButton: {
    backgroundColor: '#E4E8E7',
  },
  deleteButton: {
    backgroundColor: '#FCEAEA',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#394047',
  },
  deleteText: {
    color: '#C73C3C',
  },
  animatedCard: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEFEE',
    shadowColor: '#0E1514',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  thumbWrap: {
    marginRight: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#EDF1F0',
  },
  placeholderThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#EDF1F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#8A9492',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#121716',
  },
  subtitle: {
    fontSize: 13,
    color: '#5D6765',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#8A9492',
    maxWidth: '45%',
  },
  dot: {
    marginHorizontal: 6,
    color: '#A0A8A6',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  bookmarkIcon: {
    color: '#5E6668',
    fontSize: 18,
  },
});
