import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { variants, exercises } from '@/data/mock';
import type { Variant } from '@/types';

export default function VariantesScreen() {
  const { ejercicio } = useLocalSearchParams<{ ejercicio: string }>();

  const exerciseData = Object.values(exercises)
    .flat()
    .find((e) => e.id === ejercicio);

  const lista: Variant[] = variants[ejercicio ?? ''] ?? [];

  function renderVariant({ item }: { item: Variant }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="swap-horizontal-outline" size={20} color={GymFlowColors.primary} />
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GymFlowColors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>Variantes para</Text>
          <Text style={styles.headerTitle}>{exerciseData?.name ?? 'Ejercicio'}</Text>
        </View>
      </View>

      {lista.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="construct-outline" size={48} color={GymFlowColors.textMuted} />
          <Text style={styles.emptyTitle}>Sin variantes registradas</Text>
          <Text style={styles.emptyText}>Las variantes para este ejercicio se agregarán próximamente.</Text>
        </View>
      ) : (
        <>
          <View style={styles.originCard}>
            <Ionicons name="barbell-outline" size={20} color={GymFlowColors.primaryDark} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.originLabel}>Ejercicio original</Text>
              <Text style={styles.originName}>{exerciseData?.name}</Text>
              <Text style={styles.originDesc}>{exerciseData?.description}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alternativas disponibles</Text>
            <Text style={styles.sectionCount}>{lista.length}</Text>
          </View>

          <FlatList
            data={lista}
            keyExtractor={(item) => item.id}
            renderItem={renderVariant}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: GymFlowColors.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    color: GymFlowColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: GymFlowColors.primaryDark,
    marginTop: 2,
  },
  originCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: GymFlowColors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: GymFlowColors.primary,
  },
  originLabel: {
    fontSize: 11,
    color: GymFlowColors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originName: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
    marginTop: 2,
  },
  originDesc: {
    fontSize: 12,
    color: GymFlowColors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: GymFlowColors.primary,
    backgroundColor: GymFlowColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: GymFlowColors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GymFlowColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: GymFlowColors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: GymFlowColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
