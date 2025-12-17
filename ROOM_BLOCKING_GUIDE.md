# Room Blocking System - Implementation Guide

## Overview

This system allows you to block specific rooms for specific date ranges (e.g., Dec 22-23 for personal bookings) without making the room completely unavailable for all dates.

## What Was Done

### 1. Database Migration

**File:** `supabase-migrations/0005_create_room_blocks.sql`

Created a new `room_blocks` table with:

- `room_id`: Which room to block
- `start_date`: Start date of the block
- `end_date`: End date of the block
- `reason`: Why it's blocked (Personal Booking, Maintenance, Renovation, Other)
- `notes`: Optional notes
- `created_by`: Admin who created the block

### 2. Updated Availability Check

**File:** `app/api/rooms/check-availability/route.ts`

Modified the availability checking logic to:

- Check for regular bookings (as before)
- **NEW:** Check for room blocks in the requested date range
- Combine both booked and blocked room IDs
- Exclude these rooms from available results

### 3. Created API Routes

**File:** `app/api/admin/room-blocks/route.ts`

Created three endpoints:

- **GET** `/api/admin/room-blocks` - List all blocks or blocks for a specific room
- **POST** `/api/admin/room-blocks` - Create a new block (with overlap validation)
- **DELETE** `/api/admin/room-blocks?id=xxx` - Delete a block

### 4. Added TypeScript Types

**File:** `types/index.ts`

Added `RoomBlock` interface for type safety.

## How to Use

### Step 1: Run the Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open the file: `supabase-migrations/0005_create_room_blocks.sql`
4. Copy and paste the entire content
5. Click "Run" to execute the migration

### Step 2: Create a Room Block (Manual Testing)

You can test the API using the browser console or Postman:

```javascript
// Example: Block Room for Dec 22-23, 2025
fetch("/api/admin/room-blocks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_ADMIN_TOKEN",
  },
  body: JSON.stringify({
    room_id: "YOUR_ROOM_ID", // Get this from the rooms table
    start_date: "2025-12-22",
    end_date: "2025-12-23",
    reason: "Personal Booking",
    notes: "Personal booking for family",
    created_by: "YOUR_ADMIN_USER_ID",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Step 3: Verify It Works

1. Try searching for rooms for Dec 22-23 on the website
2. The blocked room should NOT appear in the search results
3. Try searching for different dates (e.g., Dec 24-25)
4. The same room SHOULD appear in the search results

## Next Steps (Optional)

### Add UI to Admin Dashboard

You can add a "Room Blocks" tab to the media page or create a separate page:

1. Add a new tab type: `type TabType = "rooms" | "media" | "gallery" | "blocks"`
2. Create a UI to:
   - List all current blocks
   - Add new blocks (select room, dates, reason)
   - Delete existing blocks
3. Use the API routes we created

### Example UI Features:

- Calendar view showing blocked dates
- Room selector dropdown
- Date range picker
- Reason dropdown
- Notes text area
- List of active blocks with delete buttons

## Database Query Examples

### View all blocks:

```sql
SELECT
  rb.*,
  r.room_number,
  r.room_type
FROM room_blocks rb
JOIN rooms r ON rb.room_id = r.id
ORDER BY rb.start_date DESC;
```

### Block a room directly in SQL:

```sql
INSERT INTO room_blocks (room_id, start_date, end_date, reason, notes)
VALUES (
  'YOUR_ROOM_ID',
  '2025-12-22',
  '2025-12-23',
  'Personal Booking',
  'Family visit'
);
```

### Delete a block:

```sql
DELETE FROM room_blocks WHERE id = 'BLOCK_ID';
```

## Important Notes

1. **is_available vs room_blocks:**

   - `is_available = false` on rooms table → Room is COMPLETELY unavailable for ALL dates
   - `room_blocks` entry → Room is unavailable ONLY for specific dates

2. **Overlap Prevention:**

   - The API prevents creating overlapping blocks for the same room
   - You'll get an error if you try to create a block that overlaps with an existing one

3. **Testing:**
   - Always test with different date ranges to ensure blocks work correctly
   - Check that rooms appear available outside the blocked dates

## Troubleshooting

**Room still showing as available during blocked dates:**

- Check if the migration ran successfully
- Verify the block was created in the database
- Check browser console for any API errors

**Can't create a block:**

- Ensure dates are in YYYY-MM-DD format
- Check that end_date is after start_date
- Verify no overlapping blocks exist

**Room not showing at all:**

- Check if `is_available` is set to `true` on the rooms table
- Verify `is_active` is also `true`
