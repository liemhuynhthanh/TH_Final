// src/types/index.ts
export type Item = {
  id: number;
  name: string;
  quantity: number;
  category: string | null;
  bought: number;
  created_at: number;
};

export type ItemForm = Omit<Item, 'id' | 'created_at'> & {
  id?: number;
};