import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  title: string;
  description?: string;
  validationFn?: () => Promise<boolean> | boolean;
}

interface WizardContextValue {
  currentStepIndex: number;
  steps: Step[];
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => void;
  goToStep: (index: number) => void;
  progress: number;
}

interface WizardProviderProps {
  steps: Step[];
  children: React.ReactNode;
  onComplete?: () => void;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export const WizardProvider: React.FC<WizardProviderProps> = ({ 
  steps, 
  children, 
  onComplete 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const contextValue = useMemo(() => {
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const goToNextStep = async () => {
      const currentStep = steps[currentStepIndex];
      if (currentStep.validationFn) {
        const isValid = await currentStep.validationFn();
        if (!isValid) return;
      }

      if (isLastStep) {
        onComplete?.();
      } else {
        setCurrentStepIndex(i => i + 1);
      }
    };

    const goToPreviousStep = () => {
      if (!isFirstStep) {
        setCurrentStepIndex(i => i - 1);
      }
    };

    const goToStep = (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index);
      }
    };

    return {
      currentStepIndex,
      steps,
      isFirstStep,
      isLastStep,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      progress,
    };
  }, [currentStepIndex, steps, onComplete]);

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

export const WizardSteps: React.FC = () => {
  const { steps, currentStepIndex, progress } = useWizard();

  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCurrent = currentStepIndex === index;
          const isCompleted = currentStepIndex > index;

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  'group pl-4 py-2 flex flex-col border-l-4 md:border-l-0 md:border-t-4',
                  'md:pt-4 md:pl-0',
                  isCompleted
                    ? 'border-blue-600'
                    : isCurrent
                    ? 'border-blue-600'
                    : 'border-gray-200'
                )}
              >
                <span
                  className={cn(
                    'text-xs font-semibold tracking-wide uppercase',
                    isCompleted
                      ? 'text-blue-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-sm text-gray-500">{step.description}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <div className="relative">
          <div className="overflow-hidden h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute top-0 right-0 -mt-2 text-sm text-gray-600">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </nav>
  );
};

export const WizardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStepIndex } = useWizard();
  const childrenArray = React.Children.toArray(children);
  const currentChild = childrenArray[currentStepIndex];

  return <div className="mt-8">{currentChild}</div>;
};

export const WizardNavigation: React.FC<{
  nextButtonText?: string;
  previousButtonText?: string;
}> = ({ 
  nextButtonText = 'Next',
  previousButtonText = 'Previous'
}) => {
  const { isFirstStep, isLastStep, goToNextStep, goToPreviousStep } = useWizard();

  return (
    <div className="mt-8 flex justify-between">
      <button
        type="button"
        onClick={goToPreviousStep}
        disabled={isFirstStep}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md',
          !isFirstStep
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
        )}
      >
        {previousButtonText}
      </button>

      <button
        type="button"
        onClick={goToNextStep}
        className={cn(
          'px-4 py-2 text-sm font-medium text-white rounded-md',
          'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2',
          'focus:ring-offset-2 focus:ring-blue-500'
        )}
      >
        {isLastStep ? 'Complete' : nextButtonText}
      </button>
    </div>
  );
};

/* Usage example:
const steps = [
  {
    id: 'step1',
    title: 'Personal Information',
    description: 'Fill in your personal details',
    validationFn: async () => {
      // Validate step 1 data
      return true;
    }
  },
  {
    id: 'step2',
    title: 'Contact Details',
    description: 'How can we reach you?'
  },
  {
    id: 'step3',
    title: 'Review',
    description: 'Review your information'
  }
];

const MyWizard = () => {
  const handleComplete = () => {
    console.log('Wizard completed!');
  };

  return (
    <WizardProvider steps={steps} onComplete={handleComplete}>
      <div className="max-w-3xl mx-auto p-6">
        <WizardSteps />
        <WizardContent>
          <div>Step 1 Content</div>
          <div>Step 2 Content</div>
          <div>Step 3 Content</div>
        </WizardContent>
        <WizardNavigation />
      </div>
    </WizardProvider>
  );
};
*/

// Utility function to combine class names
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
