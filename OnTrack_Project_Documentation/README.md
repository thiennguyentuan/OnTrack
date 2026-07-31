# OnTrack — Project Documentation Package

## Official project decisions

- Product name: **OnTrack**
- Platform: Android-first mobile application
- Official stack: **React Native + Expo + TypeScript**
- Navigation: **Today — Plans — Me**
- Backend: **Supabase Auth + PostgreSQL + Row Level Security**
- Domain hierarchy: **Deadline → Milestone → Task → Session**
- Core value loop: **Plan → Execute → Review → Track → Adjust**

## Folder structure

### `01_Product_Analysis`
Product problem, target user, product hypothesis, scope, use cases, business rules, functional and non-functional requirements.

### `02_UX_UI`
Use-case diagram, navigation-flow diagram, wireframe overview, and the original editable/exported wireframe package.

### `03_Data_Design`
Database ERD, tables, relationships, enums, progress calculations, risk rules, RLS and transaction requirements.

### `04_Technical_Architecture`
Current technical architecture using React Native, Expo, Expo Router, TanStack Query, Zustand, React Hook Form, Zod and Supabase.

### `05_Product_Planning`
Epics, user stories, acceptance criteria, backlog priorities, six-sprint implementation plan and Expo stack correction.

### `99_Archive_Deprecated`
Old Flutter architecture retained only for historical reference. **Do not use it for implementation.**

## Source of truth priority

When documents overlap, use this order:

1. `04_Technical_Architecture/ontrack-technical-architecture-react-native-expo.md`
2. `03_Data_Design/ontrack-database-erd-data-model.md`
3. `05_Product_Planning/ontrack-product-backlog-sprint-plan.md`
4. `05_Product_Planning/ontrack-backlog-expo-stack-correction.md`
5. `01_Product_Analysis/ontrack-product-requirements-analysis.md`

## Current project status

Completed and approved:

- Product analysis
- Use cases
- UI screen structure
- Navigation flow
- Simplified wireframe direction
- Database ERD and data model
- React Native + Expo technical architecture
- Product backlog, user stories and sprint plan

Next implementation milestone:

```text
Sprint 1
→ Initialize Expo project
→ Configure Expo Router
→ Configure TanStack Query and Zustand
→ Connect Supabase
→ Build theme and Today–Plans–Me tabs
→ Implement Login, Register and Logout
```
