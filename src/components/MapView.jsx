import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Phone, Navigation } from 'lucide-react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const goldIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const violetIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const orangeIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const yellowIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const greyIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const getCategoryIcon = (category, isCompleted) => {
  if (isCompleted) return greenIcon;

  const cat = category?.toLowerCase() || '';
  if (cat.includes('turf')) return greenIcon;
  if (cat.includes('football')) return blueIcon;
  if (cat.includes('swimming')) return violetIcon;
  if (cat.includes('hub') || cat.includes('club')) return goldIcon;
  if (cat.includes('cricket') || cat.includes('tennis') || cat.includes('hockey') || cat.includes('basketball') || cat.includes('volleyball')) return orangeIcon;
  if (cat.includes('school') || cat.includes('class') || cat.includes('badmitton')) return yellowIcon;
  if (cat.includes('academy')) return violetIcon;

  return greyIcon;
};

function MapResizer({ selectedItem }) {
  const map = useMap();

  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.lat, selectedItem.lng], 15, {
        duration: 1.2
      });
    }
  }, [selectedItem, map]);

  return null;
}

function SelectedMarker({ selectedItem, completedItems }) {
  const markerRef = React.useRef(null);

  useEffect(() => {
    if (selectedItem && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [selectedItem]);

  if (!selectedItem) return null;

  return (
    <Marker
      ref={markerRef}
      position={[selectedItem.lat, selectedItem.lng]}
      icon={redIcon}
      zIndexOffset={1000}
    >
      <Popup autoPan={false}>
        <div className="min-w-[180px]">
          <h3 className="font-bold text-slate-900 border-b pb-1 mb-1 text-sm">{selectedItem.Name}</h3>
          <p className="text-[11px] text-slate-600 mb-2 leading-tight">{selectedItem.Address}</p>
          <div className="flex flex-col gap-2 mt-2">
            {!completedItems.includes(selectedItem.id) && (
              <a
                href={`tel:${selectedItem.Phone}`}
                className="flex items-center justify-center gap-2 text-[10px] px-3 py-2 rounded-lg font-extrabold uppercase bg-white text-green-600 border border-green-600 hover:bg-green-50 transition-all no-underline shadow-sm"
              >
                <Phone size={12} />
                Call Now
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selectedItem.Name}, ${selectedItem.Address}, ${selectedItem.District}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[10px] px-3 py-2 rounded-lg font-extrabold uppercase bg-black text-white hover:bg-gray-900 transition-all no-underline shadow-sm"
            >
              <Navigation size={12} />
              Get Directions
            </a>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                {selectedItem.Category}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${completedItems.includes(selectedItem.id) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {completedItems.includes(selectedItem.id) ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function MapCenterer({ selectedDistrict, districts }) {
  const map = useMap();

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.name === selectedDistrict);
      if (district) {
        map.flyTo(district.center, 10, {
          duration: 1.5
        });
      }
    } else {
      map.flyTo([11.1271, 78.6569], 7, {
        duration: 1.5
      });
    }
  }, [selectedDistrict, map, districts]);

  return null;
}

const MapView = ({ items, selectedItem, onItemClick, completedItems, selectedDistrict, allDistricts }) => {
  const tamilNaduCenter = [11.1271, 78.6569];
  const clusterItems = items.filter(item => item.id !== selectedItem?.id);

  return (
    <MapContainer
      center={tamilNaduCenter}
      zoom={7}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <MapResizer selectedItem={selectedItem} />
      <MapCenterer selectedDistrict={selectedDistrict} districts={allDistricts} />
      <SelectedMarker selectedItem={selectedItem} completedItems={completedItems} />

      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
      >
        {clusterItems.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={getCategoryIcon(item.Category, completedItems.includes(item.id))}
            eventHandlers={{
              click: () => onItemClick(item),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-slate-900 border-b pb-1 mb-1">{item.Name}</h3>
                <p className="text-[11px] text-slate-600 mb-1 leading-tight">{item.Address}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {!completedItems.includes(item.id) ? (
                    <a
                      href={`tel:${item.Phone}`}
                      className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-md font-bold uppercase bg-white text-green-600 border border-green-600 no-underline"
                    >
                      <Phone size={10} />
                      Call
                    </a>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-green-100 text-green-700">
                      Done
                    </span>
                  )}
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                    {item.Category}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
