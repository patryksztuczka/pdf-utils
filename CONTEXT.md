# PDF Util

PDF Util helps users assemble client-side PDF documents from pages they provide, with the PDF Organizer as the single primary workspace for page-level editing and export.

## Language

**PDF Organizer**:
The workspace where users assemble pages from one or more PDFs into the document outputs they need.
_Avoid_: Organized tool, organizer mode

**Assembly Workspace**:
A working set of imported PDF pages that can be mixed, reordered, rotated, grouped, and exported together.
_Avoid_: File list, merge queue

**Source PDF**:
An imported PDF file that contributes one or more pages to an **Assembly Workspace**.
_Avoid_: Attached file, upload

**Source Tray**:
A compact list of **Source PDFs** available to the **Assembly Workspace**.
_Avoid_: Merge queue, main file list

**Workspace Page**:
A page inside an **Assembly Workspace**, originating from exactly one page of exactly one **Source PDF**.
_Avoid_: PDF page when the distinction from the source file matters

**Page Group**:
A user-defined ordered selection of one or more **Workspace Pages** intended to be handled as a unit for preview or export.
_Avoid_: Part, selection, batch

**Workspace Item**:
A top-level item in the **Assembly Workspace** order, either one **Workspace Page** or one **Page Group**.
_Avoid_: Card when referring to domain behavior

**In-Place Ungrouping**:
Removing one or more **Workspace Pages** from a **Page Group** while preserving the surrounding **Assembly Workspace** order.
_Avoid_: Return to original position

**Workspace Removal**:
Removing a **Workspace Page** or **Workspace Item** from the current **Assembly Workspace** without removing its **Source PDF**.
_Avoid_: Delete source page

**Page Rotation**:
The orientation adjustment applied to a **Workspace Page** before export.
_Avoid_: Rotate the PDF

**Standalone Tool**:
A separate workflow dedicated to one narrow operation outside the **PDF Organizer**.
_Avoid_: Feature when referring to Merge PDF or Split PDF

## Relationships

- A **PDF Organizer** contains one **Assembly Workspace**
- PDF Util exposes the **PDF Organizer** as its primary user workflow
- PDF Util opens directly into the **PDF Organizer** instead of a multi-tool landing page
- An **Assembly Workspace** has one or more **Source PDFs**
- A **Source Tray** manages **Source PDFs** but is secondary to the **Assembly Workspace**
- A **Source PDF** contributes one or more **Workspace Pages**
- A **Workspace Page** originates from exactly one **Source PDF**
- A **Workspace Page** has its own stable identity; source file name and source page number are display metadata, not identity
- An **Assembly Workspace** is ordered by **Workspace Items**
- A **Workspace Item** is either one **Workspace Page** or one **Page Group**
- A **Workspace Page** may belong to zero or one **Page Group**
- A **Page Group** preserves the user's chosen **Workspace Page** order
- A **Page Group** is inspectable and editable; grouped **Workspace Pages** keep page-level actions such as rotate, reorder, remove, preview, and export
- **In-Place Ungrouping** uses the current **Assembly Workspace** order, not the original **Source PDF** order
- **Workspace Removal** affects only the current **Assembly Workspace**
- **Page Rotation** belongs to a **Workspace Page**, not to the whole **Source PDF**
- **Page Rotation** is reversible workspace state and does not mutate the original **Source PDF**
- The primary export from the **PDF Organizer** is the entire **Assembly Workspace** as one PDF, flattening **Page Groups** in workspace order
- Merge and split capabilities may exist inside the **PDF Organizer**, but not as separate **Standalone Tools**
- Removing a **Source PDF** removes its **Workspace Pages** from the **Assembly Workspace**

## Example Dialogue

> **Dev:** "When a user imports two contracts into the **PDF Organizer**, do we keep them separate?"
> **Domain expert:** "No — they enter one **Assembly Workspace** so the user can mix, rotate, group, and export **Workspace Pages** from both **Source PDFs**."

## Flagged Ambiguities

- "organize multiple PDFs" means assembling pages from multiple **Source PDFs** in one **Assembly Workspace**, not running separate single-PDF organizer sessions.
- "delete Merge/Split" means removing the separate **Standalone Tools** and their compatibility routes, not removing the user's ability to combine pages or export subsets from the **PDF Organizer**.
