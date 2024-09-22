import React, { useEffect ,useState } from "react";
import { Table, Pagination, Modal, Button, Form,SelectPicker } from 'rsuite';
import Header from "components/Headers/Header.js";
import 'rsuite/dist/rsuite.min.css';
import CustomPagination from 'components/CustomPagination/CustomPagination';
import '../../assets/css/TableStyles.css';
import { FaPlus } from 'react-icons/fa';

const { Column, HeaderCell, Cell } = Table;

const App = () => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({ Truck_model: '',Availability:'',Plate_number: '',Remarks: '',Maintenance: '' ,Location:''});
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.id); 
    setIsModalOpen(true);
  };
const [availabilityOptions, setAvailabilityOptions] = useState([]);
const [locationOptions, setLocationOptions] = useState([]);


  const fetchData = async() => {
    console.log('fetching...')
    const [trucksResponse,availabilityResponse, locationResponse] = await Promise.all([
      fetch(`${backendUrl}/Staff/trucks/`),
      fetch(`${backendUrl}/Staff/truck_ava/`),
      fetch(`${backendUrl}/Staff/location_names/`)
    ]);
    const [trucksData,availabilityData,locationData] = await Promise.all([
      trucksResponse.json(),
      availabilityResponse.json(),
    locationResponse.json()
    ]);
    const combinedData = trucksData;
    const conditionData = availabilityData;
    const LocData = locationData;
    setAvailabilityOptions(conditionData);
    setLocationOptions(LocData);
    setData(combinedData);
    console.log(conditionData)
    console.log(LocData)
    console.log(combinedData)
    return combinedData , conditionData , LocData
  }
  useEffect(() => {
    fetchData()
  }, [])
  console.log(availabilityOptions)
  console.log(locationOptions)
  console.log(data)
  const handleSave = async () => {
      const payload = {
        Truck_model: currentData.Truck_model,
        Availability: currentData.Availability, 
        Plate_number: currentData.Plate_number,
        Maintenance: currentData.Maintenance,
        Location: currentData.Location,
        Remarks: currentData.Remarks
      };

    console.log("POST Payload:", payload); 
    if (isEditing) {
      try {
        const response = await fetch(`${backendUrl}/Staff/trucks/${currentData.id}`, {
          method: 'PUT', // or 'PATCH' if you want to update only some fields
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update the record');
        }
  
        const updatedData = await response.json(); // Get updated data from response
        setData(data.map(row => (row.id === updatedData.id ? updatedData : row)));
      } catch (error) {
        console.error('Error updating data:', error);
      }
    } else {
      try {
        const maxId = data.length > 0 ? Math.max(...data.map(row => row.id)) : 0;
        const response = await fetch(`${backendUrl}/Staff/trucks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...currentData, id: undefined }), // Assuming backend generates ID
        });
  
        if (!response.ok) {
          throw new Error('Failed to add new record');
        }
  
        const newRecord = await response.json(); // Get the newly created record
        setData([...data, newRecord]);
      } catch (error) {
        console.error('Error adding data:', error);
      }
    }
    setIsModalOpen(false);
    setCurrentData({ Truck_model: '',Availability:"",Plate_number: '',Remarks: '',Maintenance: '' ,Location:""});
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الصف؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/trucks/${id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete the record');
        }
  
        // Update local state by filtering out the deleted item
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

  return (
    <div dir="rtl">
      <Header />
      <div style={{ margin: '20px 10px' }}>
        <Button className="add-button" onClick={() => openModal()} appearance="primary">
          <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
          إضافة عنصر جديد
        </Button>
      </div>

      <Table
        height={420}
        data={getData()}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        loading={loading}
        className="table" 
        style={{ direction: 'rtl' }}
      >
        <Column width={50} align="center" fixed sortable>
          <HeaderCell className="table-header">رقم</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={130} sortable>
          <HeaderCell className="table-header">طراز الشاحنة</HeaderCell>
          <Cell dataKey="Truck_model" />
        </Column>

        <Column width={130} sortable>
          <HeaderCell className="table-header">الحالة</HeaderCell>
          <Cell>
            {rowData => {
              const availability = availabilityOptions.find(a => a.id === rowData.Availability);
              return availability ? availability.condition : 'Unknown'; 
            }}
         </Cell>
        </Column>

        <Column width={200} sortable>
          <HeaderCell className="table-header">رقم اللوحة</HeaderCell>
          <Cell dataKey="Plate_number" />
        </Column>

        <Column width={200} flexGrow={1} sortable>
          <HeaderCell className="table-header">الملاحظات</HeaderCell>
          <Cell dataKey="Remarks" />
        </Column>

        <Column width={200} flexGrow={1} sortable>
          <HeaderCell className="table-header">الأعطال</HeaderCell>
          <Cell dataKey="Maintenance" />
        </Column>

        <Column width={200} flexGrow={1} sortable>
          <HeaderCell className="table-header">الموقع</HeaderCell>
          <Cell>
            {rowData => {
              const name = locationOptions.find(a => a.id === rowData.Location);
              return name ? name.Name : 'Unknown'; 
            }}
         </Cell>
        </Column>

        <Column width={150} fixed>
          <HeaderCell className="table-header">الإجراءات</HeaderCell>
          <Cell>
            {rowData => (
              <>
                <Modal.Footer style={{ textAlign: 'left' }}>
                  <Button
                    appearance="primary"
                    style={{ backgroundColor: 'rgba(0, 123, 255, 0.6)', color: 'white' }} // Adjusted for transparency
                    onClick={() => openModal(rowData)}
                  >
                    تعديل
                  </Button>
                  <Button
                    style={{ backgroundColor: 'rgba(255, 0, 0, 0.6)', color: 'white' }} // Adjusted for transparency
                    onClick={() => handleDelete(rowData.id)}
                  >
                    حذف
                  </Button>
                </Modal.Footer>

              </>
            )}
          </Cell>
        </Column>
      </Table>

      <CustomPagination
        total={data.length}
        limit={limit}
        activePage={page}
        onChangePage={setPage}
        onChangeLimit={setLimit}
      />

      {/* Modal for Add/Edit */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>
          <Modal.Title>{isEditing ? 'تعديل البيانات' : 'إضافة بيانات جديدة'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid formValue={currentData} onChange={setCurrentData}>
            <Form.Group>
              <Form.Control
                name="Truck_model"
                placeholder="طراز الشاحنة"
                value={currentData.Truck_model}
                onChange={value => setCurrentData(prev => ({ ...prev, Truck_model: value }))}
              />
            </Form.Group>
            {/* Dropdown for Availability */}
            <Form.Group>
              <Form.ControlLabel>الحالة</Form.ControlLabel>
              <SelectPicker
                data={availabilityOptions.map(option => ({
                  label: option.condition,
                  value: option.id,
                }))}
                placeholder="اختر الحالة"
                value={currentData.Availability || null}
                onChange={value => setCurrentData(prev => ({
                  ...prev,
                  Availability: value
                }))}
                block
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name="Plate_number"
                placeholder="رقم اللوحة"
                value={currentData.Plate_number}
                onChange={value => setCurrentData(prev => ({ ...prev, Plate_number: value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name="Remarks"
                placeholder="الملاحظات"
                value={currentData.Remarks}
                onChange={value => setCurrentData(prev => ({ ...prev, Remarks: value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name="Maintenance"
                placeholder="الأعطال"
                value={currentData.Maintenance}
                onChange={value => setCurrentData(prev => ({ ...prev, Maintenance: value }))}
              />
            </Form.Group>
            {/* Dropdown for Location */}
            <Form.Group>
              <Form.ControlLabel>الموقع</Form.ControlLabel>
              <SelectPicker
                data={locationOptions.map(option => ({
                  label: option.Name,
                  value: option.id,
                }))}
                placeholder="اختر الموقع"
                value={currentData.Location || null}
                onChange={value => setCurrentData(prev => ({
                  ...prev,
                  Location: value
                }))}
                block
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ textAlign: 'left' }}>
          <Button onClick={() => setIsModalOpen(false)} appearance="subtle">إلغاء</Button>
          <Button onClick={handleSave} appearance="primary">حفظ</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;