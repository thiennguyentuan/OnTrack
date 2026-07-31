import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      headerShown: false,
    }}>
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarLabel: 'Today' }} />
      <Tabs.Screen name="plans" options={{ title: 'Plans', tabBarLabel: 'Plans' }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarLabel: 'Me' }} />
    </Tabs>
  );
}
