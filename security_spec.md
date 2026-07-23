# Firestore Security Specification & Invariants

## Data Invariants
1. User Profile (`/users/{userId}`):
   - A user profile can only be created/updated by the authenticated user whose `request.auth.uid == userId`.
   - The profile `uid` field must equal `request.auth.uid`.

2. Wardrobe Item (`/wardrobe/{itemId}`):
   - A wardrobe item must belong to the authenticated owner (`request.auth.uid == resource.data.userId` or `incoming().userId == request.auth.uid`).
   - The user cannot create wardrobe items on behalf of another user.

3. Laundry Batch (`/batches/{batchId}`):
   - A laundry batch can only be created by the owner (`incoming().userId == request.auth.uid`).
   - Users can read/list batches that belong to their own `userId`.

4. Activity Log (`/activityLogs/{logId}`):
   - Activity logs are authored by the authenticated user (`incoming().userId == request.auth.uid`).

## The Dirty Dozen Payloads (Security Tests)
1. Impersonate User Profile Creation (`userId != request.auth.uid`) -> PERMISSION_DENIED
2. Wardrobe Item Shadow Update (injecting `admin: true`) -> PERMISSION_DENIED
3. Laundry Batch Creation for another User (`userId != request.auth.uid`) -> PERMISSION_DENIED
4. Unauthenticated Read of User Profiles -> PERMISSION_DENIED
5. Overwriting `createdAt` timestamp during profile update -> PERMISSION_DENIED
6. Invalid Item ID with malicious 2KB characters in `/wardrobe/{itemId}` -> PERMISSION_DENIED
7. Updating Batch status without valid enum value -> PERMISSION_DENIED
8. Modifying another user's Wardrobe Item -> PERMISSION_DENIED
9. Modifying another user's Laundry Batch -> PERMISSION_DENIED
10. Blanket List query without filtering by `userId` -> PERMISSION_DENIED
11. Injecting 10MB text payload into `label` field -> PERMISSION_DENIED
12. Attempting to delete another user's activity logs -> PERMISSION_DENIED
