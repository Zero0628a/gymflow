import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, LinearTransition } from 'react-native-reanimated';

import { ActionSheet, type ActionSheetOption } from '@/components/ui/action-sheet';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useProfile } from '@/providers/profile-provider';
import { useRoutines } from '@/providers/routines-provider';
import { filterRoutinesForProfile } from '@/lib/routine-matching';
import type { Routine } from '@/types';

const routineDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});

export default function RutinasScreen() {
  const colors = useGymColors();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sheetRoutine, setSheetRoutine] = useState<Routine | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Routine | null>(null);
  const [toast, setToast] = useState('');
  const { loading: catalogLoading, routineTemplates } = useCatalog();
  const { profile } = useProfile();
  const {
    loading,
    routines,
    activateRoutine,
    archiveRoutine,
    duplicateRoutine,
    deleteRoutine,
    createRoutine,
  } = useRoutines();

  const suggestedTemplates = useMemo(
    () => filterRoutinesForProfile(routineTemplates, profile).slice(0, 8),
    [profile, routineTemplates]
  );

  const userRoutines = useMemo(
    () =>
      [...routines].sort((left, right) => {
        const leftRank = statusRank(left.status);
        const rightRank = statusRank(right.status);
        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return getRoutineTimestamp(right) - getRoutineTimestamp(left);
      }),
    [routines]
  );

  async function handlePromoteTemplate(template: Routine) {
    setBusyId(template.id);
    try {
      await createRoutine({
        name: template.name,
        exerciseIds: template.exerciseIds,
        focusLabel: template.focusLabel,
        description: template.description,
        level: template.level,
        goal: template.goal,
        daysPerWeek: template.daysPerWeek,
        equipment: template.equipment,
        split: template.split,
        weeklyPlan: template.weeklyPlan,
        source: 'template',
      });
    } catch (error) {
      console.error('No se pudo guardar rutina sugerida:', error);
      setToast('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setBusyId(null);
    }
  }

  function openRoutineEditor(routine: Routine) {
    router.push({
      pathname: '/editar-rutina/[id]' as any,
      params: { id: routine.id },
    });
  }

  function buildSheetOptions(routine: Routine): ActionSheetOption[] {
    const options: ActionSheetOption[] = [];

    if (routine.status !== 'active') {
      options.push({
        label: 'Activar rutina',
        icon: 'play-circle-outline',
        onPress: () => void runRoutineAction(routine.id, () => activateRoutine(routine.id)),
      });
    }

    options.push({
      label: 'Editar',
      icon: 'pencil-outline',
      onPress: () => {
        setSheetRoutine(null);
        openRoutineEditor(routine);
      },
    });

    options.push({
      label: 'Duplicar',
      icon: 'copy-outline',
      onPress: () => void runRoutineAction(routine.id, () => duplicateRoutine(routine.id)),
    });

    if (routine.status !== 'archived') {
      options.push({
        label: 'Archivar',
        icon: 'archive-outline',
        onPress: () => void runRoutineAction(routine.id, () => archiveRoutine(routine.id)),
      });
    }

    options.push({
      label: 'Eliminar',
      icon: 'trash-outline',
      variant: 'destructive',
      onPress: () => setConfirmDelete(routine),
    });

    return options;
  }

  async function runRoutineAction(routineId: string, action: () => Promise<void>) {
    setBusyId(routineId);
    try {
      await action();
    } catch (error) {
      console.error('No se pudo gestionar rutina:', error);
      setToast('No se pudo completar. Revisá tu conexión.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen>
      <Toast visible={!!toast} message={toast} variant="error" onHide={() => setToast('')} />
      {/* Sheet de acciones */}
      <ActionSheet
        visible={!!sheetRoutine}
        title={sheetRoutine?.name}
        options={sheetRoutine ? buildSheetOptions(sheetRoutine) : []}
        onClose={() => setSheetRoutine(null)}
      />

      {/* Confirmacion de eliminar */}
      <ActionSheet
        visible={!!confirmDelete}
        title="Eliminar rutina"
        subtitle="Esta acción no se puede deshacer."
        options={[
          {
            label: 'Eliminar definitivamente',
            icon: 'trash-outline',
            variant: 'destructive',
            onPress: () => {
              if (confirmDelete) {
                void runRoutineAction(confirmDelete.id, () => deleteRoutine(confirmDelete.id));
              }
              setConfirmDelete(null);
            },
          },
        ]}
        onClose={() => setConfirmDelete(null)}
      />

      <ScreenHeader
        title="Rutinas"
        subtitle={loading || catalogLoading ? 'Cargando biblioteca' : `${userRoutines.length} guardadas`}
        right={
          <Button onPress={() => router.push('/crear-rutina')} size="sm" icon="add">
            Crear
          </Button>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Tus rutinas</Text>
          <Text style={[styles.count, { color: colors.textPrimary }]}>{userRoutines.length}</Text>
        </View>

        {userRoutines.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="Aún no hay rutinas"
            description="Crea la primera o toma una sugerida como punto de partida."
            actionLabel="Crear rutina"
            onAction={() => router.push('/crear-rutina')}
            style={styles.empty}
          />
        ) : (
          <View style={styles.grid}>
            {userRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                busy={busyId === routine.id}
                onPress={() => {
                  if (routine.status === 'active') {
                    openRoutineEditor(routine);
                    return;
                  }

                  void runRoutineAction(routine.id, () => activateRoutine(routine.id));
                }}
                onMorePress={() => setSheetRoutine(routine)}
              />
            ))}
          </View>
        )}

        <View style={styles.suggestedHeader}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Sugeridas</Text>
            <Text style={[styles.helper, { color: colors.textMuted }]}>Entrada rápida</Text>
          </View>
          <Text style={[styles.suggestedCopy, { color: colors.textSecondary }]}>
            Plantillas sobrias para empezar sin armar todo desde cero.
          </Text>
        </View>

        <View style={styles.suggestedList}>
          {suggestedTemplates.map((routine) => (
            <SuggestedCard
              key={routine.id}
              routine={routine}
              busy={busyId === routine.id}
              onUse={() => void handlePromoteTemplate(routine)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function RoutineCard({
  routine,
  busy,
  onPress,
  onMorePress,
}: {
  routine: Routine;
  busy: boolean;
  onPress: () => void;
  onMorePress: () => void;
}) {
  const colors = useGymColors();
  const meta = `${routine.focusLabel ?? 'Rutina personalizada'} · ${routine.exerciseIds.length} ejercicios`;

  return (
    <Animated.View
      style={styles.cardWrap}
      layout={LinearTransition.duration(320).easing(Easing.inOut(Easing.cubic))}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.bgSurface,
            borderColor: routine.status === 'active' ? colors.accent : colors.border,
            opacity: routine.status === 'archived' ? 0.64 : 1,
          },
          pressed && styles.cardPressed,
        ]}>
      {routine.status === 'active' && (
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
      )}

      <View style={styles.cardTop}>
        <View style={styles.chipRow}>
          <StatusChip status={routine.status} />
        </View>
        <Pressable onPress={onMorePress} hitSlop={8} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {routine.name}
      </Text>

      <Text style={[styles.cardMeta, { color: colors.textSecondary }]} numberOfLines={2}>
        {meta}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.cardFooter, { color: colors.textMuted }]}>
        {getRoutineFooter(routine)}
      </Text>
      </Pressable>
    </Animated.View>
  );
}

function SuggestedCard({
  routine,
  busy,
  onUse,
}: {
  routine: Routine;
  busy: boolean;
  onUse: () => void;
}) {
  const colors = useGymColors();

  return (
    <View style={[styles.suggestedCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
      <View style={styles.suggestedTop}>
        <Text style={[styles.suggestedLabel, { color: colors.accent }]}>Sugerida</Text>
        <Text style={[styles.suggestedCount, { color: colors.textMuted }]}>
          {routine.exerciseIds.length} ejercicios
        </Text>
      </View>

      <Text style={[styles.suggestedTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {routine.name}
      </Text>
      <Text style={[styles.suggestedMeta, { color: colors.textSecondary }]} numberOfLines={2}>
        {routine.focusLabel ?? 'Rutina guiada'}
      </Text>

      <Button onPress={onUse} size="sm" variant="outline" loading={busy} style={styles.suggestedButton}>
        Guardar
      </Button>
    </View>
  );
}

function StatusChip({ status }: { status: Routine['status'] }) {
  const colors = useGymColors();

  const palette = {
    active: { label: 'Activa', bg: colors.accentSoft, fg: colors.accent },
    draft: { label: 'Borrador', bg: 'transparent', fg: colors.textSecondary, border: colors.borderStrong },
    archived: { label: 'Archivada', bg: colors.bgSurfaceAlt, fg: colors.textMuted },
    ready: { label: 'Lista', bg: colors.bgSurfaceAlt, fg: colors.textSecondary },
  }[status];

  return (
    <View
      style={[
        styles.statusChip,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border ?? 'transparent',
          borderWidth: palette.border ? 1 : 0,
        },
      ]}>
      <Text style={[styles.statusText, { color: palette.fg }]}>{palette.label}</Text>
    </View>
  );
}

function getRoutineFooter(routine: Routine) {
  if (routine.status === 'active') {
    return 'Activa esta semana';
  }

  if (routine.lastUsedAt) {
    return `Último uso · ${formatRoutineDate(routine.lastUsedAt)}`;
  }

  if (routine.status === 'draft') {
    return 'Pendiente de completar';
  }

  return `Creada · ${formatRoutineDate(routine.createdAt)}`;
}

function formatRoutineDate(value?: string) {
  if (!value) {
    return 'sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return routineDateFormatter.format(date);
}

function getRoutineTimestamp(routine: Routine) {
  return new Date(routine.updatedAt ?? routine.lastUsedAt ?? routine.createdAt).getTime() || 0;
}

function statusRank(status: Routine['status']) {
  switch (status) {
    case 'active':
      return 0;
    case 'ready':
      return 1;
    case 'draft':
      return 2;
    case 'archived':
      return 3;
    default:
      return 4;
  }
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 28,
  },
  helper: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  empty: {
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  cardWrap: {
    width: '48%',
    height: 210,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chipRow: {
    gap: 6,
    maxWidth: '80%',
  },
  moreButton: {
    paddingLeft: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: 0.2,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  cardMeta: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  cardFooter: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  suggestedHeader: {
    marginTop: 40,
  },
  suggestedCopy: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 320,
  },
  suggestedList: {
    marginTop: 16,
    gap: 12,
  },
  suggestedCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  suggestedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  suggestedLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  suggestedCount: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  suggestedTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 26,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  suggestedMeta: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  suggestedButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
});
