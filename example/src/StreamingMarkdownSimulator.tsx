import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ComponentRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Pressable,
} from 'react-native';
import { StreamdownText } from 'react-native-streamdown';
import { sampleMarkdown } from './sampleMarkdown';

const STREAMING_SPEED = 10;
const STREAMING_INTERVAL = 50;

export default function StreamingMarkdownSimulator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const partialMarkdown = useMemo(
    () => sampleMarkdown.slice(0, currentIndex),
    [currentIndex]
  );
  const progress = useMemo(
    () => (currentIndex / sampleMarkdown.length) * 100,
    [currentIndex]
  );

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStreaming(false);
  }, []);

  const resetStream = useCallback(() => {
    stopStreaming();
    setCurrentIndex(0);
  }, [stopStreaming]);

  const startStreaming = useCallback(() => {
    if (isStreaming) return;
    if (currentIndex >= sampleMarkdown.length) setCurrentIndex(0);

    setIsStreaming(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + STREAMING_SPEED;
        if (next >= sampleMarkdown.length) {
          stopStreaming();
          return sampleMarkdown.length;
        }
        return next;
      });
    }, STREAMING_INTERVAL);
  }, [isStreaming, currentIndex, stopStreaming]);

  const handleLinkPress = (url: string) => {
    Alert.alert('Open Link?', url, [
      { text: 'Open', onPress: () => Linking.openURL(url) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  useEffect(() => stopStreaming, [stopStreaming]);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress.toFixed(1)}% — {currentIndex} / {sampleMarkdown.length}{' '}
            chars
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <ControlButton
            label={isStreaming ? 'Streaming...' : 'Start'}
            onPress={startStreaming}
            disabled={isStreaming}
            color="#4CAF50"
          />
          <ControlButton
            label="Stop"
            onPress={stopStreaming}
            disabled={!isStreaming}
            color="#f44336"
          />
          <ControlButton label="Reset" onPress={resetStream} color="#2196F3" />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() =>
          isStreaming && scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        <StreamdownText
          markdown={partialMarkdown}
          onLinkPress={(e) => handleLinkPress(e.url)}
        />
        {isStreaming && <Text style={styles.streamingDot}>● Streaming…</Text>}
      </ScrollView>
    </View>
  );
}

const ControlButton = ({ label, onPress, disabled, color }: any) => (
  <Pressable
    style={[
      styles.button,
      { backgroundColor: color },
      disabled && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  controls: {
    padding: 14,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  progressContainer: { marginBottom: 10 },
  progressBar: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#666', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.4 },
  scrollContent: { padding: 16 },
  streamingDot: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
