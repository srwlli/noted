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
    />
  );
}
