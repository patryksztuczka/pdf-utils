import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeLayout } from "@/components/layout/home-layout";
import { ToolLayout } from "@/components/layout/tool-layout";
import { LandingPage } from "@/components/landing/landing-page";
import { MergeTool } from "@/components/merge/merge-tool";
import { SplitTool } from "@/components/split/split-tool";
import { OrganizerTool } from "@/components/organizer/organizer-tool";
import { Providers } from "@/providers";

export function App() {
  return (
    <Providers>
      <Routes>
        {/* Landing Page Route */}
        <Route 
          path="/" 
          element={
            <HomeLayout>
              <LandingPage />
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
    </Providers>
  );
}

export default App;
