# Quick Test Guide - Daily Todo System

## How to Test the Daily Todo System

### Access the Application
**URL**: https://l24klzxwdrsg.space.minimax.io

### Step-by-Step Testing

#### 1. Login/Signup
- If you have an existing account, login
- Otherwise, create a new account with any email/password

#### 2. Navigate to Daily Tasks
- Click on "Todo & Tasks" in the sidebar (left navigation)
- Or go directly to: https://l24klzxwdrsg.space.minimax.io/todos

#### 3. Verify the Interface
You should see:
- "Daily Tasks" heading at the top
- Today's date displayed (e.g., "Tuesday, November 5, 2025")
- A blue progress card showing "0/0" or current progress
- An input field with "Add a new task for today..." placeholder
- A note at the bottom about daily reset

#### 4. Add Tasks
- Type "Buy groceries" in the input field
- Click "Add" button or press Enter
- Task should appear in the list below
- Progress card should update to "0/1"

- Add another task: "Exercise for 30 minutes"
- Progress should update to "0/2"

#### 5. Complete Tasks
- Click the checkbox (square) next to "Buy groceries"
- Task should get a green background with a checkmark
- Progress card should update to "1/2" (50% Complete)
- Progress bar should fill to 50%

#### 6. Delete Tasks
- Click the trash icon next to "Exercise for 30 minutes"
- Task should be removed immediately
- Progress should update to "1/1" (100% Complete)
- You should see "Great job! All tasks completed!" message

#### 7. Test Empty State
- Delete all remaining tasks
- You should see:
  - A checkmark icon
  - "No tasks for today" message
  - "Add your first task to get started!"

#### 8. Verify Daily Reset Behavior
**Note**: You can't test this immediately, but here's what happens:
- Come back tomorrow (or change your system date to test)
- All of today's tasks will be gone
- You'll start with a clean slate

### Expected Behavior

#### Progress Indicator
- Shows fraction: "Completed / Total" (e.g., 2/5)
- Shows percentage: "40% Complete"
- Updates in real-time as you complete/delete tasks
- Animated progress bar fills based on percentage

#### Task States
- **Uncompleted**: White background, empty checkbox
- **Completed**: Green background, filled checkbox, strikethrough text
- **Hover Effects**: Borders change color on hover

#### Daily Reset
- Tasks only exist for current day
- Old tasks (from yesterday or earlier) are automatically deleted
- Each day starts with zero tasks
- No carryover of uncompleted tasks

### Troubleshooting

**Issue**: Can't see the Todos page
- **Solution**: Make sure you're logged in first

**Issue**: Tasks not appearing after adding
- **Solution**: Check browser console for errors, refresh the page

**Issue**: Progress not updating
- **Solution**: Refresh the page, check network connection

**Issue**: Old tasks still showing
- **Solution**: Refresh the page to trigger cleanup

### Quick Verification Checklist

- [ ] Page loads and shows today's date
- [ ] Can add a new task
- [ ] Task appears in the list
- [ ] Progress counter updates (0/0 → 0/1)
- [ ] Can complete a task (checkbox works)
- [ ] Task turns green when completed
- [ ] Progress updates (0/1 → 1/1)
- [ ] Progress bar fills to 100%
- [ ] Can delete a task
- [ ] Progress updates after deletion
- [ ] Empty state shows when no tasks
- [ ] Info message about daily reset appears

All checkboxes should be ticked for a successful test!
