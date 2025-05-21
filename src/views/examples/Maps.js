import React, { useEffect, useState, useRef } from 'react';
import { Container } from 'reactstrap';
import Header from 'components/Headers/Header.js';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../assets/css/MapsStyle.css';
import truckIconUrl from '../../assets/img/icons/truck.png';
import containerIconUrl from '../../assets/img/icons/container.png';
import landfillIconUrl from '../../assets/img/icons/landfill.png';
import alertsound from '../../assets/sounds/alert.mp3';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function playAlertRepeatedly(times = 3) {
  const audio = new Audio(process.env.PUBLIC_URL +'/sounds/alert.mp3');
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
  audio.volume = 0;
  return audio.play()
    .then(() => true)
    .catch(err => {
      console.log('Audio permission needed');
      return false;
    });
};

const AudioPermissionHandler = ({ onPermissionGranted }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    initializeAudio().then(success => {
      if (!success) {
        const handleFirstInteraction = () => {
          initializeAudio().finally(() => {
            setPermissionGranted(true);
            onPermissionGranted(); 
            document.removeEventListener('click', handleFirstInteraction);
          });
        };
        
        document.addEventListener('click', handleFirstInteraction);
      } else {
        setPermissionGranted(true);
        onPermissionGranted(); 
      }
    });
  }, [onPermissionGranted]);

  return permissionGranted ? null : (
    <div className="audio-permission-overlay">
      <p>إضغط على الشاشة لتمكين الصوت</p>
    </div>
  );
};


const Maps = () => {
  const [trucks, setTrucks] = useState([]);
  const [containers, setContainers] = useState([]);
  const [landfills, setLandfills] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [setClickCoordinates] = useState(null);
  const [tripPaths, setTripPaths] = useState([]);
  const pathCache = useRef(new Map());
  const lastCacheKey = useRef('');
  const [x, setIsCalculatingPaths] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const prevTrucks = usePrevious(trucks);
  const [activeAlerts, setActiveAlerts] = useState({});
  const alertTimeoutRef = useRef({});
  const [fetchingEnabled, setFetchingEnabled] = useState(false);
  const intervalRef = useRef(null);



  const updateAlert = (truckId, isDeviated) => {
    if (alertTimeoutRef.current[truckId]) {
      clearTimeout(alertTimeoutRef.current[truckId]);
      delete alertTimeoutRef.current[truckId];
    }
  
    setActiveAlerts(prev => {
      const newAlerts = { ...prev };
      
      const currentState = prev[truckId]?.isDeviated;
      if (isDeviated === currentState) return prev;
      
      if (isDeviated) {
        playAlertRepeatedly(3);
        
        newAlerts[truckId] = {
          message: `⚠️ الشاحنة ${truckId} انحراف عن المسار`,
          isDeviated: true,
          timestamp: Date.now()
        };
      } else {
        newAlerts[truckId] = {
          message: `✅ الشاحنة ${truckId} عادت للمسار`,
          isDeviated: false,
          timestamp: Date.now()
        };
        
        alertTimeoutRef.current[truckId] = setTimeout(() => {
          setActiveAlerts(prevAlerts => {
            const updated = { ...prevAlerts };
            delete updated[truckId];
            return updated;
          });
        }, 5000);
      }
      
      return newAlerts;
    });
  };

  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const x = point[0], y = point[1];
    const x1 = lineStart[0], y1 = lineStart[1];
    const x2 = lineEnd[0], y2 = lineEnd[1];

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy) * 111320;
  };

  const distanceToPath = (point, path) => {
    let minDistance = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const distance = pointToLineDistance(point, path[i], path[i+1]);
      if (distance < minDistance) minDistance = distance;
    }
    return minDistance;
  };

  const fetchTrucks = async () => {
    if (!fetchingEnabled) return;
    try {
      const response = await fetch(`${backendUrl}/Staff/trucks/`);
      if (!response.ok) throw new Error('Failed to fetch trucks');
      const data = await response.json();
      const activeTrucks = data.filter(truck => truck.on_trip === true);
      setTrucks(activeTrucks);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/containers/`);
      if (!response.ok) throw new Error('Failed to fetch containers');
      const data = await response.json();
      setContainers(data);
    } catch (error) {
      console.error('Error fetching containers:', error);
    }
  };

  const fetchLandfills = async () => {
    if (!fetchingEnabled) return;
    try {
      const response = await fetch(`${backendUrl}/Staff/landfills/`);
      if (!response.ok) throw new Error('Failed to fetch landfills');
      const data = await response.json();
      setLandfills(data);
    } catch (error) {
      console.error('Error fetching landfills:', error);
    }
  };

  const fetchTrips = async () => {
    if (!fetchingEnabled) return;
    try {
      const response = await fetch(`${backendUrl}/Staff/trips/`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

const fetchOptimalPathWithRetry = async (waypoints, retries = 3) => {
  try {
    const valid = waypoints.filter(wp => 
      Number.isFinite(wp[0]) && Number.isFinite(wp[1])
    );
    if (valid.length < 2) return [];

    const coordinates = valid
      .map(wp => `${wp[1]},${wp[0]}`)
      .join(';');

    const url = `https://router.project-osrm.org/trip/v1/driving/${coordinates}` +
                `?overview=full&geometries=geojson&steps=true` +
                `&source=first&destination=last&roundtrip=false`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM trip failed');

    const data = await response.json();
    const trip = data.trips?.[0];
    if (!trip || !trip.geometry) return [];

    return trip.geometry.coordinates.map(c => [c[1], c[0]]);
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchOptimalPathWithRetry(waypoints, retries - 1);
    }
    console.error('Final trip attempt failed:', err);
    return waypoints;
  }
};

const initializeDataFetching = async () => {
    try {
      await Promise.all([
        fetchTrucks(),
        fetchContainers(),
        fetchLandfills(),
        fetchTrips()
      ]);
      
      // Start the interval for truck updates
      intervalRef.current = setInterval(fetchTrucks, 2000);
    } catch (error) {
      console.error('Initial data fetching failed:', error);
    }
  };

const handlePermissionGranted = () => {
    setFetchingEnabled(true);
    initializeDataFetching();
  };

    useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (trucks.length > 0 && containers.length > 0 && landfills.length > 0 && trips.length > 0) {
      const calculateTripPaths = async () => {
        setIsCalculatingPaths(true);
        try {
          const tripIds = trips.map(t => t.id).join(',');
          const containerIds = containers.map(c => c.id).join(',');
          const currentCacheKey = `${tripIds}|${containerIds}`;
          
          if (currentCacheKey !== lastCacheKey.current) {
            lastCacheKey.current = currentCacheKey;
            
            const paths = await Promise.all(
              trips.map(async (trip) => {
                const landfill = landfills.find(l => l.id === trip.Landfill);
                const tripContainers = containers.filter(c => trip.container_set.includes(c.id));

                if (!landfill || tripContainers.length === 0) return [];

                const allWaypoints = [
                  [trip.initial_truck_latitude, trip.initial_truck_longitude],
                  ...tripContainers.map(c => [c.Latitude_M, c.Longitude_M]),
                  [landfill.Latitude_M, landfill.Longitude_M]
                ];

                const cacheKey = allWaypoints.map(wp => `${wp[0]},${wp[1]}`).join('|');
                
                if (pathCache.current.has(cacheKey)) {
                  return pathCache.current.get(cacheKey);
                }
                
                const path = await fetchOptimalPathWithRetry(allWaypoints);
                pathCache.current.set(cacheKey, path);
                return path;
              })
            );
            
            setTripPaths(paths);
          }
        } catch (error) {
          console.error('Error in path calculation:', error);
        } finally {
          setIsCalculatingPaths(false);
        }
      };
      
      const timeoutId = setTimeout(calculateTripPaths, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [trips, containers, landfills, trucks]);

  const checkDeviations = async (initialCheck = false) => {
    const updates = [];
    const deviationThreshold = 40;
    const returnThreshold = 40;
    
    trips.forEach((trip, index) => {
      const truck = trucks.find(t => t.id === trip.truck);
      if (!truck || !tripPaths[index] || tripPaths[index].length < 2) {
        return;
      }
  
      const currentPos = [truck.Latitude_M, truck.Longitude_M];
      const distance = distanceToPath(currentPos, tripPaths[index]);
      
      // Only show initial deviation if it's actually deviated
      if (distance > deviationThreshold) {
        if (!initialCheck || (initialCheck && trip.Deviated)) {
          updates.push({ 
            tripId: trip.id,
            deviated: true,
            distance: distance 
          });
          updateAlert(truck.id, true);
        }
      } else if (distance <= returnThreshold && trip.Deviated) {
        updates.push({ 
          tripId: trip.id,
          deviated: false,
          distance: distance
        });
        updateAlert(truck.id, false);
      }
    });

  if (updates.length > 0) {
    
    try {
      const results = await Promise.allSettled(
        updates.map(update => {
          if (!update.tripId || isNaN(update.tripId)) {
            return Promise.resolve();
          }
          
          return fetch(`${backendUrl}/Staff/trips/${update.tripId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              Deviated: update.deviated,
              last_deviation_distance: update.distance,
              last_updated: new Date().toISOString()
            }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          });
        })
      );

      let hasSuccessfulUpdates = false;
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`Update failed for trip ${updates[i].tripId}:`, result.reason);
        } else {
          hasSuccessfulUpdates = true;
        }
      });

      if (hasSuccessfulUpdates) {
        await fetchTrips();
      }
    } catch (error) {
      console.error('Error in update process:', error);
    }
  }
};


useEffect(() => {
  if (!trucks || !tripPaths || !trips || trucks.length === 0 || tripPaths.length === 0) return;
  
  const trucksChanged = !prevTrucks || 
      trucks.some((truck, i) => 
        !prevTrucks[i] ||
        prevTrucks[i].Latitude_M !== truck.Latitude_M || 
        prevTrucks[i].Longitude_M !== truck.Longitude_M
      );
  
  if (trucksChanged) {
    checkDeviations();
  }
}, [trucks]);

  const handleTruckChange = (event) => {
    const selectedId = event.target.value;
    const selected = trucks.find(truck => truck.id === parseInt(selectedId));
    setSelectedTruck(selectedId === 'all' ? null : selected);
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setClickCoordinates({ latitude: lat, longitude: lng });
  };

  const generatePathColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = `hsl(${(i * 360) / count}, 100%, 50%)`;
      colors.push(color);
    }
    return colors;
  };

const TruckMarker = React.memo(({ truck, trips }) => {
  const trip = trips.find(t => t.truck === truck.id);
  const isDeviated = trip?.Deviated;
  
  const icon = new L.Icon({
    iconUrl: truckIconUrl,
    iconSize: isDeviated ? [30, 30] : [25, 25],
    iconAnchor: isDeviated ? [15,30]:[12.5, 25],
    popupAnchor: [0, isDeviated ? -30 : -25],
    className: isDeviated ? 'deviated-truck' : ''
  });

  return (
    <Marker
      position={[truck.Latitude_M, truck.Longitude_M]}
      icon={icon}
      key={`truck-${truck.id}-${truck.Latitude_M}-${truck.Longitude_M}`}
    >
      <Popup>
        {`المعرف: ${truck.id}`}
        {isDeviated && <div style={{color: 'red', fontWeight: 'bold'}}>⚠️ انحراف عن المسار</div>}
        {`ملاحظات: ${truck.Remarks || 'لا توجد ملاحظات'}`}
      </Popup>
    </Marker>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.truck.Latitude_M === nextProps.truck.Latitude_M &&
    prevProps.truck.Longitude_M === nextProps.truck.Longitude_M &&
    prevProps.trips.find(t => t.truck === prevProps.truck.id)?.Deviated === 
    nextProps.trips.find(t => t.truck === nextProps.truck.id)?.Deviated
  );
});

useEffect(() => {
  if (trucks.length > 0 && tripPaths.length > 0 && trips.length > 0) {
    checkDeviations(true);
  }
}, [trucks, tripPaths, trips]);


  const containerIcon = new L.Icon({
    iconUrl: containerIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, 0],
  });

  const landfillIcon = new L.Icon({
    iconUrl: landfillIconUrl,
    iconSize: [25, 25],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
  });



  const renderAlerts = () => {
    const alertsArray = Object.entries(activeAlerts).map(([truckId, alert]) => ({
      truckId,
      ...alert
    }));
    
    if (alertsArray.length === 0) return null;
  
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {alertsArray.map(alert => (
          <div 
            key={`alert-${alert.truckId}`}
            style={{
              padding: '10px 15px',
              borderRadius: '4px',
              background: alert.isDeviated ? '#f44336' : '#4caf50',
              color: 'white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            {alert.message}
            {!alert.isDeviated && (
              <button 
                onClick={() => {
                  setActiveAlerts(prev => {
                    const updated = { ...prev };
                    delete updated[alert.truckId];
                    return updated;
                  });
                }}
                style={{
                  marginLeft: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };


  const SetMapCenter = ({ selectedTruck }) => {
    const map = useMap();
    useEffect(() => {
      if (selectedTruck) {
        map.setView([selectedTruck.Latitude_M, selectedTruck.Longitude_M], 15);
      }
    }, [selectedTruck, map]);
    return null;
  };

  return (
    <>
      <Header />
      <Container className="map-container" style={{ position: 'relative' }}>
        <div className="truck-selector">
          <label htmlFor="truck-select">اختر الشاحنة: </label>
          <select id="truck-select" onChange={handleTruckChange} value={selectedTruck ? selectedTruck.id : 'all'}>
            <option value="all">عرض جميع الشاحنات</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>
                {`المعرف: ${truck.id}، خط العرض: ${truck.Latitude_M}، خط الطول: ${truck.Longitude_M}، ملاحظات: ${truck.Remarks || 'لا توجد ملاحظات'}`}
              </option>
            ))}
          </select>
        </div>

        <MapContainer
          center={[35.17, 35.93]}
          zoom={13}
          style={{
            height: '100vh',
            width: '100%',
            border: '2px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
          onClick={handleMapClick}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <AudioPermissionHandler onPermissionGranted={handlePermissionGranted} />

          {selectedTruck && <SetMapCenter selectedTruck={selectedTruck} />}

          {containers.map(container => (
            <Marker
              key={container.id}
              position={[container.Latitude_M, container.Longitude_M]}
              icon={containerIcon}
            >
              <Popup>
                {`المعرف: ${container.id}، ملاحظات: ${container.Remarks || 'لا توجد ملاحظات'}`}
              </Popup>
            </Marker>
          ))}

          {landfills.map(landfill => (
            <Marker
              key={landfill.id}
              position={[landfill.Latitude_M, landfill.Longitude_M]}
              icon={landfillIcon}
            >
              <Popup>
                {`مكب نفايات`}
              </Popup>
            </Marker>
          ))}

          {trucks.map(truck => (
              <TruckMarker 
                key={`truck-marker-${truck.id}`}
                truck={truck} 
                trips={trips} 
              />
            ))}

          {tripPaths.map((path, index) => (
            path?.length > 1 && (
              <Polyline
                key={`path-${index}`}
                positions={path}
                color={generatePathColors(tripPaths.length)[index]}
                weight={3}
                opacity={0.7}
              />
            )
          ))}
        </MapContainer>
        {renderAlerts()}
      </Container>
    </>
  );
};

export default Maps;
