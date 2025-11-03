# MyHealthMate - Todo & Notes Feature Manual Test Guide

## Deployment Information
- **Production URL**: https://44207sbaiwdz.space.minimax.io
- **Previous URL**: https://d15cnvf1nlzs.space.minimax.io
- **Features Added**: Todo & Notes Management System
- **Date**: November 3, 2025

## Backend Verification (Completed)
- [x] Database tables created (todos, notes)
- [x] RLS policies configured (8 policies total)
- [x] Table schemas verified correct
- [x] Application built successfully
- [x] Application deployed successfully
- [x] Site accessibility confirmed (HTTP 200)

## Frontend Features Implemented

### Todo Management System
**Location**: `/todos` page

**Features**:
1. **Add Todo**
   - Form fields: Title, Description, Category, Priority, Due Date
   - Categories: Exercise, Diet, Sleep, Water, General, Custom
   - Priorities: High (red), Medium (yellow), Low (green)
   - Modal form with validation

2. **Todo List Display**
   - Completion checkbox
   - Priority and category badges
   - Due date with overdue warnings (red)
   - Edit and delete buttons
   - Completed todos show with green background and strikethrough

3. **Statistics Dashboard**
   - Total Tasks counter
   - Completed counter (green)
   - Pending counter (blue)
   - Overdue counter (red)

4. **Filtering & Sorting**
   - Filter by category (All, Exercise, Diet, Sleep, Water, General, Custom)
   - Filter by status (All, Completed, Pending)

5. **Edit & Delete**
   - Click edit icon to modify todo
   - Click delete icon with confirmation dialog

### Notes Management System
**Location**: `/notes` page

**Features**:
1. **Create Note**
   - Form fields: Title, Content, Category
   - Categories: Daily Reflections, Health Insights, Progress Notes, General
   - Large text area for content entry
   - Modal form with validation

2. **Notes Grid Display**
   - Card-based grid layout (3 columns on desktop)
   - Title, content preview (4 lines max)
   - Category badge and creation date
   - Edit and delete buttons

3. **Search & Filter**
   - Search box (searches titles and content)
   - Category filter dropdown
   - Real-time filtering

4. **Statistics**
   - Total notes counter
   - Per-category counters

### Dashboard Integration
**Location**: `/dashboard` page

**New Widgets Added**:
1. **Pending Tasks Widget**
   - Shows up to 5 pending todos
   - Displays priority badges
   - Shows due dates
   - "View All" link to todos page
   - Shows "No pending tasks" when empty

2. **Recent Notes Widget**
   - Shows 3 most recent notes
   - Displays title, content preview, date
   - "View All" link to notes page
   - Shows "No notes yet" when empty

### Navigation
**Updated**: Added two new menu items
- Todos (CheckSquare icon)
- Notes (FileText icon)
- Position: Between "Mood" and "Achievements"

## Manual Testing Checklist

### Initial Setup
- [ ] Open https://44207sbaiwdz.space.minimax.io
- [ ] Login or create test account
- [ ] Verify you land on Dashboard

### Test 1: Navigation
- [ ] Verify "Todos" appears in sidebar navigation
- [ ] Verify "Notes" appears in sidebar navigation
- [ ] Click "Todos" - should navigate to /todos
- [ ] Click "Notes" - should navigate to /notes
- [ ] Click "Dashboard" - should return to /dashboard

### Test 2: Todo CRUD Operations
1. **Create Todos**
   - [ ] Click "Add Todo" button
   - [ ] Fill: Title="Exercise 30min daily", Category="Exercise", Priority="High", Due Date=(tomorrow's date)
   - [ ] Click "Add Todo"
   - [ ] Verify todo appears in list with correct details
   - [ ] Verify statistics show: Total=1, Pending=1, Completed=0
   
   - [ ] Add second: Title="Drink 2L water", Category="Water", Priority="Medium", Description="Stay hydrated"
   - [ ] Verify both todos appear
   - [ ] Verify statistics show: Total=2, Pending=2

2. **Complete Todo**
   - [ ] Click checkbox on "Drink 2L water" todo
   - [ ] Verify todo shows green background and strikethrough
   - [ ] Verify statistics show: Total=2, Pending=1, Completed=1

3. **Edit Todo**
   - [ ] Click edit icon on "Exercise 30min daily"
   - [ ] Change priority to "Low"
   - [ ] Click "Update Todo"
   - [ ] Verify priority changed (green badge instead of red)

4. **Delete Todo**
   - [ ] Click delete icon on any todo
   - [ ] Confirm deletion in dialog
   - [ ] Verify todo removed from list
   - [ ] Verify statistics updated

### Test 3: Todo Filtering
- [ ] Use category filter - select "Exercise"
- [ ] Verify only Exercise todos show
- [ ] Reset to "All"
- [ ] Use status filter - select "Completed"
- [ ] Verify only completed todos show
- [ ] Reset to "All"

### Test 4: Notes CRUD Operations
1. **Create Notes**
   - [ ] Navigate to Notes page
   - [ ] Click "New Note" button
   - [ ] Fill: Title="Morning Workout", Category="Daily Reflections", Content="Felt great after 30min run. Energy high!"
   - [ ] Click "Save Note"
   - [ ] Verify note appears in grid
   
   - [ ] Add second: Title="Diet Progress", Category="Health Insights", Content="Tracking macros helping me stay on target."
   - [ ] Verify both notes appear in grid

2. **Edit Note**
   - [ ] Click edit icon on "Morning Workout" note
   - [ ] Add to content: " Planning to increase to 45min next week."
   - [ ] Click "Update Note"
   - [ ] Verify updated content shows in note preview

3. **Delete Note**
   - [ ] Click delete icon on any note
   - [ ] Confirm deletion
   - [ ] Verify note removed from grid

### Test 5: Notes Search & Filter
- [ ] Type "diet" in search box
- [ ] Verify only "Diet Progress" note shows
- [ ] Clear search
- [ ] Use category filter - select "Daily Reflections"
- [ ] Verify only that category's notes show
- [ ] Reset to "All"

### Test 6: Dashboard Widgets
- [ ] Navigate to Dashboard
- [ ] Verify "Pending Tasks" widget shows your pending todos
- [ ] Verify priority badges are visible
- [ ] Verify due dates are shown (if applicable)
- [ ] Click "View All" in Todos widget - should go to /todos
- [ ] Navigate back to Dashboard
- [ ] Verify "Recent Notes" widget shows your notes
- [ ] Verify note titles and preview content visible
- [ ] Click "View All" in Notes widget - should go to /notes

### Test 7: Mobile Responsiveness
- [ ] Resize browser to mobile width (375px) or use mobile device
- [ ] Verify hamburger menu appears in header
- [ ] Click hamburger - menu should slide in from left
- [ ] Navigate to Todos page - verify layout is mobile-friendly
- [ ] Try adding a todo from mobile view
- [ ] Navigate to Notes page - verify cards stack vertically
- [ ] Try adding a note from mobile view
- [ ] Verify all interactions work on mobile

### Test 8: Data Persistence
- [ ] Create a todo and a note
- [ ] Refresh the page (F5)
- [ ] Verify todo and note still appear
- [ ] Navigate away and back to Todos/Notes
- [ ] Verify data persists

### Test 9: Edge Cases
- [ ] Try to add todo with empty title - should be blocked
- [ ] Try to add note with empty title or content - should be blocked
- [ ] Add todo with past due date - should show overdue warning (red)
- [ ] Complete and uncomplete a todo multiple times - should toggle correctly

### Test 10: Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Navigate through Todos and Notes pages
- [ ] Verify no JavaScript errors appear
- [ ] Check Network tab for failed requests

## Expected Behavior Summary

### Todos Page
- Clean, organized list view
- Color-coded priority badges (High=red, Medium=yellow, Low=green)
- Overdue todos have red due date badge with alert icon
- Completed todos have green background with strikethrough text
- Statistics update in real-time
- Smooth animations when adding/removing todos

### Notes Page
- Grid layout with cards (3 columns on desktop, 1 on mobile)
- Content preview limited to 4 lines with ellipsis
- Category badges color-coded
- Search is case-insensitive
- Smooth animations when adding/removing notes

### Dashboard Widgets
- Widgets show "No pending tasks" / "No notes yet" when empty
- Max 5 todos shown in widget
- Max 3 notes shown in widget
- Priority badges match the full todo page styling
- "View All" links work correctly

## Known Limitations
- None currently identified

## Support Information
If you encounter any issues:
1. Check browser console for errors
2. Verify you're logged in
3. Try refreshing the page
4. Check that todos/notes belong to your user account
