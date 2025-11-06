# Manual Testing Guide - Journal System

## Quick Start Testing (15 minutes)

### Prerequisites
- Open browser and navigate to: https://849cvh3uukuj.space.minimax.io
- Login with your test account

### Test Sequence

#### 1. Access Journal (1 min)
```
✓ Click "Journal" in sidebar (between Weight and Mood)
✓ Verify Journal page loads with header "Health Journal"
✓ Check stats cards display: Total Entries, Total Words, Average Mood, Writing Streak
✓ Confirm buttons visible: Calendar, Analytics, New Entry
```

#### 2. Create First Entry (3 min)
```
✓ Click "New Entry" button (purple)
✓ Enter title: "My First Journal Entry"
✓ Write content (at least 50 words): 
   "Today was a productive day. I completed my morning workout, 
   ate a healthy breakfast with oatmeal and fruits, and stayed 
   hydrated throughout the day. I'm feeling energized and motivated 
   to continue my health journey. Looking forward to tracking my 
   progress over time."
✓ Check word count updates (should show ~50 words, ~1 min read)
✓ Select mood: Click "Good" (4th option with 🙂)
✓ Set energy level: Drag slider to 8
✓ Add tag: Type "motivation" → Click "Add"
✓ Add tag: Type "workout" → Click "Add"
✓ Verify both tags appear as purple badges
✓ Click "Save" button
✓ Confirm redirected to list view
```

#### 3. Verify List View (2 min)
```
✓ Check entry appears in list
✓ Verify displays:
   - Title: "My First Journal Entry"
   - Date and time (e.g., "Nov 5, 2025", "2 minutes ago")
   - Mood emoji: 🙂
   - Word count: ~50 words
   - Energy: 8/10 with ⚡
   - Tags: #motivation, #workout
✓ Check action buttons: View, Edit, Delete
```

#### 4. Test Reader View (2 min)
```
✓ Click "View" button on your entry
✓ Verify reader opens with:
   - Large title
   - Full content with good typography
   - Mood card showing: 🙂 Good
   - Energy display: ⚡ 8/10
   - Tags section with #motivation, #workout
   - Entry counter: "1 / 1"
✓ Check reading progress bar (top of page)
✓ Scroll down to see progress bar fill
✓ Test navigation buttons (should be disabled - only 1 entry)
```

#### 5. Test Edit Functionality (2 min)
```
✓ Click "Edit" button (purple) in reader
✓ Editor opens with existing content
✓ Add to content: " I also practiced meditation for 10 minutes."
✓ Change energy level to 9
✓ Add new tag: "meditation"
✓ Click "Save"
✓ Verify returns to list view
✓ Open entry again to confirm changes saved
```

#### 6. Test Search & Filter (2 min)
```
✓ In list view, use search box
✓ Type "workout" → Entry should appear
✓ Type "xyz" → "No entries found" message
✓ Clear search
✓ Click filter icon
✓ Change "Sort By" to "Most Words"
✓ Try filter by mood: Select "Good (4)"
✓ Entry should still appear
✓ Select mood "Great (5)" → Should show no entries
✓ Reset filters to "All Moods"
```

#### 7. Create Second Entry (2 min)
```
✓ Click "New Entry"
✓ Title: "Weekly Progress Update"
✓ Content: "Completed week 1 of my fitness plan. Lost 2 pounds and feeling great!"
✓ Mood: Select "Great" (5th option with 😄)
✓ Energy: Set to 7
✓ Tags: "progress", "fitness"
✓ If you have weight entries: Check "Link to weight entry" → Select latest
✓ Save
✓ Verify both entries now in list
✓ Check entry counter shows "1 / 2" or "2 / 2" in reader
```

#### 8. Test Analytics Dashboard (3 min)
```
✓ Click "Analytics" button (TrendingUp icon) in header
✓ Verify stats cards show updated numbers:
   - Total Entries: 2
   - Total Words: ~70+ 
   - Average Mood: ~4.5
   - Writing Streak: 0 or 1 (depends on creation dates)
✓ Check "Writing Activity" chart displays (last 30 days)
✓ Verify "Mood Distribution" pie chart shows 2 segments
✓ Check "Energy Levels" bar chart has bars for levels 7, 8, 9
✓ Scroll to "Most Used Tags" section
✓ Verify tags appear: motivation, workout, meditation, progress, fitness
✓ Read "Your Insights" section
```

#### 9. Test Delete (1 min)
```
✓ Return to list view (click Calendar icon)
✓ Click "Delete" on one entry
✓ Confirm deletion in dialog
✓ Verify entry removed from list
✓ Stats cards update (Total Entries now 1)
```

#### 10. Mobile Testing (Optional, 2 min)
```
✓ Resize browser to mobile width (< 640px) or use DevTools
✓ Verify sidebar accessible via menu button
✓ Journal appears in navigation
✓ Bottom navigation visible
✓ Create entry works on mobile
✓ Forms are touch-friendly
✓ Charts display correctly
```

## Expected Results

### All Tests Passing ✓
- Journal accessible from sidebar
- Can create entries with all fields
- Word count auto-calculates
- Mood and energy tracking works
- Tags can be added/removed
- Entries display in list with previews
- Reader shows full content beautifully
- Edit updates entries correctly
- Search finds entries by text/tags
- Filters work (mood, sort)
- Analytics shows all charts
- Stats calculate correctly
- Delete removes entries
- Mobile responsive

### Known Limitations
- Auto-save only works on existing entries (not new entries)
- Rich text formatting limited to plain text (no bold/italic yet)
- PDF export opens print dialog (not true PDF yet)
- Weight linking requires manual selection (not automatic)

## Troubleshooting

### If something doesn't work:

1. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Screenshot and report errors

2. **Verify you're logged in**
   - Check top-right for user profile
   - Try logout and login again

3. **Refresh the page**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Try different browser**
   - Chrome, Firefox, Safari, Edge all supported

5. **Check network tab**
   - F12 → Network tab
   - Look for failed requests (red)

## Reporting Issues

If you find bugs, please report:
- What you were doing
- What you expected to happen
- What actually happened
- Browser and device type
- Screenshot if possible
- Console errors if any

## Success Criteria

Journal system is working correctly if:
- ✓ All 10 test sequences complete without errors
- ✓ Data persists after page refresh
- ✓ No console errors during normal usage
- ✓ Mobile layout works properly
- ✓ Charts display with real data
- ✓ Weight integration option available

---

**Estimated Total Testing Time**: 15-20 minutes

**Status**: Ready for user acceptance testing
**Deployed**: https://849cvh3uukuj.space.minimax.io
**Date**: November 5, 2025
