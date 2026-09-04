import "./globals.css";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: { default: "Pine Valley Utah", template: "%s | Pine Valley Utah" },
  description: "Official community information and public resources for Pine Valley, Utah.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><SiteHeader /><main id="main-content" className="content-width">{children}</main><SiteFooter /></body></html>;
}
