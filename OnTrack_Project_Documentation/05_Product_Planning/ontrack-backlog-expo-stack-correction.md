# OnTrack — Stack Correction for Product Backlog

The previously approved Product Backlog remains valid at the product and acceptance-criteria level.

Replace all Flutter-specific implementation references with the following official stack:

```text
React Native
Expo
TypeScript
Expo Router
TanStack Query
Zustand
React Hook Form
Zod
Supabase
```

## Required backlog corrections

### US-001 — Initialize project

Replace:

```text
Flutter project
Riverpod
GoRouter
```

With:

```text
Expo React Native project with TypeScript
Expo Router
TanStack Query
Zustand
Supabase client
```

### US-002 — Global theme

Implement with React Native theme tokens and reusable TypeScript components.

### US-003 — Navigation

Implement with Expo Router Tabs and Stack layouts.

### Focus lifecycle stories

Use:

```text
React Native AppState
AsyncStorage active-session snapshot
Timestamp-based timer
expo-notifications
```

### High Focus

Treat automatic Android DND control as Should Have.

MVP behavior:

```text
Explain High Focus
→ Open Android DND settings
→ Let user enable it
→ Continue Session
```

A Development Build or native module may be required for deeper automatic DND integration.

### Testing

Replace Flutter tests with:

```text
Jest
React Native Testing Library
Maestro or equivalent E2E
```

### Release

Replace APK build tooling with:

```text
Expo Development Build
EAS Build
```

All Epics, User Stories, business rules, priorities and the six-sprint sequence remain unchanged.
