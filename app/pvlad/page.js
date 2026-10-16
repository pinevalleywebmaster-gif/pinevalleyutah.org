import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Pine Valley Local Administration District",
  description: "District contacts, meeting information, and public documents.",
};

export default function PvladPage() {
  return <CommunityPage bucket="pvlad" />;
}
