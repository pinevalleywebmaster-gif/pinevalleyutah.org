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
  "community-events": [
    { title: "Halloween Trunk or Treat", href: "/documents/Community%20Events/halloween-trunk-or-treat.pdf", previewImage: "/images/community-events/halloween-trunk-or-treat.png" },
    { title: "Pine Valley Gardening Club · October", href: "/documents/Community%20Events/pine-valley-gardening-club-october.pdf", previewImage: "/images/community-events/pine-valley-gardening-club-october.png" },
  ],
};

export const archivedDocuments = [
  { title: "Pine Valley Community Survey 2003", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20Survey%202003.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Historical community survey · PDF" },
  { title: "Pine Valley Community General Plan", href: "/documents/Pine%20Valley%20Heritage%20Center/Pine%20Valley%20Community%20General%20Plan.pdf", folderTitle: "Historical Advisory Committee records", subtitle: "Community planning · PDF" },
];
