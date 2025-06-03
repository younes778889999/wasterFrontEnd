import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Container, Navbar, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Media, Alert } from 'reactstrap';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/MapsStyle.css';
import L from 'leaflet';

import truckIconUrl from '../assets/img/icons/truck.png';
import containerIconUrl from '../assets/img/icons/container.png';
import landfillIconUrl from '../assets/img/icons/landfill.png';
import alertsound from '../assets/sounds/alert.mp3';


const backendUrl = process.env.REACT_APP_BACKEND_URL;
const truckId = localStorage.getItem('truck_id');


const haversineDistance = (coords1, coords2) => {
  const R = 6371e3;
  const φ1 = coords1.latitude * Math.PI/180;
  const φ2 = coords2.latitude * Math.PI/180;
  const Δφ = (coords2.latitude-coords1.latitude) * Math.PI/180;
  const Δλ = (coords2.longitude-coords1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const containerIcon = new L.Icon({
  iconUrl: containerIconUrl,
  iconSize: [25, 25],  
  iconAnchor: [12.5, 25],
  popupAnchor: [0, -25], 
});

const landfillIcon = new L.Icon({
  iconUrl: landfillIconUrl,
  iconSize: [25, 25],  
  iconAnchor: [12.5, 25],
  popupAnchor: [0, -25],
});


const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

function playAlertRepeatedly(times = 3) {
  const audio = new Audio(alertsound);
  let count = 0;

  audio.addEventListener('ended', () => {
    count++;
    if (count < times) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('Playback failed:', err));

    }
  });

  audio.play().catch(err => console.error('Playback failed:', err));

};


const initializeAudio = () => {
  const audio = new Audio(alertsound);
  audio.volume = 0; // Silent playback
  return audio.play()
    .then(() => true)
    .catch(err => {
      console.log('Audio permission needed');
      return false;
    });
};

const AudioPermissionHandler = ({ setPermissionGranted }) => {
  const [onTrip, setOnTrip] = useState(false);

  useEffect(() => {
    fetch(`${backendUrl}/Staff/trucks/${truckId}`)
      .then(res => res.json())
      .then(data => {
        setOnTrip(data?.on_trip === true);
      })
      .catch(err => {
        console.error('Error fetching trip data:', err);
        setOnTrip(false);
      });
  }, [truckId]);

  useEffect(() => {
    if (onTrip) {
      initializeAudio().then(success => {
        if (!success) {
          const handleFirstInteraction = () => {
            initializeAudio().finally(() => {
              setPermissionGranted(true);
              document.removeEventListener('click', handleFirstInteraction);
            });
          };
          document.addEventListener('click', handleFirstInteraction);
        } else {
          setPermissionGranted(true);
        }
      });
    }
  }, [onTrip, setPermissionGranted]);

  const handleStartTrip = async () => {
    const now = new Date().toISOString();

    try {
      // First update the truck status
      await fetch(`${backendUrl}/Staff/trucks/${truckId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          on_trip: true,
        }),
      });

      // Then get the trip data
      const response = await fetch(`${backendUrl}/Staff/trips/by-truck/${truckId}`);
      const tripData = await response.json();
      
      if (tripData.length > 0) {
        const tripId = tripData[0].id;
        // Update the trip with start date
        await fetch(`${backendUrl}/Staff/trips/${tripId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Start_Date: now,
          }),
        });
      }

      setOnTrip(true);
      setPermissionGranted(true);
    } catch (err) {
      console.error('Error starting trip:', err);
    }
  };

  if (!onTrip) {
  return (
      <div 
        className="audio-permission-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
        }}
      >
        <button
          onClick={handleStartTrip}
          style={{
            padding: '15px 30px',
            fontSize: '1.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            ':hover': {
              backgroundColor: '#45a049',
              transform: 'scale(1.05)'
            }
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          إضغط هنا لبدأ الرحلة
        </button>
      </div>
    );
  }

  return (
    <div 
      className="audio-permission-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
    >
      <button
        onClick={() => initializeAudio().then(setPermissionGranted)}
        style={{
          padding: '15px 30px',
          fontSize: '1.5rem',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          ':hover': {
            backgroundColor: '#0b7dda',
            transform: 'scale(1.05)'
          }
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b7dda'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
      >
        إضغط هنا لتمكين الصوت
      </button>
    </div>
  );
};


const TrackPanel = () => {
  const [trip, setTrip] = useState(null);
  const [containers, setContainers] = useState([]);
  const [landfill, setLandfill] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [path, setPath] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState({});
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  const initialCheckDone = useRef(false);
  const checkTimeout = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  

  const trackingIntervalRef = useRef(null);

  
  const prevLocation = usePrevious(currentLocation);
  const alertTimeoutRef = useRef({});
  const pathCache = useRef(new Map());
  const backupInterval = useRef(null);


const dynamicIcon = new L.Icon({
  iconUrl: truckIconUrl,
  iconSize: trip?.Deviated ? [30, 30] : [25, 25],
  iconAnchor: trip?.Deviated ? [15, 30] : [12.5, 25],
  popupAnchor: [0, trip?.Deviated ? -30 : -25],
  className: trip?.Deviated ? 'deviated-truck' : '',
});
  useEffect(() => {
    return () => {
      if (checkTimeout.current) clearTimeout(checkTimeout.current);
      Object.values(alertTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const startTrackingPath = () => {
    if (!localStorage.getItem('path')) {
      localStorage.setItem('path', JSON.stringify([]));
    }
  
    const accuracyThreshold = 30; // meters
  
    const tryGetAccuratePosition = (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { accuracy, latitude, longitude } = position.coords;
  
          if (accuracy <= accuracyThreshold) {
            const timestamp = new Date().toISOString();
            const newPoint = { timestamp, latitude, longitude };
  
            const existingPath = JSON.parse(localStorage.getItem('path') || '[]');
            existingPath.push(newPoint);
            localStorage.setItem('path', JSON.stringify(existingPath));
  
            console.log("✅ Accurate coordinate logged:", newPoint);
            resolve(); // finish one cycle
          } else {
            console.warn(`⚠️ Inaccurate coords (accuracy: ${accuracy}m). Retrying...`);
            // Retry after short delay (e.g., 3 sec)
            setTimeout(() => tryGetAccuratePosition(resolve, reject), 3000);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          // Retry after short delay
          setTimeout(() => tryGetAccuratePosition(resolve, reject), 3000);
        },
        { enableHighAccuracy: true } // request best possible accuracy
      );
    };
  
    const collectCoordinates = () => {
      return new Promise((resolve, reject) => {
        tryGetAccuratePosition(resolve, reject);
      });
    };
  
    // Run the first one immediately
    collectCoordinates();
  
    // Run every 1 minute
    trackingIntervalRef.current = setInterval(() => {
      collectCoordinates();
    }, 60 * 1000);
  }
  const stopTrackingPath = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
  };

  useEffect(() => {
    startTrackingPath();

    // Stop tracking when component unmounts
    return () => stopTrackingPath();
  }, []);
const updateAlert = (isDeviated) => {
  console.log("Call the alert");
  // Clear previous deviation alert if recovering
  if (!isDeviated) {
    Object.entries(activeAlerts).forEach(([id, alert]) => {
      if (alert.isDeviated) {
        clearTimeout(alertTimeoutRef.current[id]);
        delete alertTimeoutRef.current[id];
        setActiveAlerts(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    });
  }
  

  const alertId = `alert-${Date.now()}`;
  
  setActiveAlerts(prev => ({
    ...prev,
    [alertId]: {
      message: isDeviated 
        ? 'شاحنتك انحرفت عن المسار' 
        : 'شاحنتك عادت للمسار',
      isDeviated,
      persistent: isDeviated // Add persistent flag
    }
  }));

  // Only set timeout for non-deviated (recovery) alerts
  if (!isDeviated) {
    alertTimeoutRef.current[alertId] = setTimeout(() => {
      setActiveAlerts(prev => {
        const updated = { ...prev };
        delete updated[alertId];
        return updated;
      });
    }, 5000);
  }

  if (isDeviated) playAlertRepeatedly(3);
};


  const renderAlerts = () => {
    return Object.entries(activeAlerts).map(([id, alert]) => (
      <div
        key={id}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 10000, // Higher than map's z-index
          padding: '15px',
          borderRadius: '8px',
          background: alert.isDeviated ? '#ff4444' : '#00C851',
          color: 'white',
          fontSize: '1.2rem',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.5s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          display: alert.persistent ? 'flex' : 'none' // Hide if not persistent
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>
          {alert.isDeviated ? '⚠️' : '✅'}
        </span>
        {alert.message}
        <button
          onClick={() => {
            setActiveAlerts(prev => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            });
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0 8px',
            fontSize: '1.4rem'
          }}
        >
          ×
        </button>
      </div>
    ));
  };



const CenterMap = ({ currentLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation) {
      map.setView(
        [currentLocation.latitude, currentLocation.longitude],
        map.getZoom()
      );
    }
  }, [currentLocation, map]);

  return null;
};


  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;
    if (param < 0) [xx, yy] = [x1, y1];
    else if (param > 1) [xx, yy] = [x2, y2];
    else [xx, yy] = [x1 + param * C, y1 + param * D];

    return Math.sqrt((x - xx) ** 2 + (y - yy) ** 2) * 111320;
  };

  const distanceToPath = (point, path) => {
    return path.slice(0, -1).reduce((min, [x1, y1], i) => {
      const [x2, y2] = path[i + 1];
      return Math.min(min, pointToLineDistance(point, [x1, y1], [x2, y2]));
    }, Infinity);
  };

 

  const updateTripStatus = async (deviated, distance) => {
    try {
      await axios.patch(`${backendUrl}/Staff/trips/${trip.id}`, {
        Deviated: deviated,
      });
      
      const { data } = await axios.get(`${backendUrl}/Staff/trips/${trip.id}`);
      setTrip(data);
      return data;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  const fetchOptimalPath = async (waypoints, retries = 3) => {
    setIsCalculatingPath(true);
    try {
      const cacheKey = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('|');
      if (pathCache.current.has(cacheKey)) {
        return pathCache.current.get(cacheKey);
      }

      const coordinates = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
      const { data } = await axios.get(
        `https://router.project-osrm.org/trip/v1/driving/${coordinates}` +
                `?overview=full&geometries=geojson&steps=true` +
                `&source=first&destination=last&roundtrip=false`
      );

      const newPath = data.trips[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      pathCache.current.set(cacheKey, newPath);
      return newPath;
    } catch (error) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchOptimalPath(waypoints, retries - 1);
      }
      return waypoints;
    } finally {
      setIsCalculatingPath(false);
    }
  };

const checkDeviations = useCallback(async (initialCheck = false) => {
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    
    checkTimeout.current = setTimeout(async () => {
      console.log("Running deviation check");
      if (!trip || !path.length || !currentLocation) return;
      
      const currentPos = [currentLocation.latitude, currentLocation.longitude];
      const distance = distanceToPath(currentPos, path);

      console.log('[Deviation] Distance:', distance.toFixed(2), 'meters');
      
      const wasDeviated = trip.Deviated;
      const shouldAlert = distance > 50 || (distance <= 50 && wasDeviated);

      if (initialCheck) {
        if (distance > 50) {
          console.log('Initial deviation detected');
          await updateTripStatus(true, distance);
          updateAlert(true);
        }
        return;
      }

      if (shouldAlert) {
        console.log('State change detected:', distance > 50 ? 'DEVIATED' : 'RECOVERED');
        try {
          const newDeviatedState = distance > 50;
          await updateTripStatus(newDeviatedState, distance);
          updateAlert(newDeviatedState);
        } catch (error) {
          console.error('Update failed:', error);
        }
      }
    }, initialCheck ? 0 : 5000);
  }, [trip, path, currentLocation, updateTripStatus, updateAlert]);


   const updateTruckLocation = async (latitude, longitude) => {
    const id=localStorage.getItem('truck_id')
    await axios.patch(`${backendUrl}/Staff/trucks/${id}`, {
        Longitude_M: longitude,
        Latitude_M: latitude, 
      });
  };


  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    const ACCURACY_THRESHOLD = 35; 

    const watchId = navigator.geolocation.watchPosition(
      position => {
        const newCoords = position.coords;
        if (newCoords.accuracy <= ACCURACY_THRESHOLD) {
        if (!currentLocation || haversineDistance(currentLocation, newCoords) > 5) {
          setCurrentLocation(newCoords);
          updateTruckLocation(newCoords.latitude, newCoords.longitude);
          }
        }
      },
      error => setLocationError(error.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 1000 }
    );

    backupInterval.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newCoords = position.coords;
if (newCoords.accuracy <= ACCURACY_THRESHOLD) {
          if (!currentLocation || haversineDistance(currentLocation, newCoords) > 5) {
            setCurrentLocation(newCoords);
            updateTruckLocation(newCoords.latitude, newCoords.longitude);
          }}
        },
        error => setLocationError(error.message))
    }, 2000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(backupInterval.current);
    };
  }, [currentLocation]);


useEffect(() => {
    if (!prevLocation || !currentLocation) return;
    
    const positionChanged = 
      prevLocation.latitude !== currentLocation.latitude ||
      prevLocation.longitude !== currentLocation.longitude;

    if (positionChanged) {
      checkDeviations();
    }
  }, [currentLocation, checkDeviations, prevLocation]);

useEffect(() => {
    if (trip && path.length > 0 && currentLocation && !initialCheckDone.current) {
      checkDeviations(true);
      initialCheckDone.current = true;
    }
  }, [trip, path, currentLocation, checkDeviations]);

  useEffect(() => {
    if (!truckId) {
      setLocationError('لم يتم تحديد شاحنة!');
      return;
    }

    const fetchTrip = async () => {
    if (!permissionGranted) return;
      try {
        const { data } = await axios.get(`${backendUrl}/Staff/trips/by-truck/${truckId}`);
        data.length && setTrip(data[0]);
      } catch (error) { 
        console.error('Trip fetch error:', error);
        setLocationError('فشل تحميل بيانات الرحلة');
      }
    };
    fetchTrip();
}, [permissionGranted, truckId]);

  useEffect(() => {
    if (!trip) return;
    
    const fetchResources = async () => {
      if (!permissionGranted) return;


      try {
        const [containersRes, landfillRes] = await Promise.all([
          axios.get(`${backendUrl}/Staff/containers/`),
          axios.get(`${backendUrl}/Staff/landfills/${trip.Landfill}`)
        ]);
        
        setContainers(containersRes.data.filter(c => trip.container_set.includes(c.id)));
        setLandfill(landfillRes.data);
      } catch (error) { 
        console.error('Resource fetch error:', error);
        setLocationError('فشل تحميل بيانات الموارد');
      }
    };
    fetchResources();
  }, [permissionGranted, trip]);

  const handleEndTripAndLogout = async () => {
    try {
      const now = new Date();
      const startDate = new Date(trip.Start_Date);
      const durationMinutes = Math.round((now - startDate) / (1000 * 60));
  
      // 1. Patch the trip with duration
      await axios.patch(`${backendUrl}/Staff/trips/${trip.id}`, {
        Duration_min: durationMinutes
      });
  
      const truckId = trip.truck; // Assuming trip.Truck contains truck id
  
      // 2. Fetch truck data
      const truckRes = await axios.get(`${backendUrl}/Staff/trucks/${truckId}`);
      const truck = truckRes.data;
  
      // 3. Fetch driver info (assuming truck.Driver contains driver id)
      console.log(trip.truck)
      const driverRes = await axios.get(`${backendUrl}/Staff/drivers/${truck.driver}`);
      const driverName = driverRes.data.Full_Name;
  
      // 4. Fetch workers info (assuming truck.Workers is an array of worker ids)
      const workersNames = [];
      for (const workerId of truck.worker_set) {
        const workerRes = await axios.get(`${backendUrl}/Staff/workers/${workerId}`);
        workersNames.push(workerRes.data.Full_Name);
      }
  
      // 5. Fetch landfill info (trip.Landfill contains landfill id)
      const landfillRes = await axios.get(`${backendUrl}/Staff/landfills/${trip.Landfill}`);
      const landfillData = landfillRes.data;
      const landfillJson = {
        Longitude_M: landfillData.Longitude_M,
        Latitude_M: landfillData.Latitude_M
      };
  
      // 6. Build start_point JSON
      const startPointJson = {
        Latitude: trip.initial_truck_latitude,
        Longitude: trip.initial_truck_longitude
      };
  
      // 7. Compose payload for HistoryTrip
      const historyTripPayload = {
        trip_id: trip.id,
        truck_plate: truck.Plate_number,
        driver_name: driverName,
        workers_name: workersNames,
        start_time: trip.Start_Date,
        duration_min: durationMinutes,
        landfill: landfillJson,
        start_point: startPointJson,
        path: localStorage.getItem('path') ? JSON.parse(localStorage.getItem('path')) : []
        // You can add fuel_spent or other fields if needed
      };
  
      // 8. Create HistoryTrip record
      await axios.post(`${backendUrl}/Staff/history-trips/`, historyTripPayload);
  
      // 9. Mark truck as not on trip
      await axios.patch(`${backendUrl}/Staff/trucks/${truckId}`, {
        on_trip: false
      });


      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      localStorage.clear();
      window.location.reload();
  
    } catch (error) {
      console.error('Error ending trip:', error);
      alert('حدث خطأ أثناء إنهاء الرحلة');
    }
  };
  


  useEffect(() => {
    if (!permissionGranted || !trip || !containers.length || !landfill || isCalculatingPath) return;

    const waypoints = [
      [trip.initial_truck_latitude, trip.initial_truck_longitude],
      ...containers.map(c => [c.Latitude_M, c.Longitude_M]),
      [landfill.Latitude_M, landfill.Longitude_M]
    ].filter(([lat, lng]) => lat && lng);

    fetchOptimalPath(waypoints).then(setPath);
  }, [permissionGranted, trip, containers, landfill]);

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <UncontrolledDropdown nav style={{ marginRight: 'auto' }}>
            <DropdownToggle className="pl-0" nav>
              <Media className="align-items-center">
                <i className="ni ni-button-power" />
              </Media>
            </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow dropdown-menu-custom">
                <DropdownItem onClick={handleEndTripAndLogout}>
                  إنهاء الرحلة وتسجيل الخروج
                </DropdownItem>
              </DropdownMenu>
          </UncontrolledDropdown>
        </Container>
      </Navbar>

      <Container className="map-container" style={{ position: 'relative', paddingTop: '60px' }}>
        {locationError && (
          <Alert color="danger" className="position-absolute top-0 start-0 m-3">
            {locationError}
          </Alert>
        )}

        {Object.values(activeAlerts).map((alert, index) => (
          <Alert 
            key={`alert-${index}`}
            color={alert.isDeviated ? 'danger' : 'success'}
            className="position-absolute top-0 start-0 m-3"
            style={{ marginTop: `${index * 60 + 20}px` }}
          >
            {alert.message}
          </Alert>
        ))}

        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {renderAlerts()}
        </div>

          {!permissionGranted && <AudioPermissionHandler setPermissionGranted={setPermissionGranted} />}

          { permissionGranted && (<MapContainer
            center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [35.5418, 35.7988]}
            zoom={13}
            style={{ height: 'calc(100vh - 60px)', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {currentLocation && <CenterMap currentLocation={currentLocation} />}


          {landfill && (
            <Marker position={[landfill.Latitude_M, landfill.Longitude_M]} icon={landfillIcon}>
              <Popup>مكب نفايات</Popup>
            </Marker>
          )}

          {containers.map(container => (
            <Marker key={container.id} position={[container.Latitude_M, container.Longitude_M]} icon={containerIcon}>
              <Popup>حاوية {container.id}: {container.Remarks || 'لا توجد ملاحظات'}</Popup>
            </Marker>
          ))}

          {currentLocation && (
            <Marker 
              position={[currentLocation.latitude, currentLocation.longitude]} 
              icon={dynamicIcon}
            >
              <Popup>موقعك الحالي</Popup>
            </Marker>
          )}

          {path.length > 0 && (
            <Polyline 
              positions={path} 
              color={trip?.Deviated ? 'red' : 'blue'} 
              weight={3} 
              opacity={0.7} 
            />
          )}
        </MapContainer>)}
      </Container>
    </>
  );
};

export default TrackPanel;
