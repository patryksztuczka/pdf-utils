import { BrowserRouter } from 'react-router-dom';
import { ToolHeaderProvider } from './tool-header-provider';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToolHeaderProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ToolHeaderProvider>
  );
}
