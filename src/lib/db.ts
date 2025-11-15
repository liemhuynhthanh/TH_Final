// src/lib/db.ts
import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { Item, ItemForm } from '@/types';

// Biến _db để giữ kết nối CSDL
let _db: SQLiteDatabase | null = null;

// Hàm "lazy" để lấy CSDL.
// Nó sẽ chỉ mở và khởi tạo CSDL ở lần gọi đầu tiên.
async function getDb(): Promise<SQLiteDatabase> {
  // Nếu đã kết nối, trả về luôn
  if (_db) return _db;

  // Nếu chưa, mở CSDL bất đồng bộ (ASYNC)
  _db = await openDatabaseAsync('grocery.db');

  // Q1 & Q2: Khởi tạo, Tạo bảng
  await _db.execAsync(`
    PRAGMA journal_mode = 'WAL';

    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      bought INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (CAST(strftime('%s', 'now') AS INTEGER))
    );
    
    -- Q9: Thêm UNIQUE constraint cho 'name' để 'import' không bị trùng
    CREATE UNIQUE INDEX IF NOT EXISTS idx_grocery_items_name ON grocery_items(name);
  `);

  // Q2: Seed dữ liệu mẫu nếu bảng trống
  const result = await _db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM grocery_items'
  );

  if (result && result.count === 0) {
    console.log('Seeding sample data...');
    await _db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Sữa', 1);
    await _db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Trứng', 12);
    await _db.runAsync('INSERT INTO grocery_items (name, quantity) VALUES (?, ?)', 'Bánh mì', 1);
  }
  
  console.log('Database initialized!');
  return _db;
}


// --- TẤT CẢ CÁC HÀM XUẤT RA ĐỀU PHẢI SỬA LẠI ---
// Thêm "const db = await getDb();" ở dòng đầu tiên

// Q3, Q8: Hàm lấy dữ liệu (có tìm kiếm)
export async function getItems(query: string): Promise<Item[]> {
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
  if (query) {
    return db.getAllAsync<Item>(
      'SELECT * FROM grocery_items WHERE name LIKE ? ORDER BY created_at DESC',
      `%${query}%`
    );
  }
  return db.getAllAsync<Item>('SELECT * FROM grocery_items ORDER BY created_at DESC');
}

// Q4: Hàm thêm mới
export async function addItem(item: Omit<ItemForm, 'id'>) {
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
  return db.runAsync(
    'INSERT INTO grocery_items (name, quantity, category, bought) VALUES (?, ?, ?, ?)',
    item.name,
    item.quantity,
    item.category || null,
    item.bought // Thêm 'bought' vào (từ lỗi trước)
  );
}

// Q5: Hàm Toggle
export async function toggleItemBought(id: number, bought: number) {
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
  return db.runAsync('UPDATE grocery_items SET bought = ? WHERE id = ?', bought ? 0 : 1, id);
}

// Q6: Hàm cập nhật
export async function updateItem(item: ItemForm) {
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
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
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
  return db.runAsync('DELETE FROM grocery_items WHERE id = ?', id);
}

// Q9: Hàm Import từ API
export async function importFromApi(items: { name: string; bought: number }[]) {
  const db = await getDb(); // 👈 Sửa: Phải chờ CSDL sẵn sàng
  
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    for (const item of items) {
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