import { MoreHorizontal, Share2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const RECENT_FILES = [
  { name: "Project-Proposal.pdf", date: "2 mins ago", size: "2.4 MB", owner: "You" },
  { name: "Invoice-Oct-2023.pdf", date: "2 hours ago", size: "102 KB", owner: "Finance Team" },
  { name: "Design-System-v2.pdf", date: "Yesterday", size: "14.2 MB", owner: "Design Lead" },
  { name: "Contract-Draft-Final.pdf", date: "24 Oct 2023", size: "450 KB", owner: "Legal" },
  { name: "Meeting-Notes-Q3.pdf", date: "20 Oct 2023", size: "1.1 MB", owner: "You" },
];

export function RecentFiles() {
  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-neutral-100 dark:border-neutral-800 flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-6 border-b border-neutral-50 dark:border-neutral-900 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Files</h2>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="h-8 rounded-full px-4 text-xs font-semibold border-neutral-200 dark:border-neutral-800">
             Filter
           </Button>
           <Button size="sm" className="h-8 rounded-full px-4 text-xs font-semibold shadow-lg shadow-primary/20">
             View All
           </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-900">
              <th className="pb-4 pl-4 font-bold">File Name</th>
              <th className="pb-4 font-bold">Owner</th>
              <th className="pb-4 font-bold">Date</th>
              <th className="pb-4 font-bold">Size</th>
              <th className="pb-4 pr-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
            {RECENT_FILES.map((file, i) => (
              <tr key={i} className="group hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors">
                <td className="py-3 pl-4">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                       <FileText className="h-5 w-5" />
                     </div>
                     <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-200 group-hover:text-primary transition-colors">{file.name}</span>
                   </div>
                </td>
                <td className="py-3 text-sm text-neutral-500 font-medium">{file.owner}</td>
                <td className="py-3 text-sm text-neutral-500">{file.date}</td>
                <td className="py-3 text-sm text-neutral-500">{file.size}</td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
