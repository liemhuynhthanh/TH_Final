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

  

  // Q9: Import
  const handleImportFromApi = useCallback(async () => {
    setIsImporting(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const apiData: { title: string; completed: boolean }[] = await response.json();
      
      // Map dữ liệu API sang định dạng DB
      const itemsToImport = apiData.map(apiItem => ({
        name: apiItem.title, // Map 'title' sang 'name'
        bought: apiItem.completed ? 1 : 0 // Map 'completed' sang 'bought'
      }));

      await db.importFromApi(itemsToImport);
      Alert.alert('Thành công', `Đã import. Các món trùng lặp đã được bỏ qua.`);
      loadItems(); // Tải lại để hiển thị dữ liệu mới
    } catch (e) {
      console.error(e);
      setError('Import thất bại. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Import thất bại. Vui lòng thử lại.');
    } finally {
      setIsImporting(false);
    }
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
   
    handleImportFromApi,
  };
}