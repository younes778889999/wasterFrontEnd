import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form, SelectPicker, Checkbox, CheckboxGroup } from 'rsuite';
import Header from "components/Headers/Header.js";
import 'rsuite/dist/rsuite.min.css';
import CustomPagination from 'components/CustomPagination/CustomPagination';
import '../../assets/css/TableStyles.css';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from 'react-router-dom';
import permissions from "./Permissions.js";

const { Column, HeaderCell, Cell } = Table;

const App = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { getUserType } = useAuth();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [trucks, setTrucks] = useState([]); 
  const [containers, setContainers] = useState([]);
  const [landfills, setLandfills] = useState([]);
  const [currentData, setCurrentData] = useState({
    id: null,
    truck: null,
    Landfill: null,
    Start_Date: '',
    Duration_min: null,
    Distance_km: null,
    Fuel_Spent_Liter: null,
    container_set: [],
    Deviated: false,
    initial_truck_latitude: null,
    initial_truck_longitude: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false); // New state for the automated trips modal
  const [selectedTrucks, setSelectedTrucks] = useState([]); // New state for selected trucks
  const [selectedContainers, setSelectedContainers] = useState([]); // New state for selected containers
  const [selectedLandfills, setSelectedLandfills] = useState([]); // New state for selected landfills
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const usertype = getUserType();
  
  const pageString  = currentPath.split('/').filter(Boolean).pop() || '';
  
  const userPermissions = permissions[usertype]?.[pageString] || { edit: false, delete: false, add: false, view: false };
  
  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.id);
    setIsModalOpen(true);
  };

  const openAutoModal = () => {
    setIsAutoModalOpen(true);
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/trips/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const tripsData = await response.json();
      setData(tripsData);
    } catch (error) {
      console.error('Error fetching trips data:', error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/trucks/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const trucksData = await response.json();
      console.log("Raw trucks data:", trucksData);
      const formattedTrucks = trucksData.map(truck => ({
        label: truck.id,
        value: truck.id
      }));
      console.log("Formatted trucks data:", formattedTrucks);
      setTrucks(formattedTrucks);
    } catch (error) {
      console.error('Error fetching trucks data:', error);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/containers/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const containersData = await response.json();
      const formattedContainers = containersData.map(container => ({
        label: container.id,
        value: container.id
      }));
      setContainers(formattedContainers);
    } catch (error) {
      console.error('Error fetching containers data:', error);
    }
  };

  const fetchLandfills = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/landfills/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const landfillsData = await response.json();
      const formattedLandfills = landfillsData.map(landfill => ({
        label: landfill.id,
        value: landfill.id
      }));
      setLandfills(formattedLandfills);
    } catch (error) {
      console.error('Error fetching landfills data:', error);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchTrucks();
    fetchContainers();
    fetchLandfills();
  }, []);

  const handleSave = async () => {
    const payload = {
      truck: currentData.truck,
      Landfill: currentData.Landfill,
      Start_Date: currentData.Start_Date,
      Duration_min: currentData.Duration_min,
      Distance_km: currentData.Distance_km,
      Fuel_Spent_Liter: currentData.Fuel_Spent_Liter,
      container_set: currentData.container_set,
      Deviated: false,
      initial_truck_latitude: currentData.initial_truck_latitude,
      initial_truck_longitude: currentData.initial_truck_longitude,
    };
  
    try {
      const response = await fetch(`${backendUrl}/Staff/trips/${isEditing ? currentData.id : ''}`, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const savedRecord = await response.json();
      setData(isEditing ? data.map(row => (row.id === savedRecord.id ? savedRecord : row)) : [...data, savedRecord]);
      setIsModalOpen(false);
      setCurrentData({ id: null, truck: null, Landfill: null, Start_Date: '', Duration_min: null, Distance_km: null, Fuel_Spent_Liter: null, container_set: [] });

    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه الرحلة؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/trips/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete the record');
        }

        setData(data.filter(row => row.id !== id));
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSortColumn(sortColumn);
      setSortType(sortType);
    }, 500);
  };

  const getData = () => {
    const sortedData = [...data];
    if (sortColumn && sortType) {
      sortedData.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === 'string') x = x.charCodeAt();
        if (typeof y === 'string') y = y.charCodeAt();
        return sortType === 'asc' ? x - y : y - x;
      });
    }
    const start = limit * (page - 1);
    const end = start + limit;
    return sortedData.slice(start, end);
  };
  const handleTruckSelect = async (truckId) => {
    try {
      const response = await fetch(`${backendUrl}/Staff/trucks/${truckId}`);
      const truckData = await response.json();
      
      setCurrentData({
        ...currentData,
        truck: truckId,
        initial_truck_latitude: truckData.Latitude_M,
        initial_truck_longitude: truckData.Longitude_M
      });
    } catch (error) {
      console.error('Error fetching truck coordinates:', error);
    }
  };
  const handleGenerate = async () => {
    if (selectedTrucks.length === 0 || selectedContainers.length === 0 || selectedLandfills.length === 0) {
      alert("يجب اختيار شاحنات وحاويات ومكبات لتوليد الرحلات.");
      return;
    }
  
    try {
      // Fetch truck, container, and landfill positions
      const trucksData = await fetch(`${backendUrl}/Staff/trucks/`).then((res) => res.json());
      const containersData = await fetch(`${backendUrl}/Staff/containers/`).then((res) => res.json());
      const landfillsData = await fetch(`${backendUrl}/Staff/landfills/`).then((res) => res.json());
  
      // Map selected IDs to their full data
      const selectedTrucksData = trucksData.filter((truck) => selectedTrucks.includes(truck.id));
      const selectedContainersData = containersData.filter((container) => selectedContainers.includes(container.id));
      const selectedLandfillsData = landfillsData.filter((landfill) => selectedLandfills.includes(landfill.id));
  
      // Calculate distances between all points
      const distanceMatrix = await calculateDistanceMatrix(selectedTrucksData, selectedContainersData, selectedLandfillsData);
  
      // Assign containers to trucks
      const assignments = assignContainersToTrucks(selectedTrucksData, selectedContainersData, distanceMatrix);
  
      // Generate routes for each truck
      const trips = await generateTrips(assignments, selectedTrucksData, selectedContainersData, selectedLandfillsData, distanceMatrix);
  
      for (const trip of trips) {
        const payload = {
          truck: trip.truck,
          Landfill: trip.landfill,
          container_set: trip.containers,
          Deviated: false,
          initial_truck_latitude: trip.initial_truck_latitude, // Include initial coordinates
          initial_truck_longitude: trip.initial_truck_longitude, // Include initial coordinates
        };
  
        const response = await fetch(`${backendUrl}/Staff/trips/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from backend:", errorData);
          throw new Error('Failed to save trip');
        }
  
        const savedTrip = await response.json();
        console.log('Trip saved:', savedTrip);
      }
  
      alert("تم توليد الرحلات بنجاح وحفظها.");
      setIsAutoModalOpen(false);
      fetchTrips(); // Refresh the trips table
    } catch (error) {
      console.error('Error generating trips:', error);
      alert("حدث خطأ أثناء توليد الرحلات.");
    }
  };
  
  const calculateDistanceMatrix = async (trucks, containers, landfills) => {
    const distanceMatrix = {};
  
    // Calculate distances between trucks and containers
    for (const truck of trucks) {
      for (const container of containers) {
        const distance = await fetchOSRMDistance([truck.Longitude_M, truck.Latitude_M], [container.Longitude_M, container.Latitude_M]);
        distanceMatrix[`truck_${truck.id}_container_${container.id}`] = distance;
      }
    }
  
    // Calculate distances between containers and landfills
    for (const container of containers) {
      for (const landfill of landfills) {
        const distance = await fetchOSRMDistance([container.Longitude_M, container.Latitude_M], [landfill.Longitude_M, landfill.Latitude_M]);
        distanceMatrix[`container_${container.id}_landfill_${landfill.id}`] = distance;
      }
    }
  
    return distanceMatrix;
  };
  
  const fetchOSRMDistance = async (start, end) => {
    const coordinates = `${start.join(',')};${end.join(',')}`;
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch OSRM distance');
    }
    const data = await response.json();
    return data.routes[0].distance; // Distance in meters
  };
  
  const assignContainersToTrucks = (trucks, containers, distanceMatrix) => {
    const assignments = [];
    const assignedContainers = new Set();
  
    // Assign containers to the nearest truck
    for (const truck of trucks) {
      const truckContainers = containers
        .filter((container) => !assignedContainers.has(container.id))
        .map((container) => ({
          ...container,
          distance: distanceMatrix[`truck_${truck.id}_container_${container.id}`],
        }))
        .sort((a, b) => a.distance - b.distance);
  
      const assigned = truckContainers.slice(0, Math.ceil(containers.length / trucks.length));
      assigned.forEach((container) => assignedContainers.add(container.id));
  
      assignments.push({
        truck: truck.id,
        containers: assigned.map((container) => container.id),
      });
    }
  
    return assignments;
  };
  
  const generateTrips = async (assignments, trucks, containers, landfills, distanceMatrix) => {
    const trips = [];
  
    for (const assignment of assignments) {
      try {
        const truckContainers = assignment.containers;
        const truck = trucks.find((t) => t.id === assignment.truck);
        
        if (!truck) {
          throw new Error(`Truck with ID ${assignment.truck} not found`);
        }
  
        // Validate truck coordinates
        if (typeof truck.Latitude_M !== 'number' || typeof truck.Longitude_M !== 'number') {
          throw new Error(`Invalid coordinates for truck ${truck.id}`);
        }
  
        // Find nearest landfill
        const nearestLandfill = landfills
          .map((landfill) => ({
            ...landfill,
            distance: distanceMatrix[`container_${truckContainers[truckContainers.length - 1]}_landfill_${landfill.id}`],
          }))
          .sort((a, b) => a.distance - b.distance)[0];
  
  

        trips.push({
          truck: truck.id,
          containers: truckContainers,
          landfill: nearestLandfill.id,
          Deviated: false,
          initial_truck_latitude: truck.Latitude_M,
          initial_truck_longitude: truck.Longitude_M,
        });
        
      } catch (error) {
        console.error(`Failed to generate trip for truck ${assignment.truck}:`, error);
        // Continue with next assignment instead of failing entire operation
        continue;
      }
    }
  
    return trips;
  };


  return (
    <div dir="rtl">
      <Header />
      <div style={{ margin: '20px 20px' }}>
        {userPermissions.add && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button className="add-button" onClick={() => openModal()} appearance="primary" color="blue">
              <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
              إضافة رحلة جديدة
            </Button>
            <Button className="add-button" onClick={openAutoModal} appearance="primary" color="green">
              <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
              إضافة رحلات مؤتمتة
            </Button>
          </div>
        )}
        <Table
          height={420}
          data={getData()}
          sortColumn={sortColumn}
          sortType={sortType}
          loading={loading}
          onSortColumn={handleSortColumn}
          style={{ marginTop: '20px', direction: 'rtl' }}
        >
          <Column width={50} align="center" sortable>
            <HeaderCell>رقم</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          
          <Column width={100} align="center" sortable>
            <HeaderCell>الشاحنة</HeaderCell>
            <Cell>
              {rowData => {
                const truck = trucks.find(t => t.value === rowData.truck);
                return truck ? truck.label : 'لا يوجد شاحنة';
              }}
            </Cell>
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>المكب</HeaderCell>
            <Cell>
              {rowData => {
                const landfill = landfills.find(l => l.value === rowData.Landfill);
                return landfill ? landfill.label : 'لا يوجد مكب';
              }}
            </Cell>
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>تاريخ البدء</HeaderCell>
            <Cell dataKey="Start_Date" />
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>المدة (دقيقة)</HeaderCell>
            <Cell dataKey="Duration_min" />
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>المسافة (كم)</HeaderCell>
            <Cell dataKey="Distance_km" />
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>الوقود المستهلك (لتر)</HeaderCell>
            <Cell dataKey="Fuel_Spent_Liter" />
          </Column>
          <Column width={200} align="center" sortable>
            <HeaderCell>الحاويات</HeaderCell>
            <Cell>
              {rowData => rowData.container_set.map(id => {
                const container = containers.find(c => c.value === id);
                return container ? container.label : '';
              }).join(', ')}
            </Cell>
          </Column>
          {userPermissions.edit || userPermissions.delete ? (
            <Column width={200} align="center">
              <HeaderCell>الإجراءات</HeaderCell>
              <Cell>
                {(rowData) => (
                  <>
                    {userPermissions.edit && (
                      <Button
                        appearance="primary"
                        className="button-edit"
                        onClick={() => openModal(rowData)}
                      >
                        تعديل
                      </Button>
                    )}
                    {userPermissions.delete && (
                      <Button
                        className="button-delete"
                        onClick={() => handleDelete(rowData.id)}
                      >
                        حذف
                      </Button>
                    )}
                  </>
                )}
              </Cell>
            </Column>
          ) : null}
        </Table>
        <CustomPagination
          total={data.length}
          limit={limit}
          activePage={page}
          onLimitChange={setLimit}
          onPageChange={setPage}
        />
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
          <Modal.Header>
            <Modal.Title>{isEditing ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form fluid>
              <Form.Group controlId="truck">
                <Form.ControlLabel>الشاحنة</Form.ControlLabel>
                <SelectPicker
                  data={trucks}
                  value={currentData.truck}
                  onChange={handleTruckSelect}
                  placeholder="اختر الشاحنة"
                  block
                />
              </Form.Group>
              <Form.Group controlId="landfill">
                <Form.ControlLabel>المكب</Form.ControlLabel>
                <SelectPicker
                  data={landfills}
                  value={currentData.Landfill}
                  onChange={(value) => setCurrentData({ ...currentData, Landfill: value })}
                  placeholder="اختر المكب"
                  block
                />
              </Form.Group>
              <Form.Group controlId="containers">
                <Form.ControlLabel>الحاويات</Form.ControlLabel>
                <CheckboxGroup
                  name="container_set"
                  value={currentData.container_set}
                  onChange={(value) => setCurrentData({ ...currentData, container_set: value })}
                >
                  {containers.map(container => (
                    <Checkbox key={container.value} value={container.value}>
                      {container.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Form.Group>
              {(isEditing && (currentData.truck || currentData.Landfill || currentData.container_set.length > 0)) && (
      <Form.Group controlId="regeneratePath">
      </Form.Group>
    )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSave} appearance="primary">حفظ</Button>
            <Button onClick={() => setIsModalOpen(false)} appearance="subtle">إلغاء</Button>
          </Modal.Footer>
        </Modal>

        {/* New Modal for Automated Trips */}
        <Modal open={isAutoModalOpen} onClose={() => setIsAutoModalOpen(false)} size="lg">
          <Modal.Header>
            <Modal.Title>إضافة رحلات مؤتمتة</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form fluid>
              <Form.Group controlId="trucks">
                <Form.ControlLabel>الشاحنات</Form.ControlLabel>
                <CheckboxGroup
                  name="trucks"
                  value={selectedTrucks}
                  onChange={(value) => setSelectedTrucks(value)}
                >
                  {trucks.map(truck => (
                    <Checkbox key={truck.value} value={truck.value}>
                      {truck.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Form.Group>
              <Form.Group controlId="containers">
                <Form.ControlLabel>الحاويات</Form.ControlLabel>
                <CheckboxGroup
                  name="containers"
                  value={selectedContainers}
                  onChange={(value) => setSelectedContainers(value)}
                >
                  {containers.map(container => (
                    <Checkbox key={container.value} value={container.value}>
                      {container.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Form.Group>
              <Form.Group controlId="landfills">
                <Form.ControlLabel>المكبات</Form.ControlLabel>
                <CheckboxGroup
                  name="landfills"
                  value={selectedLandfills}
                  onChange={(value) => setSelectedLandfills(value)}
                >
                  {landfills.map(landfill => (
                    <Checkbox key={landfill.value} value={landfill.value}>
                      {landfill.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={handleGenerate} appearance="primary">توليد</Button>
            <Button onClick={() => setIsAutoModalOpen(false)} appearance="subtle">إلغاء</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};
 
export default App;
