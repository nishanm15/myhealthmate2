# Nepal Food Database - SQL Setup Instructions

## ⚡ Quick Fix: Complete Database Setup

If you got a "policy already exists" error, use this **one-step** solution:

### 1. Run Complete Setup Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dkkikobakypwldmnjxir
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the **COMPLETE** SQL from `NEPAL_FOOD_DB_COMPLETE_SETUP.sql`
4. Click **Run** to execute

This script handles:
- ✅ Creates tables (if not exists)
- ✅ Removes existing policies (if any)
- ✅ Creates all needed policies (read, write, update, delete)
- ✅ Adds performance indexes

### 2. Then Initialize Database

After running the SQL:
- Visit: https://sdltemtrtwnt.space.minimax.io/setup-database.html
- Click "Initialize Nepal Food Database"
- Should work without errors!

---

## 🔄 Old Method (Only if Complete Setup Script doesn't work)

If you want to create the setup manually instead:

**Step 1:** Create tables and basic policies
**Step 2:** Add data access policies (if Step 1 completed successfully)

*Refer to version history for old two-step method if needed.*

### What Happens Next:

After creating the tables, visit the deployed app:
**URL:** https://wjlueryzzjcl.space.minimax.io

When you navigate to the **Diet Tracker** page and click **"Add Meal"**, the app will automatically:
1. Detect the empty tables
2. Seed them with 25 Nepal foods (rice, dal, momo, chapati, etc.)
3. Insert 35 portion mappings (1 cup, 1 bowl, 1 plate, etc.)
4. Add 12 exercise MET values for calorie calculations

### Features Available After Setup:

- **Food Search**: Type "rice", "dal", "momo", etc. and get instant autocomplete
- **Portion Selection**: Choose from standard portions like "1 cup", "1 bowl", "1 plate"
- **Custom Amounts**: Enter custom grams for precise tracking
- **Automatic Calculation**: Nutrition values calculated instantly based on portion size
- **Manual Entry Fallback**: Still available if food not found in database

### Troubleshooting:

If food search doesn't work:
1. Check browser console for errors
2. Verify tables were created successfully in Supabase
3. The app will show a yellow warning if database initialization fails
4. Manual entry will always be available as a fallback
