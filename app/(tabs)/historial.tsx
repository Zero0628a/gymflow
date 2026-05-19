import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { IconCircle } from '@/components/ui/icon-circle';
import { ListItem } from '@/components/ui/list-item';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useTraining } from '@/providers/training-provider';
import type { TrainingDayStatus } from '@/types';

export default function HistorialScreen() {
  const colors = useGymColors();
  const { recentHistory, getExerciseLog } = useTraining();
  const { getExerciseById } = useCatalog();
  const displayHistory = recentHistory;

  const completedCount = displayHistory.filter((day) => day.status === 'completed').length;
  const postponedCount = displayHistory.filter((day) => day.status === 'postponed').length;
  const missedCount = displayHistory.filter((day) => day.status === 'missed').length;

  function renderEntry({
    item,
  }: {
    item: (typeof displayHistory)[number];
  }) {
    const visual = getStatusVisual(item.status, colors);
    const statusCopy = getStatusCopy(item);

    const title = item.sessionLabel
      ? `${item.dayLabel} · ${item.sessionLabel}`
      : item.dayLabel;

    const loggedExercises = item.completedExerciseIds
      .map((eid) => {
        const log = getExerciseLog(item.dateKey, eid);
        const exercise = getExerciseById(eid);
        return log ? { name: exercise?.name ?? eid, sets: log.sets } : null;
      })
      .filter(Boolean) as { name: string; sets: { reps: number }[] }[];

    return (
      <ListItem
        title={title}
        variant={item.isToday ? 'outlined' : 'elevated'}
        left={<IconCircle icon={visual.icon} color={visual.color} variant="soft" />}
      >
        <View style={styles.badgeRow}>
          <Badge variant={visual.badgeVariant}>{visual.label}</Badge>
          {item.isToday && <Badge variant="outline">Hoy</Badge>}
        </View>
        <Text style={[styles.statusCopy, { color: visual.color }]}>{statusCopy}</Text>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.historyLabel}</Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
          <Ionicons name="barbell-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.completedExerciseIds.length}
            {item.plannedExercises.length > 0 ? ` / ${item.plannedExercises.length}` : ''} ejercicios
          </Text>
        </View>
        {loggedExercises.length > 0 && (
          <View style={[styles.logsBlock, { borderColor: colors.border }]}>
            {loggedExercises.map((entry) => {
              const setsStr = entry.sets.map((s) => `${s.reps} reps`).join('  ·  ');
              return (
                <View key={entry.name} style={styles.logRow}>
                  <Text style={[styles.logName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={[styles.logSets, { color: colors.textSecondary }]} numberOfLines={1}>
                    {setsStr}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ListItem>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Historial"
        subtitle={`${displayHistory.length} días cerrados`}
        right={
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summary,
                {
                  backgroundColor: colors.success + '12',
                  borderColor: colors.success + '36',
                },
              ]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.summaryText, { color: colors.success }]}>{completedCount}</Text>
            </View>
            <View
              style={[
                styles.summary,
                {
                  backgroundColor: colors.warning + '12',
                  borderColor: colors.warning + '36',
                },
              ]}>
              <Ionicons name="pause-circle" size={16} color={colors.warning} />
              <Text style={[styles.summaryText, { color: colors.warning }]}>{postponedCount}</Text>
            </View>
            <View
              style={[
                styles.summary,
                {
                  backgroundColor: colors.danger + '12',
                  borderColor: colors.danger + '36',
                },
              ]}>
              <Ionicons name="close-circle" size={16} color={colors.danger} />
              <Text style={[styles.summaryText, { color: colors.danger }]}>{missedCount}</Text>
            </View>
          </View>
        }
      />

      <FlatList
        data={displayHistory}
        keyExtractor={(item) => item.dateKey}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="Sin historial"
            description="Todavia no cerraste dias en tu calendario."
          />
        }
      />
    </Screen>
  );
}

function getStatusVisual(status: TrainingDayStatus, colors: ReturnType<typeof useGymColors>) {
  if (status === 'completed') {
    return {
      label: 'Completado',
      icon: 'checkmark-circle' as const,
      color: colors.success,
      badgeVariant: 'success' as const,
    };
  }

  if (status === 'partial') {
    return {
      label: 'Parcial',
      icon: 'time-outline' as const,
      color: colors.warning,
      badgeVariant: 'warning' as const,
    };
  }

  if (status === 'postponed') {
    return {
      label: 'Pospuesto',
      icon: 'pause-circle' as const,
      color: colors.warning,
      badgeVariant: 'warning' as const,
    };
  }

  return {
    label: 'Perdido',
    icon: 'close-circle' as const,
    color: colors.danger,
    badgeVariant: 'danger' as const,
  };
}

function getStatusCopy(item: ReturnType<typeof useTraining>['recentHistory'][number]) {
  if (item.status === 'completed') {
    return `${item.completedExerciseIds.length} ejercicio(s) registrados`;
  }

  if (item.status === 'partial') {
    return `${item.completedExerciseIds.length} de ${item.plannedExercises.length} ejercicios`;
  }

  if (item.status === 'postponed') {
    return 'Sesion pausada sin contar como perdida';
  }

  return 'No registraste ejercicios ese dia';
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  statusCopy: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.monoRegular,
  },
  dot: {
    fontSize: 12,
    fontFamily: Fonts.monoRegular,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  summaryText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logsBlock: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  logRow: {
    gap: 2,
  },
  logName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
  },
  logSets: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
  },
});
