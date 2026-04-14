import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { muscles } from '@/data/mock';
import type { Muscle } from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  function renderMuscle({ item }: { item: Muscle }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/ejercicios/${item.id}`)}>
        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={28} color={item.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSub}>Ver ejercicios</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={GymFlowColors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.headerTitle}>¿Qué vas a entrenar hoy?</Text>
        </View>
        <View style={styles.logoSmall}>
          <Ionicons name="barbell" size={22} color={GymFlowColors.white} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Grupos musculares</Text>
        <Text style={styles.sectionCount}>{muscles.length} grupos</Text>
      </View>

      <FlatList
        data={muscles}
        keyExtractor={(item) => item.id}
        renderItem={renderMuscle}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: GymFlowColors.white,
    borderBottomWidth: 1,
    borderBottomColor: GymFlowColors.border,
  },
  greeting: {
    fontSize: 13,
    color: GymFlowColors.textSecondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: GymFlowColors.primaryDark,
    marginTop: 2,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GymFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
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
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
    marginTop: 2,
  },
});
