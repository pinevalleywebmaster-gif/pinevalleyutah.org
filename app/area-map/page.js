import { PageIntro } from "../../components/page-intro";
import { ResourceList } from "../../components/resource-list";

export const metadata = { title: "Area Map" };

const resources = [
  {
    label: "Open the Pine Valley recreation area map",
    href: "https://pinevalleyutah.org/wp-content/uploads/2015/03/pvrecmap-300x291.png",
  },
  {
    label: "View Pine Valley recreation information from the U.S. Forest Service",
    href: "https://www.fs.usda.gov/recarea/dixie/recreation/camping-cabins/recarea/?recid=24782&actid=101",
  },
];

export default function AreaMapPage() {
  return (
    <section>
      <PageIntro
        title="Pine Valley Area Map"
        description="Explore the Pine Valley area’s Forest Service campgrounds and recreational opportunities."
      />
      <ResourceList resources={resources} />
    </section>
  );
}
