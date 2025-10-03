import { Stack } from 'expo-router';

/**
 * Layout for markdown editor routes
 * Configures slide-in animations for smooth transitions
 */
export default function NoteEditorLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: true,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="test"
        options={{
          title: 'Markdown Editor Test',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Note',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Note',
        }}
      />
    </Stack>
  );
}
