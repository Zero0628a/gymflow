import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { mockHistory } from '@/data/mock';
import type { HistoryEntry } from '@/types';

export default function HistorialScreen() {
  const insets = useSafeAreaInsets();

  function renderEntry({ item, index }: { item: HistoryEntry; index: number }) {
    const isToday = item.date === 'hoy';
    return (
      <View style={[styles.card, isToday && styles.cardToday]}>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>Hoy</Text>
          </View>
        )}
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, isToday && styles.iconBoxToday]}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={isToday ? GymFlowColors.white : GymFlowColors.primary}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{item.routineName}</Text>
            <View style={styles.cardMeta}>
              <Ionicons name="time-outline" size={12} color={GymFlowColors.textMuted} />
              <Text style={styles.cardMetaText}>{item.date}</Text>
              <Text style={styles.cardMetaDot}>·</Text>
              <Ionicons name="barbell-outline" size={12} color={GymFlowColors.textMuted} />
              <Text style={styles.cardMetaText}>{item.exerciseCount} ejercicios</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSub}>{mockHistory.length} sesiones completadas</Text>
        </View>
        <View style={styles.statsBadge}>
          <Ionicons name="flame" size={16} color={GymFlowColors.danger} />
          <Text style={styles.statsText}>4 días</Text>
        </View>
      </View>

      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={GymFlowColors.textMuted} />
            <Text style={styles.emptyTitle}>Sin historial aún</Text>
            <Text style={styles.emptyText}>Completa una rutina para ver tu progreso aquí.</Text>
          </View>
        }
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: GymFlowColors.white,
    borderBottomWidth: 1,
    borderBottomColor: GymFlowColors.border,
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
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  statsText: {
    fontSize: 13,
    fontWeight: '700',
    color: GymFlowColors.danger,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: GymFlowColors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardToday: {
    borderWidth: 1.5,
    borderColor: GymFlowColors.primary,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GymFlowColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: GymFlowColors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GymFlowColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxToday: {
    backgroundColor: GymFlowColors.primary,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardMetaText: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
  },
  cardMetaDot: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
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
  },
});
