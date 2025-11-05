# Nepal Food Database - User Interface Guide

## Visual Walkthrough

### 1. Add Meal Button
Location: Diet Tracker page, top right
```
┌─────────────────────────────────────────┐
│ Diet Tracker              [+ Add Meal]  │
│ Track your meals and nutrition          │
└─────────────────────────────────────────┘
```

### 2. Food Search Interface (NEW)
When you click "Add Meal", you'll see:

```
┌─────────────────────────────────────────────────────────┐
│ Add New Meal                                            │
│                                                         │
│ Search Nepal Food                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │  [Search Icon]  Type food name (e.g., rice)  [X]│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Or enter nutrition manually                            │
└─────────────────────────────────────────────────────────┘
```

### 3. Autocomplete Suggestions
As you type "rice":

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐   │
│ │  [Search Icon]  rice                         [X]│   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Rice (cooked)                                      ││
│ │ 130 cal/100g • P: 2.7g • C: 28g • F: 0.3g        ││
│ │────────────────────────────────────────────────────││
│ │ [Other matching foods if any...]                  ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 4. Portion Selection Interface
After selecting a food:

```
┌─────────────────────────────────────────────────────────┐
│ Select Portion Size                                     │
│                                                         │
│ ┌──────────────────────┐  ┌──────────────────────┐   │
│ │ 1 cup                │  │ 1 bowl               │   │
│ │ 210g • 273 cal       │  │ 300g • 390 cal       │   │
│ └──────────────────────┘  └──────────────────────┘   │
│                                                         │
│ ┌──────────────────────┐                              │
│ │ 1 plate              │                              │
│ │ 200g • 260 cal       │                              │
│ └──────────────────────┘                              │
│                                                         │
│ Custom Amount (grams)                                   │
│ ┌─────────────────────────────┐  ┌──────┐            │
│ │ Enter grams                 │  │ Add  │            │
│ └─────────────────────────────┘  └──────┘            │
│ Nutrition: [Shows calculated values in real-time]      │
│                                                         │
│ [Cancel]                                                │
└─────────────────────────────────────────────────────────┘
```

### 5. After Selection
Nutrition values automatically populate:

```
┌─────────────────────────────────────────────────────────┐
│ Manual entry mode. You can also search above.          │
│                                                         │
│ Date              Food Name                             │
│ [2025-11-04]      [Rice (cooked)        ]              │
│                                                         │
│ Calories          Protein (g)                           │
│ [273    ]         [5.7       ]                          │
│                                                         │
│ Carbs (g)         Fat (g)                               │
│ [58.8   ]         [0.6       ]                          │
│                                                         │
│ [Add Meal]  [Cancel]                                    │
└─────────────────────────────────────────────────────────┘
```

### 6. Manual Entry Fallback
If food not found or you prefer manual entry:

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐   │
│ │  [Search Icon]  xyz food                     [X]│   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────┐│
│ │ No Nepal foods found.                              ││
│ │                                                     ││
│ │ [Enter nutrition manually instead]                 ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Or enter nutrition manually                            │
└─────────────────────────────────────────────────────────┘
```

## Nepal Foods Available

### Staple Foods:
- Rice (cooked) - 1 cup, 1 bowl, 1 plate
- Dal (cooked) - 1 bowl, 1 cup
- Chapati - 1 piece
- Roti - 1 piece
- Dhedo - 1 serving, 1 bowl
- Bajra - 1 serving, 1 cup

### Main Dishes:
- Momo (steamed) - 1 plate (6 pieces), 1 piece
- Chicken curry - 1 serving, 1 bowl
- Aloo curry - 1 serving, 1 bowl
- Saag (spinach) - 1 serving, 1 bowl
- Buffalo meat - 1 serving, 1 piece

### Snacks:
- Sel roti - 1 piece
- Samosa - 1 piece
- Puri - 1 piece
- Jalebi - 1 piece

### Other:
- Yogurt (dahi) - 1 cup
- Paneer - 1 serving
- Egg (boiled) - 1 egg
- Milk (full fat) - 1 glass
- Banana - 1 medium
- Apple - 1 medium
- Kheer - 1 bowl
- Gundruk - 1 serving
- Papad - 1 piece
- Achar (pickle) - 1 tablespoon

## Mobile Optimization

### Touch-Friendly Features:
- Minimum 44px touch targets for all buttons
- Large, easy-to-tap portion buttons
- Full-width dropdowns for easy selection
- Swipe-friendly interfaces
- Optimized for 320px to 414px screens

### Mobile Layout:
```
┌─────────────────┐
│  Search Nepal   │
│  Food           │
│ ┌─────────────┐ │
│ │  rice    [X]│ │
│ └─────────────┘ │
│                 │
│ Suggestions:    │
│ ┌─────────────┐ │
│ │Rice (cooked)│ │
│ │130 cal/100g │ │
│ └─────────────┘ │
│                 │
│ Portions:       │
│ ┌─────────────┐ │
│ │   1 cup     │ │
│ │ 210g•273cal │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   1 bowl    │ │
│ │ 300g•390cal │ │
│ └─────────────┘ │
└─────────────────┘
```

## Expected Behavior

### On First Load (after table creation):
1. Page loads normally
2. Database auto-initializes in background
3. ~2 seconds delay for data seeding
4. Food search becomes available
5. User can start searching immediately

### Subsequent Loads:
1. Page loads instantly
2. Food search immediately available
3. No initialization delay
4. Smooth, fast autocomplete

### Error States:
- Tables not created: Yellow warning appears
- Food not found: Manual entry option shown
- Network error: Graceful fallback to manual entry
- Database empty: Auto-seeds on next meal add

## Performance Expectations

### Search Speed:
- Autocomplete: Instant (< 50ms)
- Portion load: < 100ms
- Calculation: Instant (client-side)
- Form submission: < 500ms (network dependent)

### Data Volume:
- 25 pre-loaded foods
- 35 portion mappings
- Minimal bandwidth usage
- Cached after first load

## Tips for Best Experience

1. **Type at least 2-3 characters** for best autocomplete results
2. **Use common names**: "rice" not "cooked rice"
3. **Choose portion first** before custom grams
4. **Check calculated values** before submitting
5. **Use manual entry** for custom/unlisted foods
6. **Mobile users**: Use landscape for better view

## Troubleshooting

### Food search not appearing?
- Check for yellow warning about database
- Verify tables created in Supabase
- Check browser console for errors

### No autocomplete results?
- Try different food names
- Check spelling
- Use manual entry as fallback

### Calculations seem wrong?
- Verify portion selected correctly
- Check custom grams input
- Reference values are per 100g base

### Mobile issues?
- Ensure touch targets are tappable
- Check viewport width (min 320px)
- Test in portrait and landscape

---

**Ready to Use**: Once database tables are created, the Nepal Food Database will provide an intuitive, fast, and accurate way to track nutrition with familiar Nepal foods and portion sizes.
