// src/app/(modal)/add-edit-item.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGroceryItems } from '@/hooks/useGroceryItems'; // Dùng lại hook
import { Item } from '@/types';

export default function AddEditModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { handleAddItem, handleUpdateItem } = useGroceryItems();

  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('');
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  // Q6: Load dữ liệu nếu là Sửa
  useEffect(() => {
    if (params.item) {
      try {
        const itemToEdit: Item = JSON.parse(params.item as string);
        setIsEditMode(true);
        setCurrentItem(itemToEdit);
        setName(itemToEdit.name);
        setQuantity(itemToEdit.quantity.toString());
        setCategory(itemToEdit.category || '');
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể đọc dữ liệu món hàng.');
      }
    }
  }, [params.item]);

  const handleSave = async () => {
    // Q4: Validate
    if (name.trim() === '') {
      Alert.alert('Lỗi', 'Tên món hàng không được để trống');
      return;
    }

    const qty = parseInt(quantity, 10) || 1;

    try {
      if (isEditMode && currentItem) {
        // Q6: Sửa
        await handleUpdateItem({
          id: currentItem.id,
          name: name.trim(),
          quantity: qty,
          category: category.trim(),
          bought: currentItem.bought, // Giữ nguyên trạng thái bought
        });
      } else {
        // Q4: Thêm
       await handleAddItem({
          name: name.trim(),
          quantity: qty,
          category: category.trim(),
          bought: 0 // 👈 THÊM DÒNG NÀY ĐỂ HẾT LỖI
        });
      }
      router.back(); // Đóng modal sau khi lưu
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu món hàng.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên món hàng (Bắt buộc)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Sữa tươi"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Số lượng</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 1"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Loại (Tùy chọn)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Đồ uống"
        value={category}
        onChangeText={setCategory}
      />

      <Button
        title={isEditMode ? 'Cập nhật' : 'Thêm vào danh sách'}
        onPress={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
});