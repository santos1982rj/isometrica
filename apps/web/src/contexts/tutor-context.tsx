'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { TutorModal } from '@/components/tutor/tutor-modal';

interface TutorContextType {
  openTutor: (pergunta?: string) => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pergunta, setPergunta] = useState('');

  const openTutor = useCallback((p?: string) => {
    setPergunta(p ?? '');
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
    setPergunta('');
  }, []);

  return (
    <TutorContext.Provider value={{ openTutor }}>
      {children}
      <TutorModal open={open} onClose={onClose} initialQuestion={pergunta} />
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error('useTutor must be used within TutorProvider');
  return ctx;
}
