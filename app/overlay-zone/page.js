import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Pine Valley Overlay Zone",
  description: "Planning background, ordinance inquiries, and documents for PVLAD review.",
};

export default function OverlayZonePage() {
  return <CommunityPage bucket="overlay-zone" />;
}
