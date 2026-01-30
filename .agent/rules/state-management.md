# State Management Rules

## Core Stack
- **Server State**: @tanstack/react-query (v5)
- **Client Global State**: Zustand
- **Form State**: @tanstack/react-form (with Zod validator)

## Pattern Guide
- **Server Data**: ALWAYS use TanStack Query for data fetching.
    - Create custom hooks for queries (e.g., `useSurveys()`).
    - Use `queryKey` factories to maintain consistency.
- **Client State**: Use Zustand for UI state that persists across components but isn't server data (e.g., `isSidebarOpen`, `authModalVisible`).
    - Keep stores small and focused.
- **Forms**: Use TanStack Form for complex forms with validation.
    - Define validation logic with Zod.
    - For simple login/search inputs, controlled React state calls are acceptable.

## Context API
- Avoid Context API for frequent state updates to prevent re-renders. Use Zustand or Query.
- Use Context for dependency injection or static configuration.
