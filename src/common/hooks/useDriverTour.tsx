/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useCallback } from 'react';
import { driver, DriveStep, Driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourStep {
  target: string;
  content: string;
  title?: string;
  disableBeacon?: boolean;
  data?: { 
    waitForInteraction?: boolean;
    buttonText?: string;
  };
  popoverClass?: string;
  onHighlightStarted?: (element: Element) => void;
  onDeselected?: (element: Element) => void;
}

interface UseDriverTourProps {
  steps: TourStep[];
  run: boolean;
  onFinish?: () => void;
  delay?: number;
  continueEvents?: string[];
}

export function useDriverTour({
  steps,
  run,
  onFinish,
  delay = 500,
  continueEvents = [],
}: UseDriverTourProps) {
  const driverRef = useRef<Driver | null>(null);
  const currentStepIndexRef = useRef(0);
  const isWaitingForInteraction = useRef(false);

  const continueDriver = useCallback(() => {
    console.log('Continuing tour from step:', currentStepIndexRef.current);
    console.log('Is waiting for interaction:', isWaitingForInteraction.current);
    
    if (!isWaitingForInteraction.current) {
      console.log('Not waiting for interaction, ignoring continue call');
      return;
    }
    
    isWaitingForInteraction.current = false;
    
    const nextStepIndex = currentStepIndexRef.current + 1;
    const remainingSteps = steps.slice(nextStepIndex);
    
    console.log('Next step index:', nextStepIndex);
    console.log('Remaining steps:', remainingSteps.length);
    
    if (remainingSteps.length === 0) {
      console.log('No more steps, finishing tour');
      onFinish?.();
      currentStepIndexRef.current = 0;
      return;
    }

    const driverSteps: DriveStep[] = remainingSteps.map((step) => ({
      element: step.target,
      popover: {
        title: step.title || '',
        description: step.content,
      },
    }));

    const config: Config = {
      showProgress: true,
      steps: driverSteps,
      nextBtnText: 'Continue',
      onNextClick: (element, step, options) => {
        const currentDriverStep = driverRef.current?.getActiveIndex() ?? 0;
        const actualStepIndex = nextStepIndex + currentDriverStep;
        const originalStep = steps[actualStepIndex];

        console.log('Continue tour - onNextClick, current step:', actualStepIndex);

        if (originalStep?.data?.waitForInteraction) {
          console.log('Step requires interaction, pausing tour at step:', actualStepIndex);
          currentStepIndexRef.current = actualStepIndex;
          isWaitingForInteraction.current = true;
          if (driverRef.current) {
            driverRef.current.destroy();
          }
        } else {
          currentStepIndexRef.current = actualStepIndex;
          if (driverRef.current) {
            driverRef.current.moveNext();
          }
        }
      },
      onDestroyed: () => {
        if (!isWaitingForInteraction.current) {
          onFinish?.();
          currentStepIndexRef.current = 0;
        }
      },
      onCloseClick: () => {
        if (driverRef.current) {
          driverRef.current.destroy();
        }
        onFinish?.();
        currentStepIndexRef.current = 0;
        isWaitingForInteraction.current = false;
      },
    };

    driverRef.current = driver(config);
    driverRef.current.drive();
  }, [steps, onFinish]);

  useEffect(() => {
    if (continueEvents.length === 0) return;

    const handlers = continueEvents.map((eventName) => {
      const handler = () => {
        console.log(`Event ${eventName} triggered, continuing tour...`);
        continueDriver();
      };
      window.addEventListener(eventName, handler);
      return { eventName, handler };
    });

    return () => {
      handlers.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
    };
  }, [continueEvents, continueDriver]);

  useEffect(() => {
    if (!run) {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      currentStepIndexRef.current = 0;
      isWaitingForInteraction.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const driverSteps: DriveStep[] = steps.map((step, index) => {
        const popoverConfig: any = {
          title: step.title || '',
          description: step.content,
          popoverClass: step.popoverClass,
        };

        if (step.data?.waitForInteraction) {
          // Show the done button (which acts as close on last/single step)
          popoverConfig.showButtons = ['next'];
          popoverConfig.nextBtnText = step.data.buttonText || 'OK';
        } else {
          popoverConfig.showButtons = ['next', 'previous', 'close'];
        }

        return {
          element: step.target,
          popover: popoverConfig,
        };
      });

      const config: Config = {
        showProgress: true,
        steps: driverSteps,
        allowClose: true,
        smoothScroll: true,
        onNextClick: (element, step, options) => {
          const currentDriverStep = driverRef.current?.getActiveIndex() ?? 0;
          const originalStep = steps[currentDriverStep];
          
          console.log('Next/OK button clicked on step:', currentDriverStep);

          if (originalStep?.data?.waitForInteraction) {
            console.log('Step requires interaction, marking as waiting and hiding tour');
            currentStepIndexRef.current = currentDriverStep;
            isWaitingForInteraction.current = true;
            
            if (driverRef.current) {
              driverRef.current.destroy();
            }
          } else {
            currentStepIndexRef.current = currentDriverStep;
            if (driverRef.current) {
              driverRef.current.moveNext();
            }
          }
        },
        onCloseClick: () => {
          const currentDriverStep = driverRef.current?.getActiveIndex() ?? 0;
          const originalStep = steps[currentDriverStep];

          console.log('Close button clicked on step:', currentDriverStep);

          if (originalStep?.data?.waitForInteraction) {
            console.log('Step requires interaction, marking as waiting');
            currentStepIndexRef.current = currentDriverStep;
            isWaitingForInteraction.current = true;
          }

          if (driverRef.current) {
            driverRef.current.destroy();
          }
          
          if (!originalStep?.data?.waitForInteraction) {
            onFinish?.();
            currentStepIndexRef.current = 0;
            isWaitingForInteraction.current = false;
          }
        },
        onDestroyed: () => {
          if (!isWaitingForInteraction.current) {
            onFinish?.();
            currentStepIndexRef.current = 0;
          }
        },
      };

      driverRef.current = driver(config);
      driverRef.current.drive();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [run, steps, delay, onFinish]);

  return { 
    continueDriver,
    stepIndex: currentStepIndexRef.current 
  };
}
