// Application state
let currentFilter = 'all';
let currentEditingTaskId = null;
let searchQuery = '';
let categories = [];
let lastFocusedElement = null;
let focusTrapCleanup = null;

// DOM elements
const mainContainer = document.getElementById('mainContainer');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const bulkAddBtn = document.getElementById('bulkAddBtn');
const exportBtn = document.getElementById('exportBtn');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const searchInput = document.getElementById('searchInput');
const taskModal = document.getElementById('taskModal');
const bulkModal = document.getElementById('bulkModal');
const exportModal = document.getElementById('exportModal');
const categoryModal = document.getElementById('categoryModal');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const bulkForm = document.getElementById('bulkForm');
const categoryForm = document.getElementById('categoryForm');
const exportText = document.getElementById('exportText');
const filterButtons = document.getElementById('filterButtons');
const categoryList = document.getElementById('categoryList');
const cancelBtn = document.getElementById('cancelBtn');
const cancelBulkBtn = document.getElementById('cancelBulkBtn');
const closeExportBtn = document.getElementById('closeExportBtn');
const closeCategoryBtn = document.getElementById('closeCategoryBtn');
const copyExportBtn = document.getElementById('copyExportBtn');
const closeBtn = document.querySelector('.close');
const closeBulkBtn = document.querySelector('.close-bulk');
const closeExportX = document.querySelector('.close-export');
const closeCategoryX = document.querySelector('.close-category');
const announcements = document.getElementById('announcements');

// Theme management
function initTheme() {
    // Check localStorage for saved theme, default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const isDark = theme === 'dark';

    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
        themeToggle.setAttribute('aria-checked', 'true');
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
        themeToggle.setAttribute('title', 'Switch to light mode');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
        themeToggle.setAttribute('aria-checked', 'false');
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        themeToggle.setAttribute('title', 'Switch to dark mode');
    }

    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Accessibility helper functions
function announce(message, priority = 'polite') {
    if (!announcements) return;
    announcements.setAttribute('aria-live', priority);
    announcements.textContent = message;
    // Clear after announcement
    setTimeout(() => {
        announcements.textContent = '';
    }, 1000);
}

function trapFocus(modalElement) {
    // Clean up any previous focus trap
    if (focusTrapCleanup) {
        focusTrapCleanup();
    }

    // Make main content inert so it can't be focused or interacted with
    mainContainer.inert = true;

    const getFocusableElements = () => {
        return modalElement.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    };

    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        const focusableElements = getFocusableElements();
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    };

    // Add event listeners
    modalElement.addEventListener('keydown', handleTabKey);

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
        // Use setTimeout to ensure the modal is fully rendered
        setTimeout(() => {
            focusableElements[0].focus();
        }, 50);
    }

    // Return cleanup function
    focusTrapCleanup = () => {
        modalElement.removeEventListener('keydown', handleTabKey);
        mainContainer.inert = false;
        focusTrapCleanup = null;
    };
}

// Initialize the application
async function init() {
    // Ensure main container is not inert on startup
    mainContainer.inert = false;

    initTheme();
    await taskDB.init();
    await loadCategories();
    renderFilterButtons();
    await renderTasks();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    addTaskBtn.addEventListener('click', () => openModal());
    themeToggle.addEventListener('click', toggleTheme);
    settingsBtn.addEventListener('click', toggleSettingsMenu);
    bulkAddBtn.addEventListener('click', () => {
        closeSettingsMenu();
        openBulkModal();
    });
    exportBtn.addEventListener('click', () => {
        closeSettingsMenu();
        openExportModal();
    });
    manageCategoriesBtn.addEventListener('click', () => {
        closeSettingsMenu();
        openCategoryModal();
    });
    cancelBtn.addEventListener('click', closeModal);
    cancelBulkBtn.addEventListener('click', closeBulkModal);
    closeExportBtn.addEventListener('click', closeExportModal);
    closeCategoryBtn.addEventListener('click', closeCategoryModal);
    copyExportBtn.addEventListener('click', copyToClipboard);
    closeBtn.addEventListener('click', closeModal);
    closeBulkBtn.addEventListener('click', closeBulkModal);
    closeExportX.addEventListener('click', closeExportModal);
    closeCategoryX.addEventListener('click', closeCategoryModal);
    taskForm.addEventListener('submit', handleTaskSubmit);
    bulkForm.addEventListener('submit', handleBulkSubmit);
    categoryForm.addEventListener('submit', handleCategorySubmit);

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });

    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            // Only close if the menu is actually open
            if (settingsMenu.classList.contains('show')) {
                closeSettingsMenu();
            }
        }
    });

    // ESC key to close modals and dropdowns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (taskModal.classList.contains('active')) {
                closeModal();
            } else if (bulkModal.classList.contains('active')) {
                closeBulkModal();
            } else if (exportModal.classList.contains('active')) {
                closeExportModal();
            } else if (categoryModal.classList.contains('active')) {
                closeCategoryModal();
            } else if (settingsMenu.classList.contains('show')) {
                closeSettingsMenu();
            }
        }
    });

    // Keyboard navigation for settings menu
    settingsMenu.addEventListener('keydown', (e) => {
        const menuItems = Array.from(settingsMenu.querySelectorAll('.settings-menu-item'));
        const currentIndex = menuItems.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % menuItems.length;
            menuItems[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            menuItems[prevIndex].focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            menuItems[0].focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            menuItems[menuItems.length - 1].focus();
        }
    });

    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });

    bulkModal.addEventListener('click', (e) => {
        if (e.target === bulkModal) {
            closeBulkModal();
        }
    });

    exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            closeExportModal();
        }
    });

    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeCategoryModal();
        }
    });
}

// Settings menu functions
function toggleSettingsMenu(e) {
    e.stopPropagation();
    const isOpen = settingsMenu.classList.toggle('show');
    settingsBtn.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
        // Focus first menu item
        const firstItem = settingsMenu.querySelector('.settings-menu-item');
        if (firstItem) firstItem.focus();
    }
}

function closeSettingsMenu() {
    settingsMenu.classList.remove('show');
    settingsBtn.setAttribute('aria-expanded', 'false');
    settingsBtn.focus();
}

// Safety check to ensure inert is managed correctly
function ensureInertState() {
    const anyModalOpen = taskModal.classList.contains('active') ||
                        bulkModal.classList.contains('active') ||
                        exportModal.classList.contains('active') ||
                        categoryModal.classList.contains('active');

    // If no modal is open, ensure mainContainer is not inert
    if (!anyModalOpen && mainContainer.inert) {
        mainContainer.inert = false;
        if (focusTrapCleanup) {
            focusTrapCleanup();
        }
    }
}

// Modal functions
async function openModal(task = null) {
    lastFocusedElement = document.activeElement;
    currentEditingTaskId = task ? task.id : null;

    await updateCategoryDropdowns();

    if (task) {
        modalTitle.textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('situation').value = task.star.situation;
        document.getElementById('task').value = task.star.task;
        document.getElementById('action').value = task.star.action;
        document.getElementById('result').value = task.star.result;
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
    }

    taskModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    trapFocus(taskModal.querySelector('.modal-content'));
}

function closeModal() {
    if (focusTrapCleanup) focusTrapCleanup();
    mainContainer.inert = false; // Always ensure inert is removed
    taskModal.classList.remove('active');
    taskForm.reset();
    currentEditingTaskId = null;
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Bulk modal functions
async function openBulkModal() {
    lastFocusedElement = document.activeElement;
    await updateCategoryDropdowns();
    // Set to first category if available
    if (categories.length > 0) {
        document.getElementById('bulkCategory').value = categories[0].name;
    }
    bulkModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    trapFocus(bulkModal.querySelector('.modal-content'));
}

function closeBulkModal() {
    if (focusTrapCleanup) focusTrapCleanup();
    mainContainer.inert = false; // Always ensure inert is removed
    bulkModal.classList.remove('active');
    bulkForm.reset();
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Export modal functions
async function openExportModal() {
    const tasks = await taskDB.getAllTasks();

    if (tasks.length === 0) {
        announce('No tasks to export', 'assertive');
        return;
    }

    lastFocusedElement = document.activeElement;
    const exportedText = generateExportText(tasks);
    exportText.value = exportedText;
    exportModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    trapFocus(exportModal.querySelector('.modal-content'));
}

function closeExportModal() {
    if (focusTrapCleanup) focusTrapCleanup();
    mainContainer.inert = false; // Always ensure inert is removed
    exportModal.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Generate export text from tasks
function generateExportText(tasks) {
    return tasks.map(task => {
        return `${task.title}
**Situation:**
${task.star.situation}
**Task:**
${task.star.task}
**Action:**
${task.star.action}
**Result:**
${task.star.result}`;
    }).join('\n\n');
}

// Copy to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(exportText.value);

        // Change button text temporarily
        const originalText = copyExportBtn.textContent;
        copyExportBtn.textContent = 'Copied!';
        announce('Tasks copied to clipboard');
        setTimeout(() => {
            copyExportBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        exportText.select();
        document.execCommand('copy');
        announce('Tasks copied to clipboard');
    }
}

// Category management functions
async function loadCategories() {
    categories = await taskDB.getAllCategories();
}

function renderFilterButtons() {
    filterButtons.innerHTML = '<button class="filter-btn active" data-category="all" aria-pressed="true">All</button>';

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = category.name;
        btn.textContent = category.name.charAt(0).toUpperCase() + category.name.slice(1);
        btn.setAttribute('aria-pressed', 'false');
        filterButtons.appendChild(btn);
    });

    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-pressed', 'true');
            currentFilter = e.target.dataset.category;
            renderTasks();
        });
    });
}

async function openCategoryModal() {
    lastFocusedElement = document.activeElement;
    await renderCategoriesInModal();
    categoryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    trapFocus(categoryModal.querySelector('.modal-content'));
}

function closeCategoryModal() {
    if (focusTrapCleanup) focusTrapCleanup();
    mainContainer.inert = false; // Always ensure inert is removed
    categoryModal.classList.remove('active');
    categoryForm.reset();
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
}

async function renderCategoriesInModal() {
    await loadCategories();

    if (categories.length === 0) {
        categoryList.innerHTML = '<li style="text-align: center; color: #999; list-style: none;">No categories yet</li>';
        return;
    }

    categoryList.innerHTML = categories.map(category => `
        <li class="category-item">
            <div class="category-item-info">
                <div class="category-color-preview" style="background-color: ${category.color}"></div>
                <span class="category-item-name">${category.name}</span>
            </div>
            <div class="category-item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteCategory(${category.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

async function handleCategorySubmit(e) {
    e.preventDefault();

    const name = document.getElementById('categoryName').value.toLowerCase().trim();
    const color = document.getElementById('categoryColor').value;

    // Check if category already exists
    const existingCategory = categories.find(cat => cat.name === name);
    if (existingCategory) {
        announce('A category with this name already exists', 'assertive');
        return;
    }

    await taskDB.addCategory({ name, color });
    await loadCategories();
    renderFilterButtons();
    await renderCategoriesInModal();
    await updateCategoryDropdowns();
    categoryForm.reset();
    announce(`Category "${name}" added successfully`);
}

async function deleteCategory(id) {
    const category = categories.find(cat => cat.id === id);

    if (!category) return;

    // Check if any tasks use this category
    const tasks = await taskDB.getAllTasks();
    const tasksUsingCategory = tasks.filter(task => task.category === category.name);

    if (tasksUsingCategory.length > 0) {
        announce(`Cannot delete "${category.name}" because ${tasksUsingCategory.length} task(s) are using it. Please reassign or delete those tasks first.`, 'assertive');
        return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
        await taskDB.deleteCategory(id);
        await loadCategories();
        renderFilterButtons();
        await renderCategoriesInModal();
        await updateCategoryDropdowns();
        announce(`Category "${category.name}" deleted`);
    }
}

async function updateCategoryDropdowns() {
    // Update task form category dropdown
    const taskCategory = document.getElementById('taskCategory');
    taskCategory.innerHTML = categories.map(cat =>
        `<option value="${cat.name}">${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>`
    ).join('');

    // Update bulk import category dropdown
    const bulkCategory = document.getElementById('bulkCategory');
    bulkCategory.innerHTML = categories.map(cat =>
        `<option value="${cat.name}">${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>`
    ).join('');
}

function getCategoryColor(categoryName) {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#999999';
}

// Parse bulk text into tasks
function parseBulkTasks(text, category) {
    const tasks = [];

    // Split by double newlines to separate tasks
    const taskBlocks = text.split(/\n\s*\n/).filter(block => block.trim());

    for (const block of taskBlocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);

        if (lines.length === 0) continue;

        // First line is the title
        const title = lines[0];

        // Find STAR sections
        let situation = '';
        let task = '';
        let action = '';
        let result = '';

        let currentSection = null;
        let currentContent = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('**Situation:**')) {
                if (currentSection) {
                    assignSection(currentSection, currentContent.join(' ').trim());
                }
                currentSection = 'situation';
                currentContent = [line.replace('**Situation:**', '').trim()];
            } else if (line.startsWith('**Task:**')) {
                if (currentSection) {
                    assignSection(currentSection, currentContent.join(' ').trim());
                }
                currentSection = 'task';
                currentContent = [line.replace('**Task:**', '').trim()];
            } else if (line.startsWith('**Action:**')) {
                if (currentSection) {
                    assignSection(currentSection, currentContent.join(' ').trim());
                }
                currentSection = 'action';
                currentContent = [line.replace('**Action:**', '').trim()];
            } else if (line.startsWith('**Result:**')) {
                if (currentSection) {
                    assignSection(currentSection, currentContent.join(' ').trim());
                }
                currentSection = 'result';
                currentContent = [line.replace('**Result:**', '').trim()];
            } else if (currentSection) {
                currentContent.push(line);
            }
        }

        // Assign the last section
        if (currentSection) {
            assignSection(currentSection, currentContent.join(' ').trim());
        }

        function assignSection(section, content) {
            if (section === 'situation') situation = content;
            else if (section === 'task') task = content;
            else if (section === 'action') action = content;
            else if (section === 'result') result = content;
        }

        // Only add task if all STAR sections are present
        if (title && situation && task && action && result) {
            tasks.push({
                title: title,
                category: category,
                star: {
                    situation: situation,
                    task: task,
                    action: action,
                    result: result
                }
            });
        }
    }

    return tasks;
}

// Handle bulk form submission
async function handleBulkSubmit(e) {
    e.preventDefault();

    const bulkText = document.getElementById('bulkText').value;
    const category = document.getElementById('bulkCategory').value;

    const tasks = parseBulkTasks(bulkText, category);

    if (tasks.length === 0) {
        announce('No valid tasks found. Please check your format.', 'assertive');
        return;
    }

    // Add all tasks to the database
    for (const task of tasks) {
        await taskDB.addTask(task);
    }

    closeBulkModal();
    await renderTasks();

    announce(`Successfully imported ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`);
}

// Handle task form submission
async function handleTaskSubmit(e) {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('taskTitle').value,
        category: document.getElementById('taskCategory').value,
        star: {
            situation: document.getElementById('situation').value,
            task: document.getElementById('task').value,
            action: document.getElementById('action').value,
            result: document.getElementById('result').value
        }
    };

    if (currentEditingTaskId) {
        await taskDB.updateTask(currentEditingTaskId, taskData);
        announce(`Task "${taskData.title}" updated`);
    } else {
        await taskDB.addTask(taskData);
        announce(`Task "${taskData.title}" added`);
    }

    closeModal();
    await renderTasks();
}

// Render tasks
async function renderTasks() {
    let tasks = await taskDB.getTasksByCategory(currentFilter);

    // Filter by search query
    if (searchQuery) {
        tasks = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(searchQuery);
            const situationMatch = task.star.situation.toLowerCase().includes(searchQuery);
            const taskMatch = task.star.task.toLowerCase().includes(searchQuery);
            const actionMatch = task.star.action.toLowerCase().includes(searchQuery);
            const resultMatch = task.star.result.toLowerCase().includes(searchQuery);

            return titleMatch || situationMatch || taskMatch || actionMatch || resultMatch;
        });
    }

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>${searchQuery ? 'Try a different search term' : 'Click "Add New Task" to create your first task'}</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = tasks.map(task => createTaskHTML(task)).join('');

    // Attach event listeners to task items
    document.querySelectorAll('.task-header').forEach(header => {
        header.addEventListener('click', toggleTaskExpansion);
        header.addEventListener('keydown', toggleTaskExpansion);
    });

    document.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', handleEditTask);
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteTask);
    });

    document.querySelectorAll('.edit-field-btn').forEach(btn => {
        btn.addEventListener('click', handleEditField);
    });

    document.querySelectorAll('.save-field-btn').forEach(btn => {
        btn.addEventListener('click', handleSaveField);
    });

    document.querySelectorAll('.cancel-field-btn').forEach(btn => {
        btn.addEventListener('click', handleCancelField);
    });
}

// Create task HTML
function createTaskHTML(task) {
    const categoryColor = getCategoryColor(task.category);
    return `
        <li class="task-item" data-task-id="${task.id}">
            <div class="task-header" role="button" aria-expanded="false" tabindex="0">
                <div class="task-header-left">
                    <span class="expand-icon" aria-hidden="true">▶</span>
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <span class="task-category" style="background-color: ${categoryColor}">${task.category}</span>
                </div>
            </div>
            <div class="task-content">
                ${createStarFieldHTML('situation', 'Situation', task.star.situation, task.id)}
                ${createStarFieldHTML('task', 'Task', task.star.task, task.id)}
                ${createStarFieldHTML('action', 'Action', task.star.action, task.id)}
                ${createStarFieldHTML('result', 'Result', task.star.result, task.id)}
                <div class="task-actions">
                    <button class="btn btn-primary edit-task-btn" data-task-id="${task.id}">Edit Full Task</button>
                    <button class="btn btn-danger delete-task-btn" data-task-id="${task.id}">Delete Task</button>
                </div>
            </div>
        </li>
    `;
}

// Create STAR field HTML
function createStarFieldHTML(fieldName, label, value, taskId) {
    const fieldId = `field-${taskId}-${fieldName}`;
    return `
        <div class="star-field" data-field="${fieldName}" data-task-id="${taskId}">
            <div class="star-field-header">
                <label class="star-field-label" for="${fieldId}">${label}</label>
                <button class="btn btn-primary btn-small edit-field-btn">Edit</button>
            </div>
            <div class="star-field-value">${escapeHtml(value)}</div>
            <div class="star-field-edit">
                <textarea
                    id="${fieldId}"
                    name="${fieldName}"
                    class="field-textarea"
                    aria-label="Edit ${label.toLowerCase()} for task"
                >${escapeHtml(value)}</textarea>
                <div class="star-field-actions">
                    <button class="btn btn-primary btn-small save-field-btn">Save</button>
                    <button class="btn btn-secondary btn-small cancel-field-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

// Toggle task expansion
function toggleTaskExpansion(e) {
    // Support keyboard activation
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') {
        return;
    }
    if (e.type === 'keydown') {
        e.preventDefault();
    }

    const taskHeader = e.currentTarget;
    const taskItem = taskHeader.closest('.task-item');
    const isExpanded = taskItem.classList.toggle('expanded');
    taskHeader.setAttribute('aria-expanded', isExpanded);
}

// Handle edit full task
async function handleEditTask(e) {
    e.stopPropagation();
    const taskId = parseInt(e.target.dataset.taskId);
    const task = await taskDB.getTask(taskId);
    await openModal(task);
}

// Handle delete task
async function handleDeleteTask(e) {
    e.stopPropagation();
    const taskId = parseInt(e.target.dataset.taskId);
    const task = await taskDB.getTask(taskId);

    if (confirm('Are you sure you want to delete this task?')) {
        await taskDB.deleteTask(taskId);
        await renderTasks();
        announce(`Task "${task.title}" deleted`);
    }
}

// Handle edit field
function handleEditField(e) {
    e.stopPropagation();
    const starField = e.target.closest('.star-field');
    starField.classList.add('editing');
}

// Handle save field
async function handleSaveField(e) {
    e.stopPropagation();
    const starField = e.target.closest('.star-field');
    const taskId = parseInt(starField.dataset.taskId);
    const fieldName = starField.dataset.field;
    const newValue = starField.querySelector('.field-textarea').value;

    const task = await taskDB.getTask(taskId);
    task.star[fieldName] = newValue;
    await taskDB.updateTask(taskId, task);

    starField.classList.remove('editing');
    starField.querySelector('.star-field-value').textContent = newValue;
}

// Handle cancel field edit
function handleCancelField(e) {
    e.stopPropagation();
    const starField = e.target.closest('.star-field');
    const originalValue = starField.querySelector('.star-field-value').textContent;
    starField.querySelector('.field-textarea').value = originalValue;
    starField.classList.remove('editing');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
