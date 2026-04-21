import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge }      from '@/components/ui/badge';
import { ListItem }   from '@/components/ui/list-item';
import { Screen }     from '@/components/ui/screen';
import { useGymColors } from '@/hooks/use-gym-colors';
import { muscles, exercises } from '@/data/mock';
import type { Exercise } from '@/types';

export default function EjerciciosScreen() {
  const { musculo } = useLocalSearchParams<{ musculo: string }>();
  const insets      = useSafeAreaInsets();
  const colors      = useGymColors();

  const muscle = muscles.find((m) => m.id === musculo);
  const lista  = exercises[musculo ?? ''] ?? [];
  const accent = muscle?.color ?? colors.primary;

  function renderExercise({ item, index }: { item: Exercise; index: number }) {
    return (
      <ListItem
        title={item.name}
        subtitle={item.description}
        onPress={() => router.push(`/variantes/${item.id}`)}
        left={
          <View style={[styles.indexBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.indexText, { color: colors.primary }]}>{index + 1}</Text>
          </View>
        }
        right={<Ionicons name="shuffle-outline" size={18} color={colors.primary} />}
      />
    );
  }

  return (
    <Screen>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.white,
            borderBottomColor: accent,
          },
        ]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
            {muscle?.name ?? 'Ejercicios'}
          </Text>
          <Badge variant="default">{`${lista.length} ejercicios`}</Badge>
        </View>
        <View style={[styles.dot, { backgroundColor: accent }]} />
      </View>

      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          Toca un ejercicio para ver variantes
        </Text>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 3,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  hintText: {
    fontSize: 12,
  },
  list: {
    padding: 20,
    gap: 10,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
