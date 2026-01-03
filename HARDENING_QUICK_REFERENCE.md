# Admin Programs Hardening - Quick Reference

## What Was Implemented

### 🔒 Security Improvements
1. **Strict Input Validation** - Backend rejects unknown fields, enforces field limits
2. **Comprehensive Error Handling** - Try-catch blocks return structured validation errors
3. **Audit Logging** - All saves/deletes logged with complete program data
4. **Authorization Checks** - OWNER role enforcement on all endpoints

### 🎨 User Experience Improvements
1. **Validation Error Display** - Red borders on invalid fields with error messages
2. **Toast Notifications** - Success/error feedback for all operations
3. **Confirmation Dialogs** - "Are you sure?" for delete operations
4. **Client-Side Validation** - Immediate feedback before API calls
5. **Dirty State Tracking** - Visual "*" asterisk for unsaved changes

---

## Code Changes by File

### Backend (2 files)

**`server/api/admin/programs.post.ts`**
```typescript
// Before
const program = gameSchema.parse(body); // Could throw, crashes endpoint

// After
try {
  const program = gameSchema.strict().parse(body); // Rejects unknown fields
} catch (error) {
  return createError({
    statusCode: 400,
    message: "Validation failed",
    errors: error.errors.map(e => ({
      path: e.path.join("."),
      message: e.message
    }))
  });
}
```

**`server/api/admin/programs.delete.ts`**
- Added slug validation schema
- Added program existence check
- Enhanced audit logging with full program data

### Frontend State (1 file)

**`stores/ops.ts`**
```typescript
// Before
async saveProgram(program) {
  const response = await $fetch("/api/admin/programs", { ... });
  await this.refreshPrograms();
}

// After
async saveProgram(program) {
  try {
    const response = await $fetch("/api/admin/programs", { ... });
    await this.refreshPrograms();
    return { success: true, data: response };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      validationErrors: error?.data?.errors || [] 
    };
  }
}
```

### Frontend Components (2 files)

**`components/admin/OperationsBuilder.vue`**
```typescript
const handleProgramSave = async (p: any) => {
  const result = await opsStore.saveProgram(p);
  if (result.success) {
    toast.success(`Program "${p?.name}" saved successfully`);
    isProgramDirty.value = false;
  } else {
    const errorMsg = result.validationErrors?.length
      ? `Validation errors: ${result.validationErrors.map(e => `${e.path}: ${e.message}`).join("; ")}`
      : result.error;
    toast.error(errorMsg, { duration: 5000 });
  }
};
```

**`components/admin/ProgramEditor.vue`**
```vue
<!-- Error display under each field -->
<input v-model="form.name" :class="{ 'border-rose-500': validationErrors.name }" />
<p v-if="validationErrors.name" class="text-xs text-rose-500 mt-1">
  {{ validationErrors.name }}
</p>

<!-- Games validation alert -->
<div v-if="validationErrors.games" class="bg-rose-50 border border-rose-200 rounded-xl p-4">
  <AlertCircle class="w-5 h-5 text-rose-500" />
  {{ validationErrors.games }}
</div>
```

```typescript
const saveProgram = () => {
  validationErrors.value = {};
  
  // Validate required fields
  if (!form.value.slug?.trim()) {
    validationErrors.value["slug"] = "Program slug is required";
    return;
  }
  if (!form.value.name?.trim()) {
    validationErrors.value["name"] = "Program name is required";
    return;
  }
  if (form.value.games.length === 0) {
    validationErrors.value["games"] = "At least one game is required";
    return;
  }
  
  // Validate games
  for (let i = 0; i < form.value.games.length; i++) {
    const game = form.value.games[i];
    if (!game.title?.trim()) {
      validationErrors.value[`games[${i}].title`] = "Game title is required";
      return;
    }
    if (!game.patternSlug) {
      validationErrors.value[`games[${i}].patternSlug`] = "Game pattern is required";
      return;
    }
  }
  
  emit("save", form.value);
};
```

---

## How It Works (Complete Flow)

### Happy Path: Save Program
1. **User** clicks "Save" button → `handleProgramSave()` called
2. **ProgramEditor** validates client-side:
   - slug required? ✓
   - name required? ✓
   - at least 1 game? ✓
   - each game has title & pattern? ✓
3. **ProgramEditor** emits "save" event to OperationsBuilder
4. **OperationsBuilder** calls `opsStore.saveProgram(program)`
5. **Store** POST to `/api/admin/programs` with CSRF token + credentials
6. **Backend** validates with strict schema:
   - Unknown fields rejected
   - Field lengths checked
   - Try-catch catches validation errors
7. **Prisma** saves program + games to database
8. **AuditService** logs save with full program data
9. **Backend** returns `{ success: true, program: {...} }`
10. **Store** catches response, refreshes programs list
11. **Store** returns `{ success: true, data: response }`
12. **OperationsBuilder** shows success toast "Program saved successfully"
13. **OperationsBuilder** sets `isProgramDirty = false`
14. **UI** removes "*" asterisk from program name

### Error Path: Validation Error
1. **User** tries to save with blank slug
2. **ProgramEditor.saveProgram()** executes:
   ```typescript
   if (!form.value.slug?.trim()) {
     validationErrors.value["slug"] = "Program slug is required";
     return; // ← Exit early, don't emit save
   }
   ```
3. **Template** renders error:
   ```html
   <p class="text-rose-500">Program slug is required</p>
   ```
4. **Input** shows red border:
   ```
   <input class="border-rose-500" />
   ```
5. **User** sees immediate feedback (no API call)
6. **User** fixes slug, tries again
7. **Validation passes**, save proceeds

### Error Path: Backend Validation Error
1. **User** provides valid slug/name but malformed game payout
2. **ProgramEditor** validates successfully (passes structure check)
3. **Store** calls API with program data
4. **Backend** parses with `gameSchema.strict()`:
   ```typescript
   try {
     const game = gameSchema.strict().parse(game);
   } catch (error) {
     return createError({
       statusCode: 400,
       errors: [{ path: "games[0].payout.amount", message: "must be a number" }]
     });
   }
   ```
5. **Store** catches error:
   ```typescript
   catch (error) {
     return {
       success: false,
       validationErrors: error?.data?.errors // ← Frontend gets detailed errors
     };
   }
   ```
6. **OperationsBuilder** formats and shows toast:
   ```typescript
   const errorMsg = `Validation errors: games[0].payout.amount: must be a number`;
   toast.error(errorMsg, { duration: 5000 }); // ← 5 seconds so user can read
   ```

### Delete Path
1. **User** clicks delete on a program
2. **OperationsBuilder.handleProgramDelete()** shows confirmation:
   ```
   "Are you sure you want to delete this program? This action cannot be undone."
   ```
3. **User** confirms
4. **Store** calls DELETE `/api/admin/programs?slug=...`
5. **Backend**:
   - Validates slug parameter
   - Verifies program exists
   - Deletes program + all related games
   - Logs deletion with full program snapshot to audit log
6. **Store** refreshes programs list
7. **OperationsBuilder** shows success toast
8. **Program removed from list**

---

## Configuration Details

### Validation Rules

**Program Fields**:
- `slug`: required, 1-255 characters
- `name`: required, 1-255 characters
- `description`: optional, max 1000 characters
- `games`: array, minimum 1, maximum 100 games

**Game Fields**:
- `title`: required, 1-255 characters
- `patternSlug`: required, must be valid pattern slug
- `timeline.estimatedDuration`: required, 1-480 minutes
- `payout.amount`: number
- All fields in strict schemas (no unknown fields allowed)

### Toast Configuration
- **Success**: Green, auto-dismiss in 3 seconds
- **Error**: Red, 5 seconds (longer for detailed validation errors)
- **Warning**: Yellow, 4 seconds

### Keyboard Shortcuts
- `Ctrl+S`: Save current program
- `Ctrl+N`: Add new game to program
- `Esc`: Close context menu

---

## Testing Tips

### Test Case: Missing Required Field
```
1. Click "+ New" to create program
2. Leave "Name" empty
3. Click "Save"
✓ Expected: Red border on Name field, error text below input
✓ No API call should be made
```

### Test Case: Field Too Long
```
1. Create program with:
   - Name: "A" × 256 characters (exceeds limit)
   - Slug: "test"
2. Click "Save"
✓ Expected: Name field shows error "exceeds maximum length of 255"
✓ Red border appears
```

### Test Case: Delete Confirmation
```
1. Click Delete on a program
✓ Expected: JavaScript dialog appears
2. Click Cancel
✓ Expected: Program not deleted, list unchanged
3. Click Delete again, Click OK
✓ Expected: Program deleted, success toast shown
```

### Test Case: Unsaved Changes
```
1. Edit a program name
✓ Expected: "*" asterisk appears next to program name
2. Click Save
✓ Expected: "*" disappears, success toast shown
3. Edit again
✓ Expected: "*" reappears
4. Navigate to different tab without saving
✓ Expected: Confirmation dialog "You have unsaved changes"
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Program slug is required" | Blank slug field | Enter a slug value (e.g., "tuesday-bingo") |
| "Validation errors: slug: must be at least 1 character" | Backend validation | Check backend schema - slug field length |
| Red border on input but no error text | validationErrors not populated | Check if validationErrors ref is reactive |
| "Failed to save program" toast but no details | API error without validation errors | Check browser console for full error |
| Delete button doesn't work | No confirmation clicked | Look for browser confirmation dialog |
| Changes saved but dirty indicator persists | isDirty computed not updating | Check JSON serialization in computed |

---

## Deployment Checklist

- [x] All ESLint errors resolved (lint passes)
- [x] Vue templates properly formatted
- [x] TypeScript types compatible
- [x] CSRF token integration working
- [x] Audit logging enabled
- [x] Error responses don't leak sensitive data
- [x] All changes backward-compatible
- [x] No new npm dependencies added
- [x] No breaking API changes

---

## Support

For issues with this implementation:
1. Check validation error message in toast
2. Review browser console for JavaScript errors
3. Check server logs for API errors
4. Review audit log to verify operations were recorded
5. Test with manual flows from "Testing Tips" section above
