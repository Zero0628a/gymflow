import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { mockRoutines } from '@/data/mock';
import type { Routine } from '@/types';

export default function RutinasScreen() {
  const insets = useSafeAreaInsets();

  function renderRoutine({ item }: { item: Routine }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="list-outline" size={20} color={GymFlowColors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.exerciseIds.length} ejercicios · {item.createdAt}</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={16} color={GymFlowColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Mis Rutinas</Text>
          <Text style={styles.headerSub}>{mockRoutines.length} rutinas guardadas</Text>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/crear-rutina')}
          activeOpacity={0.85}>
          <Ionicons name="add" size={20} color={GymFlowColors.white} />
          <Text style={styles.newButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockRoutines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={GymFlowColors.textMuted} />
            <Text style={styles.emptyTitle}>Sin rutinas aún</Text>
            <Text style={styles.emptyText}>Crea tu primera rutina personalizada.</Text>
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GymFlowColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: GymFlowColors.white,
    fontSize: 14,
    fontWeight: '700',
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
  cardHeader: {
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
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
    marginTop: 3,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GymFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
