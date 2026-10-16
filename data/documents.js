// Paths mirror the folders under public/documents. Add or move topic mappings as the Drive tree evolves.
export const topicFolders = {
  pvssd: ["PVSSD", "2025 AUDIT REPORT", "Screenshot_"],
  pvlad: ["PVLAD"],
  "overlay-zone": ["Overlay Zone", "Overlay Ordinance", "PVOZ", "STR revisions"],
  pvhac: ["PVHAC", "Historical Advisory Committee", "Pine Valley Heritage Center", "Heritage"],
};

// Keep publicly approved static PDFs visible even before the first Drive sync runs.
export const topicDocuments = {
  pvssd: [],
  pvlad: [],
  "overlay-zone": [
    { title: "Final Overlay Ordinance July 2022", href: "/documents/Other%20Public%20Documents/Final%20Overlay%20Ordinance%20July%202022.pdf", folderTitle: "Overlay Zone", subtitle: "Pine Valley Overlay Zone ordinance · PDF" },
  ],
  pvhac: [],
};

export const featuredDocuments = {};

export const archivedDocuments = [
  { title: "Pine Valley Community Survey 2003", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20Survey%202003.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Historical community survey · PDF" },
  { title: "Pine Valley Community General Plan", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20General%20Plan.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Community planning · PDF" },
];
