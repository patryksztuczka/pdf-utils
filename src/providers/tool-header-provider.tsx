import { useState, useCallback, type ReactNode } from 'react';
import { ToolHeaderContext, type ToolHeaderState } from './tool-header-context';

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
