export const navigation = [
  { label: "Home", href: "/" },
  { label: "Santa Clara River Water Data", href: "https://waterdata.usgs.gov/nwis/uv?site_no=09409100" },
  { label: "PVSSD", href: "/pvssd/" },
  { label: "PVHAC", href: "/pvhac/" },
  { label: "Area Map", href: "/area-map/" },
  { label: "Public Documents", href: "/public-documents/" },
];

export const meetings = {
  district: "Meetings are held the first Wednesday of each month at the Pine Valley Fire Station at 6:00 pm.",
  access: "PVSSD meetings are open to the public. Please feel free to attend and share your thoughts on the subjects under discussion.",
  heritage: "The Pine Valley Heritage Center opens Memorial Day weekend and remains open until Labor Day. Hours are Monday through Saturday 10:00 to 6:00.",
};

export const districtGroups = [
  {
    title: "Board of Trustees",
    people: [
      { name: "Bob Dalley", role: "Chairman", email: "bob.dalley@pinevalleyutah.org" },
      { name: "Emily Nielson", role: "Vice Chairman", email: "emily.nielson@pinevalleyutah.org" },
      { name: "Allen Cannon", role: "Member", email: "allen.cannon@pinevalleyutah.org" },
      { name: "Mark Owens", role: "Member", email: "mark.owens@pinevalleyutah.org" },
      { name: "Steve Shakespeare", role: "Member", email: "steve.shakespeare@pinevalleyutah.org" },
    ],
  },
  {
    title: "District Staff",
    people: [
      { name: "Robert Hardy", role: "Fire Chief", email: "pinevalleyfirestation@gmail.com" },
      { name: "Rick Peetz", role: "Clerk", email: "rick.peetz@gmail.com" },
      { name: "Teri Forbes", role: "Treasurer", email: "tforbesgroup@hotmail.com" },
    ],
  },
  {
    title: "PV Local Administrative District",
    people: [
      { name: "Frank Davie", role: "Chairman", email: "frankernstdavie@gmail.com" },
      { name: "Tom Neilson", role: "Vice Chairman", email: "tnielsen714@gmail.com" },
      { name: "Bob Dalley", role: "Member", email: "bdalley37@gmail.com" },
      { name: "Emily Nielson", role: "Member", email: "etneilson@gmail.com" },
      { name: "Herman Nordbruch", role: "Member", email: "pakundo251@gmail.com" },
      { name: "Rick Peetz", role: "Clerk", email: "rick.peetz@gmail.com" },
      { name: "Teri Forbes", role: "Treasurer", email: "tforbesgroup@hotmail.com" },
    ],
  },
];

export const publicDocumentRepository = "https://drive.google.com/embeddedfolderview?id=13cYAubJBTUmxaBG4ED8RuQMQvNW9cBHF#list";

export const historicalDocuments = [
  { label: "Pine Valley Community Survey 2003", href: "/assets/surveyfinal.pdf" },
  { label: "Pine Valley Community General Plan", href: "/assets/pvgenplan.pdf" },
];

export const legacyRoutes = {
  "index.html": "/",
  "pine-valley-area-map.html": "/area-map/",
  "public-documents.html": "/public-documents/",
  "pvhac.html": "/pvhac/",
  "pvssd-board-of-trustees.html": "/pvssd/",
};
