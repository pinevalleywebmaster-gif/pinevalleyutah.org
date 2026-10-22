import { CommunityPage } from "../../components/community-page";

export const metadata = {
  title: "Pine Valley Overlay Zone",
  description: "How the Pine Valley Overlay Zone protects the valley’s rural, historical, and mountain village character.",
};

export default function OverlayZonePage() {
  return <CommunityPage bucket="overlay-zone" />;
}
