// Categories come from the supplied outline; planning notes are not published facts.
export const communityBuckets = [
  { slug: "community-events", title: "Community Events", category: "Get involved", description: "Community activities, holiday flags, and ways to take part.", sections: [
    { title: "Activities & upcoming events", text: "No upcoming event notices have been posted here yet." },
    { title: "Get involved", text: "Interested in helping with community activities? Contact the website team to ask for the appropriate committee contact.", contact: "pine.valley.webmaster@gmail.com" },
    { title: "Holiday flags & donations", text: "Holiday flag program details and donation instructions have not been posted here yet." },
  ] },
  { slug: "community-watch", title: "Community Watch", category: "Stay connected", description: "Program information, community updates, and meeting notices.", sections: [
    { title: "About the program", text: "Community Watch program details and participation information have not been posted here yet." },
    { title: "Updates & meetings", text: "No Community Watch updates or meeting notices have been posted here yet." },
    { title: "Get involved", text: "Contact the website team to ask for the Community Watch contact.", contact: "pine.valley.webmaster@gmail.com" },
  ] },
  { slug: "fire-department", title: "Fire Department", category: "Serve your community", description: "Fire prevention, department updates, and volunteer information.", sections: [
    { title: "Fire prevention & FireWise", text: "Contact the fire department for information about local FireWise activities and fire prevention programs.", contact: "pinevalleyfirestation@gmail.com" },
    { title: "Training & department updates", text: "Training notices, department events, and monthly volunteer-hour reports have not been posted here yet." },
    { title: "Volunteer with the department", text: "For information about volunteering, contact Fire Chief Robert Hardy.", contact: "pinevalleyfirestation@gmail.com" },
  ] },
  { slug: "pvssd", title: "Pine Valley Special Service District", category: "PVSSD", description: "Board members, public meetings, district records, and fee inquiries." },
  { slug: "pvlad", title: "Pine Valley Local Administration District", category: "PVLAD", description: "District contacts, meeting information, and public documents.", sections: [
    { title: "About the district", text: "Find district representatives below. Contact the clerk with questions about district responsibilities or business.", contact: "rick.peetz@gmail.com" },
    { title: "Meetings & public documents", text: "A separate PVLAD meeting schedule has not been posted here. Contact the clerk to confirm meeting details and consult the public document repository for available notices and records.", href: "/public-documents/", label: "Browse public documents" },
  ] },
  { slug: "overlay-zone", title: "Pine Valley Overlay Zone", category: "Planning & preservation", description: "Planning background, ordinance inquiries, and documents for PVLAD review.", sections: [
    { title: "Background & community planning", text: "Pine Valley’s community planning materials provide background on development and historical preservation in the valley.", href: "/pvhac/", label: "Read the community planning background" },
    { title: "Overlay ordinance", text: "Consult the public document repository for available ordinances. Contact the district clerk to request the current Pine Valley Overlay Zone ordinance.", href: "/public-documents/", label: "Browse public documents", contact: "rick.peetz@gmail.com" },
    { title: "Documents for PVLAD review", text: "Contact the district clerk to confirm which documents are needed for your proposal and how to present them to PVLAD.", href: "/pvlad/", label: "View PVLAD contacts" },
  ] },
];

export const resourceLinks = [
  { label: "Public Documents", href: "/public-documents/" },
  { label: "Historical Advisory Committee", href: "/pvhac/" },
  { label: "Area Map & Recreation", href: "/area-map/" },
  { label: "Santa Clara River Water Data", href: "https://waterdata.usgs.gov/nwis/uv?site_no=09409100" },
];
