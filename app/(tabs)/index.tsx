import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="p-8 items-center">
        <Text className="text-3xl font-bold text-gray-900">My Mobile App</Text>
        <Text className="text-gray-500">Clean & Minimal Template</Text>
      </View>

      {/* Button Grid */}
      <View className="grid grid-cols-2 gap-4 p-4">
        <TouchableOpacity className="bg-white p-4 border border-gray-300 rounded items-center">
          <Text className="text-gray-800">Button 1</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 border border-gray-300 rounded items-center">
          <Text className="text-gray-800">Button 2</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 border border-gray-300 rounded items-center">
          <Text className="text-gray-800">Button 3</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 border border-gray-300 rounded items-center">
          <Text className="text-gray-800">Button 4</Text>
        </TouchableOpacity>
      </View>

      {/* Card Grid */}
      <View className="grid grid-cols-2 gap-4 p-4">
        <View className="bg-white p-4 border border-gray-300 rounded shadow">
          <Text className="font-semibold text-gray-800 mb-2">Card One</Text>
          <Text className="text-gray-600">Card content goes here.</Text>
        </View>
        <View className="bg-white p-4 border border-gray-300 rounded shadow">
          <Text className="font-semibold text-gray-800 mb-2">Card Two</Text>
          <Text className="text-gray-600">Card content goes here.</Text>
        </View>
        <View className="bg-white p-4 border border-gray-300 rounded shadow">
          <Text className="font-semibold text-gray-800 mb-2">Card Three</Text>
          <Text className="text-gray-600">Card content goes here.</Text>
        </View>
        <View className="bg-white p-4 border border-gray-300 rounded shadow">
          <Text className="font-semibold text-gray-800 mb-2">Card Four</Text>
          <Text className="text-gray-600">Card content goes here.</Text>
        </View>
      </View>

      {/* Footer */}
      <View className="p-6 border-t border-gray-300 items-center">
        <Text className="text-sm text-gray-500">&copy; 2025 My Mobile App. All rights reserved.</Text>
        <View className="flex-row space-x-4 mt-2">
          <Text className="text-gray-700">Documents</Text>
          <Text className="text-gray-700">Terms...</Text>
          <Text className="text-gray-700">Contact</Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}
