// Paths mirror the folders under public/documents. Add or move topic mappings as the Drive tree evolves.
export const topicFolders = {
  pvssd: ["PVSSD", "2025 AUDIT REPORT", "Screenshot_"],
  pvlad: ["PVLAD"],
  "overlay-zone": ["Overlay Zone", "Overlay Ordinance", "PVOZ", "STR revisions"],
  pvhac: ["PVHAC", "Historical Advisory Committee", "Pine Valley Heritage Center", "Heritage"],
  "community-events": ["Community Events"],
};

// Keep publicly approved static PDFs visible even before the first Drive sync runs.
export const topicDocuments = {
  pvssd: [],
  pvlad: [],
  "overlay-zone": [],
  pvhac: [],
};

export const featuredDocuments = {
  "community-events": [],
};

export const archivedDocuments = [
  { title: "Pine Valley Community Survey 2003", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20Survey%202003.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Historical community survey · PDF" },
  { title: "Pine Valley Community General Plan", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20General%20Plan.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Community planning · PDF" },
];
