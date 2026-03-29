import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type TagProps = {
  label: string;
};

function Tag({ label }: TagProps) {
  return (
    <View style={styles.tag}>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

export default memo(Tag);

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '70%',
  },
  label: {
    color: '#2A9D8F',
    fontSize: 12,
    fontWeight: '600',
  },
});
