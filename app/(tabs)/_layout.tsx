import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialIcons.glyphMap;

/** The five destinations in the navigation flow diagram, in its order. */
const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'plans', title: 'Deadlines', icon: 'event-note' },
  { name: 'today', title: 'Today', icon: 'calendar-today' },
  { name: 'progress', title: 'Progress', icon: 'insights' },
  { name: 'me', title: 'Profile', icon: 'person' },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarItemStyle: { borderRadius: 14, marginHorizontal: 2 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <MaterialIcons name={tab.icon} size={size - 2} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
