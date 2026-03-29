export interface Location {
  id: string;
  label: string;
  display: string;
  address: string;
  query: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}

export const locations: Location[] = [
  {
    id: "map-ues",
    label: "Upper East Side",
    display: "Upper East Side: 159 East 74th St",
    address: "159 East 74th St, New York, NY",
    query: "159+East+74th+Street+New+York+NY",
    lat: 40.772,
    lng: -73.9615,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=159+East+74th+Street+New+York+NY",
  },
  {
    id: "map-wv",
    label: "West Village",
    display: "Greenwich Village: 200 West 13th St",
    address: "200 West 13th St, New York, NY",
    query: "200+West+13th+Street+New+York+NY",
    lat: 40.7375,
    lng: -73.999,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=200+West+13th+Street+New+York+NY",
  },
  {
    id: "map-bk",
    label: "Brooklyn",
    display: "Brooklyn Heights: 161 Atlantic Ave",
    address: "161 Atlantic Ave, Brooklyn, NY",
    query: "161+Atlantic+Avenue+Brooklyn+NY",
    lat: 40.686,
    lng: -73.987,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=161+Atlantic+Avenue+Brooklyn+NY",
  },
];
