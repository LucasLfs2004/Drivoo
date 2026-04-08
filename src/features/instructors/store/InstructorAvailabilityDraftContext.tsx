import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type {
  AvailabilityException,
  AvailabilityInterval,
  InstructorAvailabilityDraft,
} from '../types/availability';
import {
  createPrototypeAvailabilityDraft,
  normalizeWeeklyAvailability,
} from '../utils/availability';
import { useInstructorAvailabilityQuery } from '../hooks/useInstructorAvailabilityQuery';
import { useSaveInstructorAvailabilityMutation } from '../hooks/useInstructorAvailabilityMutations';

type InstructorAvailabilityDraftContextValue = {
  draft: InstructorAvailabilityDraft;
  initialDraft: InstructorAvailabilityDraft;
  hasChanges: boolean;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  updateDay: (day: number, intervals: AvailabilityInterval[]) => void;
  upsertException: (exception: AvailabilityException) => void;
  removeException: (exceptionId: string) => void;
  saveAllChanges: () => Promise<void>;
  discardChanges: () => void;
  refetch: () => Promise<unknown>;
};

const InstructorAvailabilityDraftContext =
  createContext<InstructorAvailabilityDraftContextValue | null>(null);

const serializeDraft = (draft: InstructorAvailabilityDraft) => JSON.stringify(draft);

export const InstructorAvailabilityDraftProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useInstructorAvailabilityQuery();
  const saveMutation = useSaveInstructorAvailabilityMutation();
  const [initialDraft, setInitialDraft] = useState<InstructorAvailabilityDraft>(
    createPrototypeAvailabilityDraft()
  );
  const [draft, setDraft] = useState<InstructorAvailabilityDraft>(initialDraft);
  const [hasHydratedFromApi, setHasHydratedFromApi] = useState(false);

  const hasChanges = useMemo(
    () => serializeDraft(draft) !== serializeDraft(initialDraft),
    [draft, initialDraft]
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    if (!hasHydratedFromApi || !hasChanges) {
      setInitialDraft(data);
      setDraft(data);
      setHasHydratedFromApi(true);
    }
  }, [data, hasChanges, hasHydratedFromApi]);

  const value = useMemo<InstructorAvailabilityDraftContextValue>(
    () => ({
      draft,
      initialDraft,
      hasChanges,
      isLoading,
      isError,
      isSaving: saveMutation.isPending,
      updateDay: (day, intervals) => {
        setDraft(current => ({
          ...current,
          weekly: normalizeWeeklyAvailability({
            ...current.weekly,
            [day]: intervals,
          }),
        }));
      },
      upsertException: exception => {
        setDraft(current => {
          const nextExceptions = current.exceptions.filter(item => item.id !== exception.id);
          nextExceptions.push(exception);

          return {
            ...current,
            exceptions: nextExceptions.sort((left, right) =>
              left.date.localeCompare(right.date)
            ),
          };
        });
      },
      removeException: exceptionId => {
        setDraft(current => ({
          ...current,
          exceptions: current.exceptions.filter(item => item.id !== exceptionId),
        }));
      },
      saveAllChanges: async () => {
        await saveMutation.mutateAsync({
          draft,
          initialDraft,
        });
        setInitialDraft(draft);
      },
      discardChanges: () => {
        setDraft(initialDraft);
      },
      refetch,
    }),
    [draft, initialDraft, hasChanges, isLoading, isError, saveMutation, refetch]
  );

  return (
    <InstructorAvailabilityDraftContext.Provider value={value}>
      {children}
    </InstructorAvailabilityDraftContext.Provider>
  );
};

export const useInstructorAvailabilityDraft = () => {
  const context = useContext(InstructorAvailabilityDraftContext);

  if (!context) {
    throw new Error('useInstructorAvailabilityDraft must be used within its provider');
  }

  return context;
};
