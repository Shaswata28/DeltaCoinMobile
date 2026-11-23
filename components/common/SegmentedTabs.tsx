import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Segment<T extends string> = { value: T; label: string; count?: number };

export function SegmentedTabs<T extends string>({ options, value, onChange }: {
  options: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const dark = useColorScheme() === 'dark';
  const index = options.findIndex((option) => option.value === value);
  const position = useSharedValue(index);
  const width = 100 / options.length;

  useEffect(() => {
    position.value = withTiming(index, {
      duration: 230,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [index, position]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${position.value * width}%` as const,
    width: `${width}%` as const,
  }));

  return (
    <View style={[styles.track, dark && styles.trackDark]} accessibilityRole="tablist">
      <View style={styles.row}>
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        {options.map(({ value: option, label, count }) => (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: value === option }}
            style={[styles.tab, { width: `${width}%` }]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.label, dark && styles.labelDark, value === option && styles.selectedLabel]}>
              {label}{count ? <Text style={styles.count}>{` ${count}`}</Text> : null}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { padding: 4, borderRadius: 16, backgroundColor: '#ECEEF1' },
  trackDark: { backgroundColor: '#252525' },
  row: { flexDirection: 'row', position: 'relative' },
  indicator: { position: 'absolute', top: 0, bottom: 0, borderRadius: 13, backgroundColor: '#FFD700' },
  tab: { minHeight: 44, paddingHorizontal: 6, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, lineHeight: 20, includeFontPadding: false, textAlign: 'center', fontFamily: 'Inter-SemiBold', color: '#515965' },
  count: { fontSize: 12 },
  labelDark: { color: '#BBBBBB' },
  selectedLabel: { color: '#241D03' },
});
