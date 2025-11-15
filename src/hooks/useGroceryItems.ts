// src/hooks/useGroceryItems.ts
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import * as db from '@/lib/db';
import { Item, ItemForm } from '@/types';

// Mock API URL (dùng jsonplaceholder)
const API_URL = 'https://jsonplaceholder.typicode.com/todos';

export function useGroceryItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Q3, Q8: Tải danh sách (có thể theo query)
  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await db.getItems(searchQuery);
      setItems(data);
    } catch (e) {
      setError('Không thể tải danh sách');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]); // Chỉ tạo lại hàm nếu searchQuery thay đổi

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  // Q4: Thêm
  const handleAddItem = useCallback(async (item: Omit<ItemForm, 'id'>) => {
    await db.addItem(item);
    loadItems(); // Tải lại danh sách
  }, [loadItems]);

  // Q5: Toggle
  const handleToggleItem = useCallback(async (id: number, bought: number) => {
    await db.toggleItemBought(id, bought);
    loadItems();
  }, [loadItems]);

  // Q6: Sửa
  const handleUpdateItem = useCallback(async (item: ItemForm) => {
    if (!item.id) return;
    await db.updateItem(item);
    loadItems();
  }, [loadItems]);

  // Q7: Xóa
  const handleDeleteItem = useCallback((id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa món này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await db.deleteItem(id);
          loadItems();
        },
      },
    ]);
  }, [loadItems]);

  

  return {
    items,
    searchQuery,
    isLoading,
    isImporting,
    error,
    setSearchQuery,
    loadItems, // Q10: Cần cho Pull-to-refresh
    handleAddItem,
    handleToggleItem,
    handleUpdateItem,
    handleDeleteItem,
   
  };
}