# STAR Task Manager

A simple, elegant web application for managing professional accomplishments using the STAR (Situation, Task, Action, Result) method. Perfect for job interview preparation and tracking career achievements.

## Features

### Core Functionality
- **STAR Method Structure**: Organize accomplishments with Situation, Task, Action, and Result fields
- **Category Management**: Create custom categories with colors to organize your tasks
- **Search & Filter**: Quickly find tasks by searching across all content or filtering by category
- **Individual Field Editing**: Edit each STAR field independently without re-entering everything
- **Bulk Operations**: Import and export multiple tasks at once

### User Experience
- **Dark Mode (Default)**: Beautiful dark theme by default with optional light mode toggle
- **Theme Persistence**: Your theme preference is saved in localStorage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Polished transitions and hover effects throughout

### Accessibility
- **WCAG 2.1 Compliant**: Fully accessible to all users
- **Keyboard Navigation**: Complete keyboard support with Tab, Arrow keys, Enter, Space, ESC, Home, and End
- **Screen Reader Friendly**: Proper ARIA labels, live regions, and semantic HTML
- **Focus Management**: Clear visual focus indicators and intelligent focus trapping in modals
- **Skip Links**: Quick navigation for keyboard users

### Data Management
- **Local Storage**: All data stored locally in your browser using IndexedDB - no server required
- **Import/Export**: Easily backup or transfer your tasks in text format
- **No Account Required**: Everything runs in your browser, completely private

## Technology Stack

- **HTML5**: Semantic markup with proper ARIA attributes
- **CSS3**: Modern styling with CSS variables, flexbox, and smooth transitions
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **IndexedDB**: Client-side storage via the [idb](https://github.com/jakearchibald/idb) library
- **LocalStorage**: Theme preference persistence

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start adding your tasks!

**No build process, no dependencies to install, no internet connection required.** All libraries are included locally. Just open and use.

### Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- IndexedDB
- CSS Variables and Flexbox
- HTML `inert` attribute (for modal accessibility)

Recommended browsers: Chrome, Firefox, Safari, Edge (latest versions)

**Note**: The `inert` attribute is supported in all modern browsers (Chrome 102+, Firefox 112+, Safari 15.5+, Edge 102+)

## Usage

### Theme Toggle

The app defaults to **dark mode** for comfortable viewing. Toggle between dark and light modes:
- Click the **moon/sun icon** in the header
- Your preference is automatically saved

### Adding a Task

1. Click **"+ Add New Task"** in the header
2. Fill in the title and select a category
3. Complete the STAR fields:
   - **Situation**: Describe the context or challenge
   - **Task**: Explain what needed to be done
   - **Action**: Detail the steps you took
   - **Result**: Highlight the outcomes and impact
4. Click **"Save Task"**

### Managing Categories

1. Click **"Settings"** dropdown in the header
2. Select **"Manage Categories"**
3. Add new categories with custom colors
4. Delete unused categories (if no tasks are using them)

### Bulk Import

1. Click **"Settings"** > **"Bulk Import"**
2. Select the category for all imported tasks
3. Paste tasks in the format:
   ```
   Task Title
   **Situation:**
   Your situation text here...
   **Task:**
   Your task text here...
   **Action:**
   Your action text here...
   **Result:**
   Your result text here...

   Next Task Title
   **Situation:**
   ...
   ```
4. Click **"Import Tasks"**

### Export All Tasks

1. Click **"Settings"** > **"Export All"**
2. Copy the formatted text
3. Save to a file or paste elsewhere

The exported format matches the import format, so you can easily backup and restore your tasks.

## Project Structure

```
star/
├── index.html          # Main HTML structure with semantic markup
├── styles.css          # All styling with CSS variables for theming
├── app.js             # Application logic and UI handling
├── db.js              # IndexedDB wrapper and data management
├── idb.js             # IndexedDB library (local copy for offline use)
├── favicon.svg        # App icon
├── robots.txt         # Search engine directives
├── ai.txt             # AI assistant information
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Features in Detail

### Smart Filtering
- Filter by category using buttons
- Real-time search across all task fields
- Combine filters and search for precise results

### Individual Field Editing
- Click **"Edit"** on any STAR field to modify just that section
- Click **"Save"** to update or **"Cancel"** to discard changes
- No need to re-enter unchanged information

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and expand tasks
- **ESC**: Close modals and dropdowns
- **Arrow Keys**: Navigate settings menu (Up/Down)
- **Home/End**: Jump to first/last menu item
- Full keyboard support - no mouse required!

### Data Persistence
- All data stored in IndexedDB
- Persists across browser sessions
- No data sent to any server
- Clear browser data to reset

## Privacy

This application is 100% client-side. Your data:
- Never leaves your browser
- Is not transmitted to any server
- Cannot be accessed by the developer
- Is only stored in your browser's IndexedDB

## Contributing

This is a simple, educational project. Feel free to:
- Fork and modify for your needs
- Submit bug reports or feature suggestions
- Use as a learning resource for vanilla JavaScript and IndexedDB

## License

Open source - use freely for personal or educational purposes.

## Tips for Interview Prep

1. **Be Specific**: Include numbers and concrete results when possible
2. **Be Concise**: Aim for 2-3 sentences per STAR field
3. **Focus on Impact**: Emphasize measurable outcomes in the Result field
4. **Organize by Category**: Group similar accomplishments (software, support, leadership, etc.)
5. **Practice Regularly**: Review your tasks before interviews to refresh your memory

## Credits

Built with vanilla JavaScript and love for simplicity.
IndexedDB wrapper: [idb](https://github.com/jakearchibald/idb) by Jake Archibald
