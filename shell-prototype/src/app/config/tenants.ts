/**
 * Launcher consortium tenants grouped by discipline (cosmetic grouping only).
 * Every consortium opens the same Network Admin dashboard.
 * // TODO(pm-feedback): "Edit Tennant" spelling matches screenshot — confirm
 */

export type TenantTone = 'nursing' | 'pt';

export interface ConsortiumTenant {
  id: string;
  name: string;
  scopeLabel: string;
  metaLine: string;
  tone: TenantTone;
}

export interface TenantDisciplineGroup {
  id: string;
  label: string;
  tenants: ConsortiumTenant[];
}

export const launcherCopy = {
  heading: 'Select how you would like to continue.',
  asSiteLabel: 'As Site',
  asSiteContinue: 'Continue',
  editTenant: 'Edit Tennant',
  networkLayerWordmark: 'Network Layer',
} as const;

export const tenantGroups: TenantDisciplineGroup[] = [
  {
    id: 'nursing',
    label: 'Nursing Consortium Level Tenants',
    tenants: [
      {
        id: 'mddc-nursing',
        name: 'MDDC Nursing consortium',
        scopeLabel: 'all branches | (only sites) group',
        metaLine: 'Additional details | Req · Emp · Slot · Quick upfront info',
        tone: 'nursing',
      },
      {
        id: 'tri-state-nursing',
        name: 'Tri-State Nursing Alliance',
        scopeLabel: 'all branches | (only sites) group',
        metaLine: 'Additional details | Req · Emp · Slot · Quick upfront info',
        tone: 'nursing',
      },
    ],
  },
  {
    id: 'pt',
    label: 'Physical Therapy Consortium Level Tenants',
    tenants: [
      {
        id: 'access-therapy',
        name: 'Access Therapy',
        scopeLabel: 'all branches | (sites + school) group',
        metaLine: 'Additional details | Req · Emp · Slot · Quick upfront info',
        tone: 'pt',
      },
      {
        id: 'apex-pt',
        name: 'Apex Physical Therapy',
        scopeLabel: 'all branches | (sites + school) group',
        metaLine: 'Additional details | Req · Emp · Slot · Quick upfront info',
        tone: 'pt',
      },
      {
        id: 'aim-allied',
        name: 'Aim Allied Healthcare',
        scopeLabel: 'regional | (sites only) group',
        metaLine: 'Additional details | Req · Emp · Slot · Quick upfront info',
        tone: 'pt',
      },
    ],
  },
];
