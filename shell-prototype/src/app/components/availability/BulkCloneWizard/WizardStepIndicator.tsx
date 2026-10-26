import { FontAwesomeIcon } from '../../font-awesome-icon';

const STEPS: Array<{ num: 1 | 2 | 3 | 4; label: string }> = [
  { num: 1, label: 'Naming' },
  { num: 2, label: 'Dates' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Publish' },
];

interface WizardStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;

        return (
          <div key={step.num} className="flex items-center">
            {idx > 0 && (
              <div className={`h-px w-10 mx-2 ${done ? 'bg-blue-500' : 'bg-neutral-300'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                  ${active || done ? 'bg-blue-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}
              >
                {done ? (
                  <FontAwesomeIcon name="check" className="w-3 h-3" aria-hidden="true" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-sm
                  ${active
                    ? 'font-semibold text-blue-500 underline underline-offset-2'
                    : done
                    ? 'font-medium text-blue-500'
                    : 'font-medium text-neutral-600'
                  }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
