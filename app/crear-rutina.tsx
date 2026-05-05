import { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button }        from '@/components/ui/button';
import { Card }          from '@/components/ui/card';
import { Input }         from '@/components/ui/input';
import { ModalHeader }   from '@/components/ui/modal-header';
import { Screen }        from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useGymColors }  from '@/hooks/use-gym-colors';
import { exercises } from '@/data/mock';
import { useRoutines } from '@/providers/routines-provider';
import type { Exercise } from '@/types';

const allExercises: Exercise[] = Object.values(exercises).flat();

export default function CrearRutinaScreen() {
  const colors = useGymColors();
  const { createRoutine } = useRoutines();
  const [name, setName]         = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Escribe un nombre para tu rutina.');
      return;
    }
    if (selected.size === 0) {
      Alert.alert('Sin ejercicios', 'Selecciona al menos un ejercicio.');
      return;
    }

    setSaving(true);

    try {
      await createRoutine({
        name,
        exerciseIds: Array.from(selected),
      });

      Alert.alert('Rutina guardada', `"${name}" con ${selected.size} ejercicio(s).`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error al guardar rutina:', error);
      Alert.alert('Error', 'No se pudo guardar la rutina en Firebase.');
    } finally {
      setSaving(false);
    }
  }

  function renderExercise({ item }: { item: Exercise }) {
    const on = selected.has(item.id);
    return (
      <Card
        onPress={() => toggle(item.id)}
        variant={on ? 'outlined' : 'elevated'}
        style={on ? { backgroundColor: colors.surfaceAlt } : undefined}>
        <View style={styles.row}>
          <View
            style={[
              styles.checkbox,
              { borderColor: on ? colors.primary : colors.border },
              on && { backgroundColor: colors.primary },
            ]}>
            {on && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.info}>
            <Text style={[styles.exName, { color: on ? colors.primaryDark : colors.textPrimary }]}>
              {item.name}
            </Text>
            <Text
              style={[styles.exDesc, { color: colors.textMuted }]}
              numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Screen>
      <ModalHeader
        title="Nueva Rutina"
        onClose={() => router.back()}
        actionLabel="Guardar"
        onAction={() => void handleSave()}
      />

      <View style={styles.nameSection}>
        <Input
          label="Nombre de la rutina"
          placeholder="Ej: Empuje lunes"
          value={name}
          onChangeText={setName}
        />
      </View>

      <SectionHeader
        title="Ejercicios"
        right={`${selected.size} seleccionados`}
      />

      <FlatList
        data={allExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {selected.size > 0 && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.white, borderTopColor: colors.border },
          ]}>
          <Button onPress={() => void handleSave()} size="lg" icon="save-outline" loading={saving}>
            {`Guardar rutina (${selected.size})`}
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  exName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
});
