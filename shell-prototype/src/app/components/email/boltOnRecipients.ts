import type { RecipientRow } from './ComposeEmailWizard';
import { mockPersonnel, type Personnel } from '../../data/mockPersonnel';
import { mockPreceptors } from '../../data/mockPreceptors';
import { mockSchoolPartners } from '../../data/mockSchoolPartners';
import { mockPlacementFaculty } from '../../data/mockPlacementFaculty';

// Single place a Personnel record becomes a recipient row (PRD 5.6): records with
// Receive Notifications off carry an excludedReason, so every entry point —
// Generic, bolt-on, Personnel list — treats them identically.
export function personnelRecipientRow(p: Personnel): RecipientRow {
  return {
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    email: p.email,
    meta: p.role,
    ...(p.receiveNotifications ? {} : { excludedReason: 'notifications-off' as const }),
  };
}

// PRD 5.1: a contextual screen can reach several recipient types. These derive
// each type from the rows currently selected on that screen.
export function preceptorsAtLocations(locations: string[]): RecipientRow[] {
  const set = new Set(locations);
  return mockPreceptors
    .filter((p) => set.has(p.location))
    .map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, email: p.email, meta: p.location }));
}

export function personnelAtLocations(locations: string[]): RecipientRow[] {
  const set = new Set(locations);
  return mockPersonnel
    .filter((p) => set.has(p.location))
    .map(personnelRecipientRow);
}

// Every program contact on file for each school (the partner's Program Contacts list),
// not just the primary one. Contacts with no email are skipped; the product's fallback
// (the school-side request raiser) covers that case and isn't modelled here.
export function schoolContactsForSchools(schoolNames: string[]): RecipientRow[] {
  const set = new Set(schoolNames);
  return mockSchoolPartners
    .filter((s) => set.has(s.schoolName))
    .flatMap((s) =>
      s.contacts.filter((c) => c.email).map((c) => ({ id: `${s.id}:${c.email ?? c.name}`, name: c.name, email: c.email, meta: `${c.role} · ${s.schoolName}` })),
    );
}

export function facultyForSchools(schoolNames: string[]): RecipientRow[] {
  const set = new Set(schoolNames);
  return mockPlacementFaculty
    .filter((f) => set.has(f.school))
    .map((f) => ({ id: f.id, name: `${f.firstName} ${f.lastName}`, email: f.email, meta: f.school }));
}

// ── Schedules screens: tie each non-student recipient to the ticked schedules they are being emailed about ──
// A school contact, faculty member, site staff member or preceptor can be linked to several ticked schedules; the
// merge engine builds one email per person that covers all of them (the Schedule Table lists every one).
type Picked = { id: string; school: string; location: string };
const attach = (rows: RecipientRow[], picked: Picked[], keyOf: (r: RecipientRow) => string | undefined, pickedKey: (s: Picked) => string): RecipientRow[] =>
  rows.map((r) => ({ ...r, scheduleIds: picked.filter((s) => pickedKey(s) === keyOf(r)).map((s) => s.id) }));
export const schoolContactsForPicked = (picked: Picked[]) =>
  attach(schoolContactsForSchools(picked.map((s) => s.school)), picked, (r) => mockSchoolPartners.find((p) => r.id.startsWith(`${p.id}:`))?.schoolName, (s) => s.school);
export const facultyForPicked = (picked: Picked[]) =>
  attach(facultyForSchools(picked.map((s) => s.school)), picked, (r) => mockPlacementFaculty.find((f) => f.id === r.id)?.school, (s) => s.school);
export const personnelForPicked = (picked: Picked[]) =>
  attach(personnelAtLocations(picked.map((s) => s.location)), picked, (r) => mockPersonnel.find((p) => p.id === r.id)?.location, (s) => s.location);
export const preceptorsForPicked = (picked: Picked[]) =>
  attach(preceptorsAtLocations(picked.map((s) => s.location)), picked, (r) => mockPreceptors.find((p) => p.id === r.id)?.location, (s) => s.location);
