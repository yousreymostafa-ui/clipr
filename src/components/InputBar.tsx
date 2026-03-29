import { memo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type InputBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

function InputBar({ value, onChangeText, onSubmit }: InputBarProps) {
  return (
    <View style={styles.outerWrap}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Open quick actions')}>
          <Text style={styles.plus}>＋</Text>
        </TouchableOpacity>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Paste a link or type a note..."
          placeholderTextColor="#8F9896"
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
        />

        <TouchableOpacity style={styles.sendButton} onPress={onSubmit}>
          <Text style={styles.sendText}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(InputBar);

const styles = StyleSheet.create({
  outerWrap: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECEB',
    backgroundColor: '#F7F9F8',
    paddingTop: 8,
  },
  container: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 10 : 12,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBE9',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
    shadowColor: '#0E1514',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F1',
  },
  plus: {
    fontSize: 22,
    color: '#4E5857',
    marginTop: -2,
  },
  input: {
    flex: 1,
    minHeight: 42,
    fontSize: 15,
    color: '#121716',
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A9D8F',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
});
