import React, { useEffect ,useState } from "react";
import { Table, Pagination, Modal, Button,Checkbox,CheckboxGroup, Form,SelectPicker } from 'rsuite';
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
  const [currentData, setCurrentData] = useState({Longitude_M:"",Latitude_M:"",Remarks:"" });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [permissions, setPermissions] = useState({
    add: false,
    edit: false,
    delete: false,
    view: false
  });

  // Get user type from localStorage
  const userType = localStorage.getItem('role');
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.id); 
    setIsModalOpen(true);
  };

  // Fetch permissions for the current user type
  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${backendUrl}/approvals/permissions/`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const allPermissions = await response.json();
      
      // Find permissions for the current user type
      const userPermissions = allPermissions.find(p => p.user_type === userType);
      
      if (userPermissions && userPermissions.table_permissions["Waste_Containers"]) {
        setPermissions(userPermissions.table_permissions["Waste_Containers"]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };
  

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/containers/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const containersData = await response.json();
      setData(containersData);
      return containersData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    fetchPermissions();
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      Longitude_M: currentData.Longitude_M,
      Latitude_M: currentData.Latitude_M,
      Remarks: currentData.Remarks
    };
    
    try {
      let response;
      if (isEditing) {
        response = await fetch(`${backendUrl}/Staff/containers/${currentData.id}`, {  
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/Staff/containers/`, {  
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
  
      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update the record' : 'Failed to add new record');
      }
  
      const savedRecord = await response.json();
  
      if (isEditing) {
        setData(data.map(row => (row.id === savedRecord.id ? savedRecord : row)));
      } else {
        setData([...data, savedRecord]);
      }
  
      setIsModalOpen(false);
      setCurrentData({Longitude_M:"",Latitude_M:"",Remarks:""});
      fetchData();
    } catch (error) {
      console.error('Error in save operation:', error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الصف؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/containers/${id}`, {
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

  // Don't render anything until permissions are loaded
  if (loadingPermissions) {
    return <div>Loading...</div>;
  }

  // Don't render the table if user doesn't have view permission
  if (!permissions.view) {
    return (
      <div dir="rtl">
        <Header />
        <div style={{ margin: '20px', textAlign: 'center' }}>
          <h3>You don't have permission to view this page</h3>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Header />
      {permissions.add && (
        <div style={{ margin: '20px 10px' }}>
          <Button className="add-button" onClick={() => openModal()} appearance="primary">
            <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
            إضافة عنصر جديد
          </Button>
        </div>
      )}
      <Table
        height={420}
        data={getData()}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        loading={loading}
        className="table" 
        style={{ direction: 'rtl', tableLayout: 'auto' }} 
      >
        <Column width={50} align="center" fixed sortable>
          <HeaderCell className="table-header">رقم</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={100} align="center" fixed sortable>
          <HeaderCell className="table-header">احداثيات الطول</HeaderCell>
          <Cell dataKey="Longitude_M" />
        </Column>
        <Column width={100} align="center" fixed sortable>
          <HeaderCell className="table-header">احداثيات العرض</HeaderCell>
          <Cell dataKey="Latitude_M" />
        </Column>
        <Column width={200} flexGrow={1} sortable>
          <HeaderCell className="table-header">الملاحظات</HeaderCell>
          <Cell dataKey="Remarks" />
        </Column>

        {(permissions.edit || permissions.delete) && (
          <Column width={150} fixed>
            <HeaderCell className="table-header">الإجراءات</HeaderCell>
            <Cell>
              {rowData => (
                <>
                  <Modal.Footer style={{ textAlign: 'left' }}>
                    {permissions.edit && (
                      <Button
                        appearance="primary"
                        style={{ backgroundColor: 'rgba(0, 123, 255, 0.6)', color: 'white' }}
                        onClick={() => openModal(rowData)}
                      >
                        تعديل
                      </Button>
                    )}
                    {permissions.delete && (
                      <Button
                        style={{ backgroundColor: 'rgba(255, 0, 0, 0.6)', color: 'white' }}
                        onClick={() => handleDelete(rowData.id)}
                      >
                        حذف
                      </Button>
                    )}
                  </Modal.Footer>
                </>
              )}
            </Cell>
          </Column>
        )}
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
            <Form.Group controlId="Longitude_M">
              <Form.ControlLabel>احداثيات الطول</Form.ControlLabel>
              <Form.Control
                name="Longitude_M"
                type="number"
                value={currentData.Longitude_M}
                onChange={(value) => 
                  setCurrentData({ ...currentData, Longitude_M: parseFloat(value) || 0 })
                }
              />
            </Form.Group>
            <Form.Group controlId="Latitude_M">
              <Form.ControlLabel>احداثيات العرض</Form.ControlLabel>
              <Form.Control
                name="Latitude_M"
                type="number"
                value={currentData.Latitude_M}
                onChange={(value) => 
                  setCurrentData({ ...currentData, Latitude_M: parseFloat(value) || 0 })
                }
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