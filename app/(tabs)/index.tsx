import { FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Button }       from '@/components/ui/button';
import { IconCircle }   from '@/components/ui/icon-circle';
import { ListItem }     from '@/components/ui/list-item';
import { Screen }       from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { muscles } from '@/data/mock';
import { useAuth } from '@/providers/auth-provider';
import type { Muscle } from '@/types';

export default function HomeScreen() {
  const { logout } = useAuth();

  function renderMuscle({ item }: { item: Muscle }) {
    return (
      <ListItem
        title={item.name}
        subtitle="Abrir ejercicios"
        onPress={() => router.push(`/ejercicios/${item.id}`)}
        left={<IconCircle icon={item.icon as any} color={item.color} size="lg" />}
        showChevron
      />
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="¿Qué vas a entrenar hoy?"
        subtitle="Selección de grupo muscular"
        right={
          <Button
            onPress={() => logout()}
            size="sm"
            variant="outline"
            icon="log-out-outline">
            Salir
          </Button>
        }
      />

      <FlatList
        data={muscles}
        keyExtractor={(item) => item.id}
        renderItem={renderMuscle}
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
});
