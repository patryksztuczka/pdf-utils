import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToolHeaderAction {
  label: string;
  onClick: () => void;
  icon?: any;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

interface ToolHeaderState {
  title: string;
  description: string;
  action?: ToolHeaderAction | null;
}

interface ToolHeaderContextType {
  state: ToolHeaderState;
  setHeader: (state: ToolHeaderState) => void;
  resetHeader: () => void;
}

const ToolHeaderContext = createContext<ToolHeaderContextType | undefined>(undefined);

export function ToolHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToolHeaderState>({
    title: '',
    description: '',
    action: null,
  });

  const setHeader = useCallback((newState: ToolHeaderState) => {
    setState(newState);
  }, []);

  const resetHeader = useCallback(() => {
    setState({ title: '', description: '', action: null });
  }, []);

  return (
    <ToolHeaderContext.Provider value={{ state, setHeader, resetHeader }}>
      {children}
    </ToolHeaderContext.Provider>
  );
}

export function useToolHeader() {
  const context = useContext(ToolHeaderContext);
  if (!context) {
    throw new Error('useToolHeader must be used within a ToolHeaderProvider');
  }
  return context;
}
