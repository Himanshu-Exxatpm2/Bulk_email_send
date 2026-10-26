/**
 * School launch cards (Figma 413:6334). Mirrors the live "895 results" density
 * without shipping a real catalog — enough rows to exercise search + pagination.
 */

export interface LaunchSchoolCard {
  id: string;
  name: string;
}

export const schoolLaunchCards: LaunchSchoolCard[] = [
  { id: 'atsu-santa-maria-pa', name: 'A.T. Still University - Central Coast - Santa Maria Campus - PA' },
  { id: 'atsu-missouri-do', name: 'A.T. Still University - Missouri Campus - DO' },
  { id: 'atsu-missouri-md', name: 'A.T. Still University - Missouri Campus - MD' },
  { id: 'atsu-arizona-ot', name: 'A.T. Still University, Arizona Campus - OT' },
  { id: 'abc-university-nursing', name: 'ABC University - Nursing' },
  { id: 'abilene-nursing-bsn', name: 'Abilene Christian University - Nursing - BSN' },
  { id: 'abilene-christian-ot', name: 'Abilene Christian University - OT' },
  { id: 'abilene-christian-dpt', name: 'Abilene Christine University - DPT' },
  { id: 'abilene-medical-assistant', name: 'Abilene Medical Assistant School - Medical Assistant' },
  { id: 'ace-surgical-assistant', name: 'ACE Surgical Assistant' },
  { id: 'adelphi-public-health', name: 'Adelphi University - Public Health' },
  { id: 'alabama-state-dpt', name: 'Alabama State University - DPT' },
  { id: 'allegany-nursing-adn', name: 'Allegany College of Maryland - Nursing-ADN' },
  { id: 'allegany-respiratory', name: 'Allegany College of Maryland - Respiratory Therapy' },
  { id: 'allegany-nursing', name: 'Allegany College of Maryland-Nursing' },
  { id: 'allegany-nursing-lpn-rn', name: 'Allegany College of Maryland-Nursing-LPN-RN' },
  { id: 'allen-college-dpt', name: 'Allen College - DPT' },
  { id: 'alvernia-dpt', name: 'Alvernia University - DPT' },
  { id: 'american-public-nursing', name: 'American Public University - Nursing' },
  { id: 'american-public-health', name: 'American Public University - Health Science' },
  { id: 'anderson-school-allied', name: 'Anderson School of Allied Sciences' },
  { id: 'andrews-university-dpt', name: 'Andrews University - DPT' },
  { id: 'angelo-state-nursing', name: 'Angelo State University - Nursing' },
  { id: 'appalachian-state-nursing', name: 'Appalachian State University - Nursing' },
];

export const schoolLaunchTotalCount = 895;
