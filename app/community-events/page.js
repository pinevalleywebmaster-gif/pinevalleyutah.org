import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Community Activities",
  description: "Community activities, holiday flags, and ways to take part.",
};

export default function CommunityEventsPage() {
  return <CommunityPage bucket="community-events" />;
}
