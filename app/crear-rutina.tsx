import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GymFlowColors } from '@/constants/theme';
import { exercises } from '@/data/mock';
import type { Exercise } from '@/types';

const allExercises: Exercise[] = Object.values(exercises).flat();

export default function CrearRutinaScreen() {
  const [name, setName]             = useState('');
  const [selected, setSelected]     = useState<Set<string>>(new Set());

  function toggleExercise(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Escribe un nombre para tu rutina.');
      return;
    }
    if (selected.size === 0) {
      Alert.alert('Sin ejercicios', 'Selecciona al menos un ejercicio.');
      return;
    }
    Alert.alert('Rutina guardada', `"${name}" con ${selected.size} ejercicio(s).`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  function renderExercise({ item }: { item: Exercise }) {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.exerciseCard, isSelected && styles.exerciseCardSelected]}
        onPress={() => toggleExercise(item.id)}
        activeOpacity={0.75}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={14} color={GymFlowColors.white} />}
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, isSelected && styles.exerciseNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.exerciseDesc} numberOfLines={1}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={GymFlowColors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Nueva Rutina</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.label}>Nombre de la rutina</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Ej: Empuje lunes"
          placeholderTextColor={GymFlowColors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios</Text>
        <Text style={styles.sectionCount}>{selected.size} seleccionados</Text>
      </View>

      <FlatList
        data={allExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {selected.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="save-outline" size={18} color={GymFlowColors.white} />
            <Text style={styles.saveButtonText}>Guardar rutina ({selected.size})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GymFlowColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: GymFlowColors.white,
    borderBottomWidth: 1,
    borderBottomColor: GymFlowColors.border,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: GymFlowColors.primary,
  },
  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: GymFlowColors.textSecondary,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: GymFlowColors.white,
    borderWidth: 1.5,
    borderColor: GymFlowColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: GymFlowColors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
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
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 8,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymFlowColors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  exerciseCardSelected: {
    borderColor: GymFlowColors.primary,
    backgroundColor: GymFlowColors.surfaceAlt,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GymFlowColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: GymFlowColors.primary,
    borderColor: GymFlowColors.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: GymFlowColors.textPrimary,
  },
  exerciseNameSelected: {
    color: GymFlowColors.primaryDark,
  },
  exerciseDesc: {
    fontSize: 12,
    color: GymFlowColors.textMuted,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: GymFlowColors.white,
    borderTopWidth: 1,
    borderTopColor: GymFlowColors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GymFlowColors.primary,
    borderRadius: 14,
    height: 52,
    shadowColor: GymFlowColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: GymFlowColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
