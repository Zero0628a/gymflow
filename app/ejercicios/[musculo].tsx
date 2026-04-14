import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { muscles, exercises } from '@/data/mock';
import type { Exercise } from '@/types';

export default function EjerciciosScreen() {
  const { musculo } = useLocalSearchParams<{ musculo: string }>();

  const muscle = muscles.find((m) => m.id === musculo);
  const lista  = exercises[musculo ?? ''] ?? [];

  function renderExercise({ item, index }: { item: Exercise; index: number }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/variantes/${item.id}`)}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        </View>
        <Ionicons name="shuffle-outline" size={18} color={GymFlowColors.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: muscle?.color ?? GymFlowColors.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GymFlowColors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{muscle?.name ?? 'Ejercicios'}</Text>
          <Text style={styles.headerSub}>{lista.length} ejercicios disponibles</Text>
        </View>
        <View style={[styles.dotColor, { backgroundColor: muscle?.color ?? GymFlowColors.primary }]} />
      </View>

      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={15} color={GymFlowColors.textMuted} />
        <Text style={styles.hintText}>Toca un ejercicio para ver variantes</Text>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GymFlowColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GymFlowColors.white,
    borderBottomWidth: 3,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: GymFlowColors.primaryDark,
  },
  headerSub: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
    marginTop: 2,
  },
  dotColor: {
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
    color: GymFlowColors.textMuted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymFlowColors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GymFlowColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: GymFlowColors.primary,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
    marginTop: 2,
  },
});
