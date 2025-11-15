// src/components/GroceryItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Item } from '@/types/index';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'; // Q7

type Props = {
  item: Item;
  onToggle: (id: number, bought: number) => void;
  onDelete: (id: number) => void;
};

export function GroceryItem({ item, onToggle, onDelete }: Props) {
  const router = useRouter();

  // Q6: Hàm mở modal Sửa
  const handleEdit = () => {
    router.push({
      pathname: '/(modal)/add-edit-item',
      params: { item: JSON.stringify(item) }, // Truyền dữ liệu item sang modal
    });
  };
  
  // Q7: Component hành động khi vuốt (Swipe)
  const renderRightActions = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item.id)}>
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onToggle(item.id, item.bought)} // Q5: Toggle
        onLongPress={handleEdit} // Q6: Sửa (bằng LongPress)
      >
        <View style={styles.itemDetails}>
          <Text style={[styles.name, item.bought && styles.bought]}>
            {item.name}
          </Text>
          <Text style={styles.meta}>
            Số lượng: {item.quantity} {item.category ? `| ${item.category}` : ''}
          </Text>
        </View>
        <Text style={styles.status}>{item.bought ? '✅' : '🛒'}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  itemDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  bought: { // Q5: UI
    textDecorationLine: 'line-through',
    color: '#999',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  status: {
    fontSize: 20,
    marginLeft: 15,
  },
  actionButton: { // Q7: UI
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});