// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // Cần GestureHandlerRootView cho các cử chỉ (vd: swipe Q7)
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Danh sách đi chợ' }} />
        <Stack.Screen
          name="(modal)/add-edit-item"
          options={{
            presentation: 'modal', // Hiển thị dạng modal từ dưới lên
            title: 'Thêm/Sửa món',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}