# Security Specification (`security_spec.md`) — LOMBOK NUSANTARA TRAVEL

## 1. Data Invariants

1. **Authentication & Email Verification Invariant**:
   - All write operations (`create`, `update`, `delete`) across `/bookings/{bookingId}`, `/transfers/{transferId}`, and `/inquiries/{inquiryId}` require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
2. **Ownership & PII Isolation Invariant**:
   - Every document in `/bookings`, `/transfers`, and `/inquiries` contains guest PII (`guestName`, `guestContact` / `contactInfo`).
   - `ownerId` must strictly equal `request.auth.uid` on creation and remain immutable on all updates (`incoming().ownerId == existing().ownerId`).
   - `get` and `list` operations are restricted strictly to the document owner (`resource.data.ownerId == request.auth.uid`) or a verified administrator (`isAdmin()`). Blanket `isSignedIn()` reads are strictly prohibited.
3. **Path Variable & Payload Size Hardening Invariant**:
   - Every document ID path variable (`bookingId`, `transferId`, `inquiryId`, `adminId`) on single-document operations (`get`, `create`, `update`, `delete`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
   - Every string field has an explicit `.size() <= MAX` bound matching `firebase-blueprint.json`.
4. **Temporal & Terminal State Integrity**:
   - On `create`: `createdAt == request.time && updatedAt == request.time` and initial status must be `'pending'` (or `'new'` for inquiries).
   - On `update`: `createdAt == existing().createdAt` (immortal field) and `updatedAt == request.time`.
   - Once a booking or transfer reaches terminal status (`'completed'` or `'cancelled'`), or an inquiry reaches `'closed'`, non-admin users cannot mutate the document further.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on Create)**: Authenticated user `user_A` attempts to create `/bookings/bk_1` with `ownerId: "user_B"`. -> `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Email Write)**: User with `email_verified: false` attempts to create `/bookings/bk_2`. -> `PERMISSION_DENIED`.
3. **Payload 3 (Shadow / Ghost Field Injection on Create)**: User sends valid booking fields plus `"isPaid": true` or `"role": "admin"`. Rejected by `keys().hasOnly(...)`. -> `PERMISSION_DENIED`.
4. **Payload 4 (PII Cross-Tenant Read / Blanket Get)**: Authenticated user `user_B` attempts `get` on `/bookings/bk_owned_by_A`. -> `PERMISSION_DENIED`.
5. **Payload 5 (Unfiltered List Scraping)**: Authenticated user `user_B` attempts `list` on `/bookings` without `where('ownerId', '==', 'user_B')`. -> `PERMISSION_DENIED`.
6. **Payload 6 (Owner Hijack on Update)**: Owner `user_A` attempts to update `ownerId` to `"user_B"` on `/bookings/bk_1`. -> `PERMISSION_DENIED`.
7. **Payload 7 (CreatedAt Time-Travel Forgery)**: User attempts to create `/bookings/bk_1` with a past/future client timestamp (`createdAt != request.time`) or mutate `createdAt` during update. -> `PERMISSION_DENIED`.
8. **Payload 8 (State Shortcutting on Create)**: User attempts to create `/bookings/bk_1` directly with `status: "confirmed"` instead of `"pending"`. -> `PERMISSION_DENIED`.
9. **Payload 9 (Terminal State Re-opening)**: User attempts to update `/bookings/bk_completed` when `existing().status == "cancelled"` or `"completed"`. -> `PERMISSION_DENIED`.
10. **Payload 10 (Value Poisoning on Update)**: User updates allowed key `pickupNotes` with a 5,000-character string or a boolean value. Blocked by `isValidBooking(incoming())` wrapping the update block. -> `PERMISSION_DENIED`.
11. **Payload 11 (Path Variable ID Poisoning)**: User attempts to create a booking with an invalid document ID containing spaces or special characters. Blocked by `isValidId(bookingId)`. -> `PERMISSION_DENIED`.
12. **Payload 12 (Privilege Escalation via `/admins` Write)**: User attempts to create `/admins/{uid}` to grant themselves admin privileges. Blocked by `allow write: if false;`. -> `PERMISSION_DENIED`.

---

## 3. Security Rules Test Suite Reference (`firestore.rules.test.ts`)

All 12 adversarial payloads above are systematically denied by the hardened validation gates (`isValidBooking`, `isValidTransfer`, `isValidInquiry`, `isValidId`, `isVerifiedUser`, `isOwner`, and `isAdmin`).
