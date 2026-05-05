import { View, FlatList, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { Button }       from '@/components/ui/button';
import { Badge }        from '@/components/ui/badge';
import { EmptyState }   from '@/components/ui/empty-state';
import { IconCircle }   from '@/components/ui/icon-circle';
import { ListItem }     from '@/components/ui/list-item';
import { Screen }       from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useRoutines } from '@/providers/routines-provider';
import { Fonts } from '@/constants/theme';
import type { Routine } from '@/types';

const routineDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function RutinasScreen() {
  const colors = useGymColors();
  const { loading, routines } = useRoutines();

  function renderRoutine({ item }: { item: Routine }) {
    return (
      <ListItem
        title={item.name}
        left={<IconCircle icon="list-outline" variant="tinted" />}
        right={<IconCircle icon="play" variant="solid" size="sm" />}>
        <View style={styles.meta}>
          <Badge variant="default">{`${item.exerciseIds.length} ejercicios`}</Badge>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formatRoutineDate(item.createdAt)}</Text>
        </View>
      </ListItem>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Mis Rutinas"
        subtitle={loading ? 'Cargando rutinas' : `${routines.length} rutinas registradas`}
        right={
          <Button
            onPress={() => router.push('/crear-rutina')}
            size="sm"
            icon="add">
            Nueva
          </Button>
        }
      />

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="Sin rutinas"
            description="Registra una rutina para iniciar el seguimiento."
            actionLabel="Crear rutina"
            onAction={() => router.push('/crear-rutina')}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: Fonts.monoRegular,
  },
});

function formatRoutineDate(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return routineDateFormatter.format(date);
}
