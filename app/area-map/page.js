export const metadata = { title: "Area Map" };

const forestServiceUrl = "https://www.fs.usda.gov/recarea/dixie/recreation/camping-cabins/recarea/?recid=24782&actid=101";

export default function AreaMapPage() {
  return <section><h1>Pine Valley Area Map</h1><p>Map of the Pine Valley area showing Forest Service campgrounds and recreational opportunities.</p><a className="map-link" href={forestServiceUrl}><img src="https://pinevalleyutah.org/wp-content/uploads/2015/03/pvrecmap-300x291.png" alt="Pine Valley recreation area map" width="670" height="650" /><span>View Pine Valley recreation information from the U.S. Forest Service</span></a></section>;
}
