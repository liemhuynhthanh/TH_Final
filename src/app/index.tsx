// src/app/index.tsx
import React from 'react';
import {
  View,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text, // 👈 Sửa 1: Import 'Text'
  Pressable, // 👈 Sửa 2: Import 'Pressable' cho FAB
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { GroceryItem } from '@/components/GroceryItem';
import { EmptyState } from '@/components/EmptyState';

export default function HomeScreen() {
  const router = useRouter(); // 'router' được giữ lại nếu bạn cần dùng sau
  const {
    items,
    searchQuery,
    isLoading,
    isImporting,
    setSearchQuery,
    loadItems,
    handleToggleItem,
    handleDeleteItem,
    handleImportFromApi, // 👈 Sửa 3: Lấy hàm import từ hook
  } = useGroceryItems();

  return (
    <View style={styles.container}>
      {/* Q8: Tìm kiếm */}
      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm món hàng..."
        value={searchQuery}
        onChangeText={setSearchQuery} // Cập nhật query trong hook
      />

      {/* Q9: Import API */}
      <View style={styles.importContainer}>
        <Button
          title={isImporting ? 'Đang import...' : 'Import gợi ý từ API'}
          onPress={handleImportFromApi} // 👈 Sửa 4: Gọi đúng hàm
          disabled={isImporting}
        />
        {isImporting && <ActivityIndicator style={{ marginLeft: 10 }} />}
      </View>

      {/* Q3: Danh sách */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroceryItem
            item={item}
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
          />
        )}
        ListEmptyComponent={() =>
          isLoading ? (
            <ActivityIndicator size="large" style={{ marginTop: 30 }} />
          ) : (
            <EmptyState />
          )
        } // Q3, Q10
        contentContainerStyle={{ flexGrow: 1 }}
        // Q10: Pull to refresh
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
      />

      {/* Q4: Nút thêm mới (Sửa 5: Dùng asChild và Pressable) */}
      <Link href="/(modal)/add-edit-item" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    padding: 10,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  importContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    lineHeight: 60, // Căn chỉnh dấu + vào giữa
    textAlign: 'center',
  },
});