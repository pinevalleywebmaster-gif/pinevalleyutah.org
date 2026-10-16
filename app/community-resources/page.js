import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Community Resources",
  description: "Helpful links for Pine Valley history, recreation, and local water data.",
};

export default function CommunityResourcesPage() {
  return <CommunityPage bucket="community-resources" />;
}
