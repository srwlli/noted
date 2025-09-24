import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function LandingPage() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Your Notes, Everywhere You Work
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
        The universal productivity hub that connects with your favorite apps, tools, and workflows.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8
        }}
        onPress={() => {
          // Navigate without using Link component for now
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Try Free
        </Text>
      </TouchableOpacity>
    </View>
  );
}