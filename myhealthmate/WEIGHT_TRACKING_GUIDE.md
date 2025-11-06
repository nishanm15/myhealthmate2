# Weight Tracking Feature - User Guide

## Overview
The Weight Tracking feature provides a comprehensive system for monitoring your weight progress and achieving your goals.

## Deployment
**Production URL**: https://zokq13ra5oi4.space.minimax.io

## How to Access
1. Login to MyHealthMate
2. Click on "Weight" in the sidebar navigation (Scale icon)
3. Or navigate directly to: https://zokq13ra5oi4.space.minimax.io/weight

## Features

### 1. Weight Entry Logging
**How to log your weight:**
1. Click the "Log Weight" button (top right)
2. Enter your weight in kilograms
3. Select the date (defaults to today)
4. Add optional notes (e.g., "After breakfast", "Morning weigh-in")
5. Click "Save Entry"

**Features:**
- Weight validation (must be between 0-500 kg)
- Date picker for historical entries
- Notes field for context
- Automatic timestamp

### 2. Dashboard Stats

**Three Key Metrics:**

**Current Weight**
- Displays your most recent weight entry
- Shows change from previous entry (with up/down arrow)
- Color-coded: Red for gain, Green for loss
- Displays date of last entry

**Goal Weight**
- Shows your target weight if a goal is active
- Displays target date
- Click "Set a goal" if no active goal

**Progress**
- Shows percentage towards goal
- Visual progress bar
- Displays remaining weight to goal
- Only appears when goal is active

### 3. Goal Setting

**How to set a weight goal:**
1. Click "Set a goal" button in the Goal Weight card
2. Enter your starting weight (defaults to latest entry)
3. Enter your target weight
4. Select your target date
5. Click "Set Goal"

**Goal Features:**
- Only one active goal at a time
- Setting a new goal deactivates previous goals
- Purple gradient card shows goal details
- Displays: Start → Current → Target → Time Left
- Cancel goal button available

**Goal Progress Tracking:**
- Real-time progress percentage calculation
- Visual progress bar
- Shows remaining weight to goal
- Motivational progress indicators

### 4. Weight Trend Chart

**Interactive Chart Features:**
- Line chart showing weight over time
- Goal reference line (purple dashed line)
- Hover tooltips with exact values
- Responsive design

**Time Range Filters:**
- 1W - Last 7 days
- 1M - Last month
- 3M - Last 3 months (default)
- 6M - Last 6 months
- 1Y - Last year
- All - All time data

**How to use:**
- Click time range buttons to filter data
- Hover over data points for details
- View goal line to track progress
- Chart updates automatically with new entries

### 5. Recent Entries List

**View all your weight entries:**
- Sorted by date (most recent first)
- Shows: Date, Weight, Notes (if any)
- Delete button for each entry
- Hover effects for better UX

**Delete an entry:**
1. Click the trash icon next to any entry
2. Entry is removed immediately
3. Stats and chart update automatically

### 6. Active Goal Card

**When a goal is active, you'll see:**
- Purple gradient card with goal details
- Four columns: Start | Current | Target | Time Left
- "Cancel Goal" button
- Visible countdown of days remaining

**Cancel a goal:**
1. Click "Cancel Goal" in the active goal card
2. Confirm the cancellation
3. Goal is deactivated (not deleted, just inactive)
4. Progress percentage resets
5. Goal line removed from chart

## Usage Examples

### Example 1: Weight Loss Journey
1. Log current weight: 80 kg
2. Set goal: Target 70 kg in 90 days
3. Log weight weekly: 79.5, 79.0, 78.2, etc.
4. Track progress on chart
5. View percentage towards goal
6. Celebrate when you reach 70 kg!

### Example 2: Weight Gain Journey
1. Log current weight: 60 kg
2. Set goal: Target 70 kg in 120 days
3. Log weight weekly: 61.0, 62.5, 63.8, etc.
4. Monitor upward trend on chart
5. Track progress percentage
6. Reach your healthy weight goal!

### Example 3: Weight Maintenance
1. Log current weight: 75 kg
2. Set goal: Maintain 75 kg (target 75 kg)
3. Log weight weekly
4. Use chart to ensure stability
5. View fluctuations over time
6. Stay within healthy range

## Tips for Best Results

**Consistency:**
- Weigh yourself at the same time each week
- Same day of the week recommended
- Preferably morning, after bathroom, before eating

**Accuracy:**
- Use the same scale consistently
- Wear similar clothing (or none)
- Place scale on hard, flat surface
- Wait 3-5 seconds for stable reading

**Realistic Goals:**
- Healthy weight loss: 0.5-1 kg per week
- Healthy weight gain: 0.25-0.5 kg per week
- Set achievable timelines
- Adjust goals as needed

**Notes Field:**
- Track context: "After vacation", "Started new diet"
- Note water retention factors
- Document exercise changes
- Record how you feel

## Technical Details

### Database
- **weight_entries**: Stores all weight logs
- **weight_goals**: Stores goal information
- Both tables have RLS (Row Level Security) enabled
- Only you can see your data

### Data Validation
- Weight must be between 0 and 500 kg
- Date cannot be in the future
- Only one active goal per user
- Automatic timestamp on all entries

### Chart Technology
- Built with Recharts library
- Responsive and interactive
- Smooth animations
- Touch-friendly on mobile

### Mobile Optimization
- Fully responsive design
- Touch-optimized buttons (min 44px)
- Swipeable time range filters
- Collapsible sections on small screens

## Troubleshooting

**Q: Chart not showing?**
A: Need at least 1 weight entry. Add your first entry to see the chart.

**Q: Can't set a goal?**
A: Make sure you have at least one weight entry first.

**Q: Goal progress seems wrong?**
A: Progress is calculated based on distance from start to target. Log your current weight to update.

**Q: How to delete all data?**
A: Delete entries individually using the trash icon. Goals can be cancelled.

**Q: Can I edit an entry?**
A: Currently, you can delete and re-add. Edit functionality coming soon.

**Q: Weight change not showing?**
A: Need at least 2 entries to calculate change from previous.

## Privacy & Security

- All data is private and encrypted
- Only you can access your weight data
- Supabase Row Level Security enforced
- No data sharing with third parties
- Delete your entries anytime

## Integration with MyHealthMate

Weight Tracking seamlessly integrates with:
- **Dashboard**: Quick weight stats (coming soon)
- **Analytics**: Weight trends with other health metrics
- **Monthly Reports**: Weight progress in exports
- **Profile**: BMI calculation using latest weight
- **Goals**: Overall health goal coordination

## Future Enhancements

Potential features in development:
- Edit weight entries
- Weight predictions based on trends
- BMI tracking and visualization
- Body measurements tracking
- Photo progress tracking
- Weight milestones and achievements
- Export weight data to CSV
- Integration with smart scales

## Summary

The Weight Tracking feature provides everything you need to:
- Monitor your weight consistently
- Set and track goals
- Visualize progress over time
- Stay motivated on your journey
- Make informed health decisions

Start your weight tracking journey today!
