import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge }        from '@/components/ui/badge';
import { IconCircle }   from '@/components/ui/icon-circle';
import { ListItem }     from '@/components/ui/list-item';
import { Screen }       from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useGymColors } from '@/hooks/use-gym-colors';
import { mockHistory } from '@/data/mock';
import { Fonts } from '@/constants/theme';
import type { HistoryEntry } from '@/types';

export default function HistorialScreen() {
  const colors = useGymColors();

  function renderEntry({ item }: { item: HistoryEntry }) {
    const isToday = item.date === 'hoy';
    return (
      <ListItem
        title={item.routineName}
        variant={isToday ? 'outlined' : 'elevated'}
        left={
          <IconCircle
            icon="checkmark-circle"
            variant={isToday ? 'solid' : 'tinted'}
          />
        }>
        {isToday && <Badge variant="default" style={styles.todayBadge}>Hoy</Badge>}
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.date}</Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
          <Ionicons name="barbell-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.exerciseCount} ejercicios
          </Text>
        </View>
      </ListItem>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Historial"
        subtitle={`${mockHistory.length} sesiones registradas`}
        right={
          <View
            style={[
              styles.streak,
              {
                backgroundColor: colors.danger + '12',
                borderColor: colors.danger + '40',
              },
            ]}>
            <Ionicons name="flame" size={16} color={colors.danger} />
            <Text style={[styles.streakText, { color: colors.danger }]}>4 días</Text>
          </View>
        }
      />

      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 10,
  },
  todayBadge: {
    marginTop: 2,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.monoRegular,
  },
  dot: {
    fontSize: 12,
    fontFamily: Fonts.monoRegular,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.bodyBold,
  },
});
