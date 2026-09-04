export const metadata = { title: "Area Map" };

const forestServiceUrl = "https://www.fs.usda.gov/recarea/dixie/recreation/camping-cabins/recarea/?recid=24782&actid=101";

export default function AreaMapPage() {
  return <section><h1>Pine Valley Area Map</h1><p>Explore the Pine Valley area’s Forest Service campgrounds and recreational opportunities.</p><ul className="document-list"><li><a href="https://pinevalleyutah.org/wp-content/uploads/2015/03/pvrecmap-300x291.png">Open the Pine Valley recreation area map</a></li><li><a href={forestServiceUrl}>View Pine Valley recreation information from the U.S. Forest Service</a></li></ul></section>;
}
