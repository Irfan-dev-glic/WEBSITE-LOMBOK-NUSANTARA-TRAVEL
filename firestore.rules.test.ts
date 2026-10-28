/**
 * Security Rules Verification Suite (Dirty Dozen Adversarial Payloads)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected.
 */

export interface AdversarialPayloadTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: AdversarialPayloadTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Create',
    collection: 'bookings',
    docId: 'bk-spoof-1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: {
      ownerId: 'user_B',
      bookingRef: 'LNT-3GIL-2P',
      packageId: 'pkg-3gili-private',
      packageTitle: 'Eksplorasi 3 Gili',
      travelDate: '2026-11-15',
      pax: 2,
      totalPriceIdr: 1300000,
      totalPriceUsd: 90,
      addOns: '',
      guestName: 'Budi Santoso',
      guestContact: '+628123456789',
      pickupNotes: 'Senggigi',
      status: 'pending'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collection: 'bookings',
    docId: 'bk-unverified-2',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: false },
    payload: {
      ownerId: 'user_A',
      bookingRef: 'LNT-3GIL-2P',
      packageId: 'pkg-3gili-private',
      packageTitle: 'Eksplorasi 3 Gili',
      travelDate: '2026-11-15',
      pax: 2,
      totalPriceIdr: 1300000,
      totalPriceUsd: 90,
      addOns: '',
      guestName: 'Budi Santoso',
      guestContact: '+628123456789',
      pickupNotes: '',
      status: 'pending'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Shadow / Ghost Field Injection on Create',
    collection: 'bookings',
    docId: 'bk-shadow-3',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: {
      ownerId: 'user_A',
      bookingRef: 'LNT-3GIL-2P',
      packageId: 'pkg-3gili-private',
      packageTitle: 'Eksplorasi 3 Gili',
      travelDate: '2026-11-15',
      pax: 2,
      totalPriceIdr: 1300000,
      totalPriceUsd: 90,
      addOns: '',
      guestName: 'Budi Santoso',
      guestContact: '+628123456789',
      pickupNotes: '',
      status: 'pending',
      isAdminOverride: true
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'PII Cross-Tenant Read / Blanket Get',
    collection: 'bookings',
    docId: 'bk-owned-by-A',
    operation: 'get',
    auth: { uid: 'user_B', email: 'userb@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Unfiltered List Scraping',
    collection: 'bookings',
    docId: '*',
    operation: 'list',
    auth: { uid: 'user_B', email: 'userb@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Owner Hijack on Update',
    collection: 'bookings',
    docId: 'bk-owned-by-A',
    operation: 'update',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { ownerId: 'user_B' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'CreatedAt Time-Travel Forgery',
    collection: 'transfers',
    docId: 'tr-time-7',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: {
      ownerId: 'user_A',
      routeId: 'lop-kuta',
      routeName: 'Bandara LOP - Kuta Mandalika',
      vehicleType: 'innova',
      pickupDate: '2026-11-18',
      flightCode: 'QG-640',
      priceIdr: 275000,
      priceUsd: 19,
      status: 'pending',
      createdAt: '2020-01-01T00:00:00Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'State Shortcutting on Create',
    collection: 'bookings',
    docId: 'bk-shortcut-8',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: {
      ownerId: 'user_A',
      bookingRef: 'LNT-3GIL-2P',
      packageId: 'pkg-3gili-private',
      packageTitle: 'Eksplorasi 3 Gili',
      travelDate: '2026-11-15',
      pax: 2,
      totalPriceIdr: 1300000,
      totalPriceUsd: 90,
      addOns: '',
      guestName: 'Budi Santoso',
      guestContact: '+628123456789',
      pickupNotes: '',
      status: 'confirmed'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Terminal State Re-opening',
    collection: 'bookings',
    docId: 'bk-already-cancelled',
    operation: 'update',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { status: 'pending' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Value Poisoning on Update',
    collection: 'bookings',
    docId: 'bk-owned-by-A',
    operation: 'update',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { pickupNotes: 'A'.repeat(1000) },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Path Variable ID Poisoning',
    collection: 'inquiries',
    docId: 'invalid id with spaces & symbols!@#',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: {
      ownerId: 'user_A',
      guestName: 'Budi',
      contactInfo: 'budi@example.com',
      segment: 'Keluarga',
      paxCount: 4,
      notes: 'Trip ke Gili',
      status: 'new'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Privilege Escalation via /admins Write',
    collection: 'admins',
    docId: 'user_A',
    operation: 'create',
    auth: { uid: 'user_A', email: 'usera@example.com', email_verified: true },
    payload: { email: 'usera@example.com' },
    expectedOutcome: 'PERMISSION_DENIED'
  }
];
