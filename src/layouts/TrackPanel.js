import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Navbar, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Media} from 'reactstrap';
import { MapContainer, TileLayer, Marker, Popup , useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/MapsStyle.css';
import L from 'leaflet';
import 'leaflet-routing-machine';


import containerIconUrl from '../assets/img/icons/container.png';

const containerIcon = new L.Icon({
  iconUrl: containerIconUrl,
  iconSize: [25, 25], // Adjust size of the container icon
  iconAnchor: [16, 32], // Anchor point of the icon
  popupAnchor: [0, -32], // Position of the popup relative to the icon
});
// Delete default icon settings for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RoutingControl = ({ truckLocation, targetLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!truckLocation || !targetLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(truckLocation.latitude, truckLocation.longitude),
        L.latLng(targetLocation.latitude, targetLocation.longitude),
      ],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#3388ff', weight: 5 }],
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, truckLocation, targetLocation]);

  return null;
};
const TrackPanel = () => {
  // State for tracking the current location
  const [currentLocation, setCurrentLocation] = useState({ latitude: 35.5418, longitude: 35.7988 });
  const [containers, setContainers] = useState([]);
  const [selectedContainer,setSelectedContainer]=useState([])
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Define the API URL for the truck data

  // Function to fetch and update the user's current location
  const fetchContainers = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/containers/`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الحاويات');
      }
      const data = await response.json();
      setContainers(data); // Set the containers data
    } catch (error) {
      console.error('حدث خطأ أثناء جلب الحاويات:', error);
    }
  };
  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Latitude:', latitude, 'Longitude:', longitude);
          setCurrentLocation({ latitude, longitude });

          // Call the function to update the backend with the current coordinates
          updateTruckLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(`Error getting location: ${error.message} (Code: ${error.code})`);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      );
      // Optionally clear the watch when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.');
      alert('Geolocation is not supported by this browser.');
    }
  };


  // Function to update truck location on the backend via a PUT request
  const updateTruckLocation = async (latitude, longitude) => {
    const id=localStorage.getItem('truck_id')
    try {
      const response = await axios.patch(`${backendUrl}/Staff/trucks/${id}`, {
        Longitude_M: longitude, // Update longitude
        Latitude_M: latitude,   // Update latitude
        on_trip: true // Optionally, set additional data like "on_trip" status
      });
      console.log('Truck location updated:', response.data);
    } catch (error) {
      console.error('Error updating truck location:', error);
    }
  };

  // Fetch location when the component mounts
  useEffect(() => {
    fetchCurrentLocation();
    fetchContainers();
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    // Implement your logout logic here (clear authentication tokens, etc.)
    
    try {
        console.log('Logging out...');
        
        const response = await axios.put(backendUrl, {
          Longitude_M: 0, 
          Latitude_M: 0,  
          on_trip: false 
        });
        console.log('Truck location updated:', response.data);
      } catch (error) {
        console.error('Error updating truck location:', error);
      }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('truck_id');
    window.location.href = '/login';
  };
  // const handleContainerClick =  (container) => {
  //   setSelectedContainer({
  //     latitude: container.Latitude_M,
  //     longitude: container.Longitude_M,
  //   });
  // };

  return (
    <>
      {/* Header with Dropdown */}
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <UncontrolledDropdown nav style={{ marginRight: 'auto' }}>
            <DropdownToggle className="pl-0" nav>
              <Media className="align-items-center">
                <i className="ni ni-button-power" />
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow dropdown-menu-custom">
              <DropdownItem href="#pablo" onClick={(e) => {
                e.preventDefault();
                handleLogout(); // Call handleLogout on click
              }}>
                <span>تسجيل الخروج</span>
                <i className="ni ni-user-run" />
              </DropdownItem>
              <DropdownItem href="#pablo" onClick={(e) => {
                e.preventDefault();
                handleLogout(); // Call handleLogout on click
              }}>
                <span>إضافة شكوى</span>
                <i className="ni ni-notification-70" />
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Container>
      </Navbar>

      <Container className="map-container" style={{ position: 'relative', paddingTop: '60px' }}>
        <MapContainer
          center={[currentLocation.latitude, currentLocation.longitude]}
          zoom={13}
          style={{
            height: 'calc(100vh - 60px)', // Adjust height to fit below the header
            width: '100%',
            border: '2px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {containers.map(container => (
            <Marker
              key={container.id}
              position={[container.Latitude_M, container.Longitude_M]}
              icon={containerIcon} // Use container icon
              eventHandlers={{
                click: () => setSelectedContainer({
                      latitude: container.Latitude_M,
                      longitude: container.Longitude_M,
                    }),
              }}
            >
              <Popup>
                {`المعرف: ${container.id}، ملاحظات: ${container.Remarks || 'لا توجد ملاحظات'}`}
              </Popup>
            </Marker>
          ))}
          {/* Display a marker at the current location */}
          {currentLocation.latitude !== 0 && currentLocation.longitude !== 0 && (
            <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
              <Popup>
                موقعك : خط العرض {currentLocation.latitude}, خط الطول {currentLocation.longitude}
              </Popup>
            </Marker>
          )}
          {selectedContainer && (
            <RoutingControl
              truckLocation={currentLocation}
              targetLocation={selectedContainer}
            />
          )}
       
        </MapContainer>
      </Container>
      

      {/* Inline CSS styles for the dropdown arrow */}
      <style>
        {`
          .dropdown-menu-custom:before {
            background: #fff;
            box-shadow: none;
            content: "";
            display: block;
            height: 12px;
            width: 12px;
            left: 20px; /* Adjust as needed */
            position: absolute;
            bottom: 100%;
            transform: rotate(-45deg) translateY(12px);
            z-index: -5;
            border-radius: 2px;
          }
        `}
      </style>
    </>
  );
};

export default TrackPanel;
