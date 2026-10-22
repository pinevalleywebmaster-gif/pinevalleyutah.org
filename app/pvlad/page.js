import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Pine Valley Local Administration District",
  description: "PVLAD’s mission, board contacts, meeting information, and public documents.",
};

export default function PvladPage() {
  return <CommunityPage bucket="pvlad" />;
}
