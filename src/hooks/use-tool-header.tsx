import { useContext } from 'react';
import { ToolHeaderContext } from '@/providers/tool-header-context';

export function useToolHeader() {
  const context = useContext(ToolHeaderContext);
  if (!context) {
    throw new Error('useToolHeader must be used within a ToolHeaderProvider');
  }
  return context;
}
