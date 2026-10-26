import { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogPortal, DialogOverlay } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { FontAwesomeIcon } from '../../font-awesome-icon';
import { Availability, AvailabilityStatus } from '../../../data/mockAvailabilities';
import { PublishPreferenceCardState, isCardValid } from '../publishPreferenceData';
import { WizardStepIndicator } from './WizardStepIndicator';
import { Step1Naming, Step1Data } from './Step1Naming';
import { Step2Dates, Step2Data } from './Step2Dates';
import { Step3Review } from './Step3Review';
import { Step4Publish } from './Step4Publish';
import { CreationProgress } from './CreationProgress';
import { CreationSummary } from './CreationSummary';

interface CreationResult {
  availability: Availability;
  status: 'created' | 'draft';
  error?: string;
}

interface Step4Data {
  publishMode: 'all' | 'individual';
  defaultPreference: PublishPreferenceCardState | null;
  overrides: Record<string, PublishPreferenceCardState>; // keyed by availability id
}

interface ValidationResult {
  valid: Availability[];
  flagged: Array<{ availability: Availability; reason: string }>;
}

type WizardState = 'prevalidation' | 'steps' | 'progress' | 'summary';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BulkCloneWizardProps {
  availabilities: Availability[];
  onClose: () => void;
  onCloneComplete: (created: Availability[]) => void;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateAvailabilities(availabilities: Availability[]): ValidationResult {
  const valid: Availability[] = [];
  const flagged: Array<{ availability: Availability; reason: string }> = [];

  for (const a of availabilities) {
    if (!a.locationGroup) {
      flagged.push({ availability: a, reason: 'Location Group no longer exists' });
    } else if (!a.discipline) {
      flagged.push({ availability: a, reason: 'Discipline no longer exists' });
    } else if (!a.programType) {
      flagged.push({ availability: a, reason: 'Program Type no longer exists' });
    } else {
      valid.push(a);
    }
  }

  return { valid, flagged };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkCloneWizard({
  availabilities: initialAvailabilities,
  onClose,
  onCloneComplete,
}: BulkCloneWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>('prevalidation');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeAvailabilities, setActiveAvailabilities] = useState<Availability[]>(initialAvailabilities);
  const [step3EntrySnapshot, setStep3EntrySnapshot] = useState<Availability[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: [], flagged: [] });

  const [step1Data, setStep1Data] = useState<Step1Data>({ template: '', resolvedNames: {}, locationOverrides: {} });
  const [step1IsValid, setStep1IsValid] = useState(false);

  const [step2Data, setStep2Data] = useState<Step2Data>({ mode: 'roll', dates: {} });
  const [step2IsValid, setStep2IsValid] = useState(false);

  const [step4Data, setStep4Data] = useState<Step4Data>({
    publishMode: 'all',
    defaultPreference: null,
    overrides: {},
  });
  const [creationResults, setCreationResults] = useState<CreationResult[]>([]);

  // ── Pre-validation on mount ──────────────────────────────────────────────
  useEffect(() => {
    const result = validateAvailabilities(initialAvailabilities);
    setValidationResult(result);
    if (result.flagged.length === 0) {
      setWizardState('steps');
    } else {
      setWizardState('prevalidation');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pre-validation handlers ──────────────────────────────────────────────
  const handleRemoveFlagged = () => {
    if (validationResult.valid.length === 0) {
      onClose();
      return;
    }
    setActiveAvailabilities(validationResult.valid);
    setCurrentStep(1);
    setWizardState('steps');
  };

  const handleContinueAnyway = () => {
    setActiveAvailabilities(initialAvailabilities);
    setCurrentStep(1);
    setWizardState('steps');
  };

  // ── Step navigation ──────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 3 && step3EntrySnapshot.length > 0) {
      setActiveAvailabilities(step3EntrySnapshot);
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setStep3EntrySnapshot([...activeAvailabilities]);
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleCreate = () => {
    const { publishMode, defaultPreference, overrides } = step4Data;
    if (!defaultPreference || !isCardValid(defaultPreference)) return;
    if (publishMode === 'individual') {
      const allOverridesValid = Object.values(overrides).every((o) => isCardValid(o));
      if (!allOverridesValid) return;
    }
    setWizardState('progress');
  };

  const isLastStep = currentStep === 4;

  function buildCreatedAvailabilities(): Availability[] {
    return creationResults.map((r, i) => {
      // Use per-availability override if set; otherwise fall back to default
      const pref =
        step4Data.publishMode === 'individual' && step4Data.overrides[r.availability.id]
          ? step4Data.overrides[r.availability.id]
          : step4Data.defaultPreference;

      const publishWhen = pref?.publishWhen;
      const derivedStatus: AvailabilityStatus =
        publishWhen === 'Scheduled'      ? 'Scheduled' :
        publishWhen === 'Do Not Publish' ? 'Draft'     :
        'Published'; // 'Now' or fallback

      return {
        ...r.availability,
        id: `clone-${Date.now()}-${i}`,
        name: step1Data.resolvedNames[r.availability.id] || r.availability.name,
        startDate:
          step2Data.dates[r.availability.id]?.startDate ?? r.availability.startDate,
        endDate:
          step2Data.dates[r.availability.id]?.endDate ?? r.availability.endDate,
        status: r.status === 'draft' ? 'Draft' : derivedStatus,
      };
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={true} modal={true}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex flex-col bg-neutral-50 focus:outline-none"
        >
          {/* ── Pre-validation interstitial ──────────────────────────────── */}
          {wizardState === 'prevalidation' && (
            <div className="flex flex-col items-center justify-center flex-1 p-8">
              <DialogPrimitive.Title className="sr-only">Clone Availabilities — Review</DialogPrimitive.Title>
              <div className="max-w-lg w-full">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-warning-default font-bold text-base leading-none">!</span>
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-900 pt-1.5">
                    Some availabilities need attention
                  </h2>
                </div>

                <div className="mb-6 bg-accent-50 border border-accent-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {validationResult.flagged.map(({ availability, reason }) => (
                      <li key={availability.id} className="flex items-start gap-2 text-sm">
                        <span className="text-warning-default flex-shrink-0 mt-0.5">•</span>
                        <div>
                          <span className="font-medium text-neutral-850">{availability.name}</span>
                          <span className="text-neutral-600 ml-1.5">— {reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
                  {validationResult.valid.length > 0 ? (
                    <Button
                      
                      onClick={handleRemoveFlagged}
                    >
                      Remove flagged &amp; continue ({validationResult.valid.length} remaining)
                    </Button>
                  ) : (
                    <p className="text-sm text-negative-default">
                      All selected availabilities have issues — nothing to clone.
                    </p>
                  )}
                  <Button variant="outline" onClick={handleContinueAnyway}>
                    Continue anyway
                  </Button>
                  <Button variant="ghost" className="text-neutral-600" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Creation in flight ───────────────────────────────────────── */}
          {wizardState === 'progress' && (
            <>
              <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4 flex items-center bg-card">
                <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900 mr-6">
                  Clone Availabilities
                </DialogPrimitive.Title>
                <WizardStepIndicator currentStep={5 as 1 | 2 | 3 | 4} />
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 p-6">
                <CreationProgress
                  availabilities={activeAvailabilities}
                  resolvedNames={step1Data.resolvedNames}
                  onComplete={(results) => {
                    setCreationResults(results);
                    setWizardState('summary');
                  }}
                />
              </div>

              <div className="flex-shrink-0 border-t border-neutral-200 px-6 py-4 flex items-center justify-end bg-card">
                <Button
                  disabled
                  
                >
                  <FontAwesomeIcon name="spinner" className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Creating…
                </Button>
              </div>
            </>
          )}

          {/* ── Summary ──────────────────────────────────────────────────── */}
          {wizardState === 'summary' && (
            <>
              <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-6">
                  <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900">
                    Clone Availabilities
                  </DialogPrimitive.Title>
                  <WizardStepIndicator currentStep={5 as 1 | 2 | 3 | 4} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  aria-label="Close wizard"
                  onClick={() => onCloneComplete(buildCreatedAvailabilities())}
                >
                  <FontAwesomeIcon name="x" className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 p-6">
                <CreationSummary
                  results={creationResults}
                  resolvedNames={step1Data.resolvedNames}
                  onDone={() => onCloneComplete(buildCreatedAvailabilities())}
                  onViewDrafts={() => onCloneComplete(buildCreatedAvailabilities())}
                />
              </div>
            </>
          )}

          {/* ── Wizard steps (1, 2, 3, 4) ─────────────────────────────────── */}
          {wizardState === 'steps' && (
            <>
              {/* Fixed header */}
              <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-6">
                  <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900">
                    Clone Availabilities
                  </DialogPrimitive.Title>
                  <WizardStepIndicator currentStep={currentStep} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  aria-label="Close wizard"
                  onClick={onClose}
                >
                  <FontAwesomeIcon name="x" className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto min-h-0 p-6">
                {currentStep === 1 && (
                  <Step1Naming
                    availabilities={activeAvailabilities}
                    initialData={step1Data}
                    onDataChange={setStep1Data}
                    onValidityChange={setStep1IsValid}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Dates
                    availabilities={activeAvailabilities}
                    resolvedNames={step1Data.resolvedNames}
                    initialData={step2Data}
                    onDataChange={setStep2Data}
                    onValidityChange={setStep2IsValid}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Review
                    availabilities={activeAvailabilities}
                    resolvedNames={step1Data.resolvedNames}
                    dates={step2Data.dates}
                    onDelete={(id) =>
                      setActiveAvailabilities((prev) => prev.filter((a) => a.id !== id))
                    }
                  />
                )}
                {currentStep === 4 && (
                  <Step4Publish
                    availabilities={activeAvailabilities}
                    resolvedNames={step1Data.resolvedNames}
                    dates={step2Data.dates}
                    initialMode={step4Data.publishMode}
                    initialDefaultPreference={step4Data.defaultPreference}
                    initialOverrides={step4Data.overrides}
                    onDataChange={(mode, defaultPref, overrides) =>
                      setStep4Data({ publishMode: mode, defaultPreference: defaultPref, overrides })
                    }
                  />
                )}
              </div>

              {/* Fixed footer */}
              <div className="flex-shrink-0 border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-card">
                <Button
                  variant="outline"
                                    onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <FontAwesomeIcon name="chevronLeft" className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Back
                </Button>

                <span className="hidden md:block text-sm text-neutral-700" aria-live="polite">
                  {activeAvailabilities.length} {activeAvailabilities.length === 1 ? 'availability' : 'availabilities'} in this batch
                </span>

                <div className="flex items-center gap-3">
                  {currentStep === 2 && step2Data.mode === 'custom' && !step2IsValid && (
                    <p className="text-xs text-warning-default">
                      Choose a start and end date to continue.
                    </p>
                  )}
                  <Button
                    onClick={isLastStep ? handleCreate : handleNext}
                    disabled={
                      (currentStep === 1 && !step1IsValid) ||
                      (currentStep === 2 && !step2IsValid) ||
                      (currentStep === 3 && activeAvailabilities.length === 0) ||
                      (currentStep === 4 && (
                        !step4Data.defaultPreference ||
                        !isCardValid(step4Data.defaultPreference) ||
                        (step4Data.publishMode === 'individual' &&
                          Object.values(step4Data.overrides).some((o) => !isCardValid(o)))
                      ))
                    }
                  >
                    {isLastStep ? (
                      'Create Availabilities'
                    ) : (
                      <>
                        Next
                        <FontAwesomeIcon name="chevronRight" className="w-4 h-4 ml-1.5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
