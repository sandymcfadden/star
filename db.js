// Database management using idb
const DB_NAME = 'starTaskDB';
const STORE_NAME = 'tasks';
const CATEGORIES_STORE = 'categories';
const DB_VERSION = 2;

class TaskDatabase {
    constructor() {
        this.db = null;
    }

    async init() {
        this.db = await idb.openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                // Create tasks store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('category', 'category', { unique: false });
                }

                // Create categories store if it doesn't exist
                if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
                    const categoriesStore = db.createObjectStore(CATEGORIES_STORE, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    categoriesStore.createIndex('name', 'name', { unique: true });
                }
            }
        });
    }

    async getAllTasks() {
        return await this.db.getAll(STORE_NAME);
    }

    async getTask(id) {
        return await this.db.get(STORE_NAME, id);
    }

    async addTask(task) {
        return await this.db.add(STORE_NAME, task);
    }

    async updateTask(id, task) {
        const updatedTask = { ...task, id };
        return await this.db.put(STORE_NAME, updatedTask);
    }

    async deleteTask(id) {
        return await this.db.delete(STORE_NAME, id);
    }

    async getTasksByCategory(category) {
        if (category === 'all') {
            return await this.getAllTasks();
        }
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const index = tx.store.index('category');
        return await index.getAll(category);
    }

    // Category management methods
    async getAllCategories() {
        return await this.db.getAll(CATEGORIES_STORE);
    }

    async getCategory(id) {
        return await this.db.get(CATEGORIES_STORE, id);
    }

    async addCategory(category) {
        return await this.db.add(CATEGORIES_STORE, category);
    }

    async updateCategory(id, category) {
        const updatedCategory = { ...category, id };
        return await this.db.put(CATEGORIES_STORE, updatedCategory);
    }

    async deleteCategory(id) {
        return await this.db.delete(CATEGORIES_STORE, id);
    }
}

const taskDB = new TaskDatabase();
