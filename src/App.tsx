import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeLayout } from "@/components/layout/home-layout";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Dashboard } from "@/components/dashboard";
import { MergeTool } from "@/components/merge-tool";
import { SplitTool } from "@/components/split-tool";
import { OrganizerTool } from "@/components/organizer-tool";
import { ToolHeaderProvider } from "@/hooks/use-tool-header";

export function App() {
  return (
    <ToolHeaderProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page Route */}
          <Route 
            path="/" 
            element={
              <HomeLayout>
                <Dashboard />
              </HomeLayout>
            } 
          />
          
          {/* Tool Routes */}
          <Route 
            path="/merge" 
            element={
              <ToolLayout>
                <MergeTool />
              </ToolLayout>
            } 
          />
          <Route 
            path="/split" 
            element={
              <ToolLayout>
                <SplitTool />
              </ToolLayout>
            } 
          />
          <Route 
            path="/organize" 
            element={
              <ToolLayout>
                <OrganizerTool />
              </ToolLayout>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToolHeaderProvider>
  );
}

export default App;
