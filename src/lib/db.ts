// src/lib/db.ts
import { openDatabaseSync } from 'expo-sqlite';
import { GroceryItem, GroceryItemForm } from '@/types';

const db = openDatabaseSync('grocery.db');

// Q1 & Q2: Khởi tạo, Tạo bảng, Seed dữ liệu
export async function initDb() {
  await db.execAsync(`
    PRAGMA journal_mode = 'WAL';

    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      bought INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (CAST(strftime('%s', 'now') AS INTEGER))
    );
  `);

  // Q2: Seed dữ liệu mẫu nếu bảng trống
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM grocery_items'
  );

  if (result && result.count === 0) {
    console.log('Seeding sample data...');
    await db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Sữa', 1);
    await db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Trứng', 12);
    await db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Bánh mì', 1);
  }
  console.log('Database initialized!');
}

// Q3, Q8: Hàm lấy dữ liệu (có tìm kiếm)
export async function getItems(query: string): Promise<GroceryItem[]> {
  if (query) {
    return db.getAllAsync<GroceryItem>(
      'SELECT * FROM grocery_items WHERE name LIKE ? ORDER BY created_at DESC',
      `%${query}%`
    );
  }
  return db.getAllAsync<GroceryItem>('SELECT * FROM grocery_items ORDER BY created_at DESC');
}

// Q4: Hàm thêm mới
export async function addItem(item: Omit<GroceryItemForm, 'id'>) {
  return db.runAsync(
    'INSERT INTO grocery_items (name, quantity, category) VALUES (?, ?, ?)',
    item.name,
    item.quantity,
    item.category || null
  );
}

// Q5: Hàm Toggle
export async function toggleItemBought(id: number, bought: number) {
  return db.runAsync('UPDATE grocery_items SET bought = ? WHERE id = ?', bought ? 0 : 1, id);
}

// Q6: Hàm cập nhật
export async function updateItem(item: GroceryItemForm) {
  return db.runAsync(
    'UPDATE grocery_items SET name = ?, quantity = ?, category = ? WHERE id = ?',
    item.name,
    item.quantity,
    item.category || null,
    item.id
  );
}

// Q7: Hàm xóa
export async function deleteItem(id: number) {
  return db.runAsync('DELETE FROM grocery_items WHERE id = ?', id);
}

// Q9: Hàm Import từ API (Dùng ON CONFLICT để tránh trùng lặp 'name')
// Chúng ta cần thêm UNIQUE constraint cho 'name'
export async function ensureUniqueNameConstraint() {
  // Tạo index (và constraint) nếu chưa tồn tại
  await db.execAsync('CREATE UNIQUE INDEX IF NOT EXISTS idx_grocery_items_name ON grocery_items(name);');
}

export async function importFromApi(items: { name: string; bought: number }[]) {
  // Dùng transaction để tăng tốc độ import hàng loạt
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    for (const item of items) {
      // "INSERT ... ON CONFLICT(name) DO NOTHING" sẽ tự động bỏ qua nếu name đã tồn tại
      await db.runAsync(
        'INSERT INTO grocery_items (name, bought) VALUES (?, ?) ON CONFLICT(name) DO NOTHING',
        item.name,
        item.bought
      );
    }
    await db.execAsync('COMMIT;');
  } catch (e) {
    await db.execAsync('ROLLBACK;');
    throw e;
  }
}

// Chạy hàm init khi file này được import lần đầu
initDb().then(ensureUniqueNameConstraint);