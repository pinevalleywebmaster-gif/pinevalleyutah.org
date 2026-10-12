// Paths mirror the folders under public/documents. Add or move topic mappings as the Drive tree evolves.
export const topicFolders = {
  pvssd: ["PVSSD"],
  pvlad: ["PVLAD"],
  "overlay-zone": ["Overlay Zone"],
  pvhac: ["Pine Valley Heritage Center", "Heritage"],
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
    { title: "Halloween Trunk or Treat", href: "/assets/halloween-trunk-or-treat.pdf", subtitle: "Community Activities · PDF" },
    { title: "Pine Valley Gardening Club · October", href: "/assets/pine-valley-gardening-club-october.pdf", subtitle: "Community Activities · PDF" },
  ],
};

export const archivedDocuments = [
  { title: "Pine Valley Community Survey 2003", href: "/assets/surveyfinal.pdf", folderTitle: "Pine Valley Heritage Center", subtitle: "Historical community survey · PDF" },
  { title: "Pine Valley Community General Plan", href: "/assets/pvgenplan.pdf", folderTitle: "Pine Valley Heritage Center", subtitle: "Community planning · PDF" },
];
