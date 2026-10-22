// Paths mirror the folders under public/documents. Add or move topic mappings as the Drive tree evolves.
export const topicFolders = {
  pvssd: ["PVSSD", "2025 AUDIT REPORT", "Screenshot_"],
  pvlad: ["PVLAD"],
  "overlay-zone": ["Overlay Zone", "Overlay Ordinance", "PVOZ", "STR revisions"],
};

// Keep publicly approved static PDFs visible even before the first Drive sync runs.
export const topicDocuments = {
  pvssd: [],
  pvlad: [],
  "overlay-zone": [
    { title: "Final Overlay Ordinance July 2022", href: "/documents/Other%20Public%20Documents/Final%20Overlay%20Ordinance%20July%202022.pdf", folderTitle: "Overlay Zone", subtitle: "Pine Valley Overlay Zone ordinance · PDF" },
  ],
};

export const featuredDocuments = {};
