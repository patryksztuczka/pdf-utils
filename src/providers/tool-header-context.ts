import { createContext } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ToolHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export interface ToolHeaderState {
  title: string;
  description: string;
  action?: ToolHeaderAction | null;
}

export interface ToolHeaderContextType {
  state: ToolHeaderState;
  setHeader: (state: ToolHeaderState) => void;
  resetHeader: () => void;
}

export const ToolHeaderContext = createContext<ToolHeaderContextType | undefined>(undefined);
