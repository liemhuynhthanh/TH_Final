// src/types/index.ts
export type GroceryItem = {
  id: number;
  name: string;
  quantity: number;
  category: string | null;
  bought: number;
  created_at: number;
};

export type GroceryItemForm = Omit<GroceryItem, 'id' | 'created_at'> & {
  id?: number;
};