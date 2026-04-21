import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge }         from '@/components/ui/badge';
import { EmptyState }    from '@/components/ui/empty-state';
import { IconCircle }    from '@/components/ui/icon-circle';
import { ListItem }      from '@/components/ui/list-item';
import { Screen }        from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useGymColors }  from '@/hooks/use-gym-colors';
import { variants, exercises } from '@/data/mock';
import type { Variant } from '@/types';

export default function VariantesScreen() {
  const { ejercicio } = useLocalSearchParams<{ ejercicio: string }>();
  const insets        = useSafeAreaInsets();
  const colors        = useGymColors();

  const exerciseData = Object.values(exercises).flat().find((e) => e.id === ejercicio);
  const lista: Variant[] = variants[ejercicio ?? ''] ?? [];

  function renderVariant({ item }: { item: Variant }) {
    return (
      <ListItem
        title={item.name}
        subtitle={item.description}
        left={<IconCircle icon="swap-horizontal-outline" variant="tinted" />}
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
            borderBottomColor: colors.border,
          },
        ]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: colors.textMuted }]}>Variantes para</Text>
          <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
            {exerciseData?.name ?? 'Ejercicio'}
          </Text>
        </View>
      </View>

      {lista.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title="Sin variantes registradas"
          description="Las variantes para este ejercicio se agregarán próximamente."
        />
      ) : (
        <>
          <View
            style={[
              styles.originCard,
              { backgroundColor: colors.surface, borderLeftColor: colors.primary },
            ]}>
            <Ionicons name="barbell-outline" size={20} color={colors.primaryDark} />
            <View style={styles.originInfo}>
              <Text style={[styles.originLabel, { color: colors.primary }]}>Ejercicio original</Text>
              <Text style={[styles.originName, { color: colors.textPrimary }]}>
                {exerciseData?.name}
              </Text>
              <Text style={[styles.originDesc, { color: colors.textSecondary }]}>
                {exerciseData?.description}
              </Text>
            </View>
          </View>

          <SectionHeader
            title="Alternativas disponibles"
            right={<Badge variant="default">{String(lista.length)}</Badge>}
          />

          <FlatList
            data={lista}
            keyExtractor={(item) => item.id}
            renderItem={renderVariant}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  originCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  originInfo: {
    marginLeft: 10,
    flex: 1,
  },
  originLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  originDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
});
