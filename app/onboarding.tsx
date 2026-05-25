import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Toast } from '@/components/ui/toast';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useProfile } from '@/providers/profile-provider';
import { useRoutines } from '@/providers/routines-provider';
import {
  EQUIPMENT_LABEL,
  GOAL_LABEL,
  LEVEL_LABEL,
  pickRoutinesForProfile,
} from '@/lib/routine-matching';
import { getTrainingWeekdays } from '@/lib/routine-planner';
import type {
  Routine,
  RoutineEquipmentSetup,
  RoutineGoal,
  RoutineLevel,
  UserProfile,
} from '@/types';

type Step = 'goal' | 'level' | 'days' | 'equipment' | 'pick';

const STEPS: Step[] = ['goal', 'level', 'days', 'equipment', 'pick'];

const GOAL_OPTIONS: { value: RoutineGoal; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'strength', title: 'Fuerza', description: 'Levantar mas peso, ganar potencia.', icon: 'barbell' },
  { value: 'hypertrophy', title: 'Hipertrofia', description: 'Ganar masa muscular, definir.', icon: 'fitness' },
  { value: 'endurance', title: 'Resistencia', description: 'Aguantar mas, mejor capacidad.', icon: 'pulse' },
  { value: 'general', title: 'Forma general', description: 'Salud, energia y bienestar.', icon: 'shield-checkmark' },
];

const LEVEL_OPTIONS: { value: RoutineLevel; title: string; description: string }[] = [
  { value: 'beginner', title: 'Principiante', description: 'Recien empiezo o vuelvo despues de tiempo.' },
  { value: 'intermediate', title: 'Intermedio', description: 'Entreno regular hace 6+ meses, conozco la tecnica.' },
  { value: 'advanced', title: 'Avanzado', description: '2+ anos consistentes, busco progresion fina.' },
];

const DEFAULT_TRAINING_WEEKDAYS = getTrainingWeekdays(3);
const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const EQUIPMENT_OPTIONS: { value: RoutineEquipmentSetup; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'gym', title: 'Gimnasio', description: 'Tengo acceso a maquinas, barras y mancuernas.', icon: 'business' },
  { value: 'home', title: 'En casa', description: 'Sin maquinas, con o sin mancuernas/bandas.', icon: 'home' },
];

export default function OnboardingScreen() {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const { routineTemplates } = useCatalog();
  const { saveOnboardingProfile, markOnboardingComplete } = useProfile();
  const { createRoutine } = useRoutines();

  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState<RoutineGoal | null>(null);
  const [level, setLevel] = useState<RoutineLevel | null>(null);
  const [trainingWeekdays, setTrainingWeekdays] = useState<number[]>(DEFAULT_TRAINING_WEEKDAYS);
  const [equipment, setEquipment] = useState<RoutineEquipmentSetup | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const currentStep = STEPS[stepIndex];
  const profileDraft: UserProfile | null = useMemo(() => {
    if (!goal || !level || trainingWeekdays.length === 0 || !equipment) return null;
    return {
      goal,
      level,
      daysPerWeek: trainingWeekdays.length,
      trainingWeekdays,
      equipment,
      completedOnboarding: false,
    };
  }, [goal, level, trainingWeekdays, equipment]);

  const suggestions = useMemo(() => {
    if (!profileDraft) return [];
    return pickRoutinesForProfile(routineTemplates, profileDraft, 5);
  }, [profileDraft, routineTemplates]);

  function canAdvance(): boolean {
    switch (currentStep) {
      case 'goal': return !!goal;
      case 'level': return !!level;
      case 'days': return trainingWeekdays.length > 0;
      case 'equipment': return !!equipment;
      case 'pick': return !!selectedRoutineId;
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      return;
    }
    setStepIndex((index) => index - 1);
  }

  function handleNext() {
    if (!canAdvance()) return;
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  async function handleFinish() {
    if (!profileDraft || !selectedRoutineId) return;

    const routine = suggestions.find((entry) => entry.id === selectedRoutineId);
    if (!routine) return;

    setSaving(true);

    try {
      await saveOnboardingProfile({
        goal: profileDraft.goal,
        level: profileDraft.level,
        daysPerWeek: profileDraft.daysPerWeek,
        trainingWeekdays: profileDraft.trainingWeekdays,
        equipment: profileDraft.equipment,
      });

      await createRoutine({
        name: routine.name,
        exerciseIds: routine.exerciseIds,
        focusLabel: routine.focusLabel,
        description: routine.description,
        level: routine.level,
        goal: routine.goal,
        daysPerWeek: routine.daysPerWeek,
        equipment: routine.equipment,
        split: routine.split,
        weeklyPlan: routine.weeklyPlan,
        source: 'template',
        status: 'active',
      });

      await markOnboardingComplete();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al finalizar onboarding:', error);
      setToast('No se pudo guardar. Revisa tu conexion e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Toast visible={!!toast} message={toast} variant="error" onHide={() => setToast('')} />
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={handleBack}
          disabled={stepIndex === 0}
          style={({ pressed }) => [
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.bgSurface },
            stepIndex === 0 && styles.backDisabled,
            pressed && stepIndex > 0 && styles.pressed,
          ]}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progressBar}>
          {STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index <= stepIndex ? colors.accent : colors.border,
                  width: index === stepIndex ? 28 : 16,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}>
        {currentStep === 'goal' && (
          <StepGoal value={goal} onChange={setGoal} />
        )}
        {currentStep === 'level' && (
          <StepLevel value={level} onChange={setLevel} />
        )}
        {currentStep === 'days' && (
          <StepDays value={trainingWeekdays} onChange={setTrainingWeekdays} />
        )}
        {currentStep === 'equipment' && (
          <StepEquipment value={equipment} onChange={setEquipment} />
        )}
        {currentStep === 'pick' && profileDraft && (
          <StepPick
            profile={profileDraft}
            suggestions={suggestions}
            selectedId={selectedRoutineId}
            onSelect={setSelectedRoutineId}
          />
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.bgCanvas,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 16,
          },
        ]}>
        {currentStep === 'pick' ? (
          <Button
            onPress={() => void handleFinish()}
            size="lg"
            icon="checkmark"
            loading={saving}
            disabled={!canAdvance()}>
            Empezar
          </Button>
        ) : (
          <Button
            onPress={handleNext}
            size="lg"
            icon="arrow-forward"
            iconPosition="right"
            disabled={!canAdvance()}>
            Continuar
          </Button>
        )}
      </View>
    </Screen>
  );
}

function StepGoal({
  value,
  onChange,
}: {
  value: RoutineGoal | null;
  onChange: (next: RoutineGoal) => void;
}) {
  return (
    <Section eyebrow="Paso 1 de 5" title="Cual es tu objetivo" body="Vamos a buscar rutinas alineadas a lo que querés conseguir.">
      <View style={styles.stack}>
        {GOAL_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </Section>
  );
}

function StepLevel({
  value,
  onChange,
}: {
  value: RoutineLevel | null;
  onChange: (next: RoutineLevel) => void;
}) {
  return (
    <Section eyebrow="Paso 2 de 5" title="Tu nivel actual" body="Asi calibramos volumen y dificultad. Si dudas, elegí el menor.">
      <View style={styles.stack}>
        {LEVEL_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </Section>
  );
}

function StepDays({
  value,
  onChange,
}: {
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const colors = useGymColors();
  function toggleDay(day: number) {
    if (value.includes(day)) {
      if (value.length === 1) return;
      onChange(value.filter((item) => item !== day));
      return;
    }

    onChange(
      [...value, day].sort((left, right) => {
        const orderLeft = left === 0 ? 7 : left;
        const orderRight = right === 0 ? 7 : right;
        return orderLeft - orderRight;
      })
    );
  }

  return (
    <Section eyebrow="Paso 3 de 5" title="Qué días puedes entrenar" body="Marca los días reales que tienes disponibles. Puedes elegir 1, 2, 3 o más.">
      <View style={styles.daysGrid}>
        {WEEKDAY_OPTIONS.map((day) => {
          const selected = value.includes(day.value);
          return (
            <Pressable
              key={day.value}
              onPress={() => toggleDay(day.value)}
              style={({ pressed }) => [
                styles.dayBox,
                {
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.bgSurface,
                },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.dayValue, { color: selected ? colors.accent : colors.textPrimary }]}>
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.daysHint, { color: colors.textMuted }]}>
        {value.length} {value.length === 1 ? 'día seleccionado' : 'días seleccionados'}
      </Text>
    </Section>
  );
}

function StepEquipment({
  value,
  onChange,
}: {
  value: RoutineEquipmentSetup | null;
  onChange: (next: RoutineEquipmentSetup) => void;
}) {
  return (
    <Section eyebrow="Paso 4 de 5" title="Donde entrenas" body="Filtramos rutinas segun el equipamiento que tenes disponible.">
      <View style={styles.stack}>
        {EQUIPMENT_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </Section>
  );
}

function StepPick({
  profile,
  suggestions,
  selectedId,
  onSelect,
}: {
  profile: UserProfile;
  suggestions: Routine[];
  selectedId: string | null;
  onSelect: (routineId: string) => void;
}) {
  const colors = useGymColors();
  const summary = `${GOAL_LABEL[profile.goal]} · ${LEVEL_LABEL[profile.level]} · ${profile.daysPerWeek} dias · ${EQUIPMENT_LABEL[profile.equipment]}`;

  return (
    <Section
      eyebrow="Paso 5 de 5"
      title="Tu rutina inicial"
      body={`Estas son las que mejor encajan con: ${summary}. Eligí una para activarla esta semana — podes cambiarla cuando quieras.`}
    >
      {suggestions.length === 0 ? (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Sin rutinas que encajen
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Volve atras y ajusta tus respuestas, o crea tu propia rutina desde la pantalla Rutinas.
          </Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {suggestions.map((routine) => (
            <RoutineSuggestionCard
              key={routine.id}
              routine={routine}
              selected={selectedId === routine.id}
              onPress={() => onSelect(routine.id)}
            />
          ))}
        </View>
      )}
    </Section>
  );
}

function RoutineSuggestionCard({
  routine,
  selected,
  onPress,
}: {
  routine: Routine;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useGymColors();
  const metaLine = [
    routine.level ? LEVEL_LABEL[routine.level] : null,
    routine.daysPerWeek ? `${routine.daysPerWeek} dias` : null,
    routine.equipment ? EQUIPMENT_LABEL[routine.equipment] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.routineCard,
        {
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accentSoft : colors.bgSurface,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.routineHead}>
        <View style={styles.routineTitleBlock}>
          {routine.focusLabel ? (
            <Text style={[styles.routineEyebrow, { color: selected ? colors.accent : colors.textSecondary }]}>
              {routine.focusLabel}
            </Text>
          ) : null}
          <Text style={[styles.routineTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {routine.name}
          </Text>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: selected ? colors.accent : colors.borderStrong,
              backgroundColor: selected ? colors.accent : 'transparent',
            },
          ]}>
          {selected && <Ionicons name="checkmark" size={14} color={colors.textInverse} />}
        </View>
      </View>

      {routine.description ? (
        <Text style={[styles.routineDesc, { color: colors.textSecondary }]} numberOfLines={3}>
          {routine.description}
        </Text>
      ) : null}

      <Text style={[styles.routineMeta, { color: colors.textMuted }]}>{metaLine}</Text>
    </Pressable>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  const colors = useGymColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function OptionCard({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useGymColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accentSoft : colors.bgSurface,
        },
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <View
          style={[
            styles.optionIcon,
            { backgroundColor: selected ? colors.accent : colors.bgSurfaceAlt },
          ]}>
          <Ionicons name={icon} size={20} color={selected ? colors.textInverse : colors.textPrimary} />
        </View>
      ) : null}
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.optionBody, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.accent : colors.borderStrong,
            backgroundColor: selected ? colors.accent : 'transparent',
          },
        ]}>
        {selected && <Ionicons name="checkmark" size={12} color={colors.textInverse} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 36,
  },
  backDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  section: {
    gap: 6,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 40,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  sectionBody: {
    marginTop: 24,
  },
  stack: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    fontWeight: '700',
  },
  optionBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayBox: {
    width: '30.8%',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dayValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
  },
  daysHint: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  routineCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  routineHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  routineTitleBlock: {
    flex: 1,
    gap: 4,
  },
  routineEyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  routineTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  routineMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyBox: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
  },
  emptyBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
