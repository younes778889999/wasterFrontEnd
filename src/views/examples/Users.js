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
  const [currentData, setCurrentData] = useState({ user_id: '',username:'',password:'',role: '',truck_id: '',employee_id: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.user_id); 
    setIsModalOpen(true);
  };
  
  const [Trucks, setTrucks] = useState([]);
  const [Employees, setEmployees] = useState([]);

  const fetchData = async() => {
    const [usersResponse,trucksResponse,employeesResponse] = await Promise.all([
      fetch(`${backendUrl}/Staff/users/`,{
        method: 'GET'
      }),
      fetch(`${backendUrl}/Staff/trucks/`),
      fetch(`${backendUrl}/Staff/employees/`)
    ]);
    if (!usersResponse.ok || !trucksResponse.ok || !employeesResponse.ok) {
        throw new Error("Failed to fetch one or more resources");
      }
    const [usersData,trucksData,employeesData] = await Promise.all([
        usersResponse.json(),
        trucksResponse.json(),
        employeesResponse.json()
    ]);
    const combinedData = usersData;
    const tData=trucksData
    const eData=employeesData
    setData(combinedData);
    setTrucks(tData);
    setEmployees(eData);
    return combinedData,tData,eData
  }
  useEffect(() => {
    fetchData()
  }, [])
  const handleSave = async () => {
    const payload = {
      user_id: currentData.user_id,
      username: currentData.username, 
      password: currentData.password,
      role: currentData.role,
      truck_id: currentData.truck_id,
      employee_id: currentData.employee_id
    };
  
    try {
      let response;
      if (isEditing) {
        console.log(`Attempting to update record with ID: ${currentData.user_id}`);
        response = await fetch(`${backendUrl}/Staff/user/${currentData.user_id}/`, {  
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        console.log("Attempting to add a new record");
        response = await fetch(`${backendUrl}/Staff/user/register/`, {  
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
      
      // Parse the response only once
      const savedRecord = await response.json();
      console.log(isEditing ? "Updated Record:" : "New Record:", savedRecord);
  
      // Update local state with the saved/updated record
      if (isEditing) {
        setData(data.map(row => (row.id === savedRecord.id ? savedRecord : row)));
      } else {
        setData([...data, savedRecord]);
      }
  
      // Close the modal and reset the form
      setIsModalOpen(false);
      setCurrentData({ user_id: '',username:'',password:'',role: '',truck_id: '',employee_id: ''  });
    } catch (error) {
      console.error('Error in save operation:', error);
    }
  };
  
  

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/user/${id}/`, {
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
  const roleNicknames = {
    admin: 'مشرف',
    manager_user: 'مدير',
    employee_user: 'موظف',
    truck_user: 'شاحنة'
  };

  return (
    <div dir="rtl">
      <Header />
      <div style={{ margin: '20px 10px' }}>
        <Button className="add-button" onClick={() => openModal()} appearance="primary">
          <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
          إضافة مستخدم جديد
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
          <HeaderCell className="table-header">الرقم</HeaderCell>
          <Cell dataKey="user_id" />
        </Column>

        <Column width={130}  align="center" sortable>
          <HeaderCell className="table-header">اسم المستخدم </HeaderCell>
          <Cell dataKey="username" />
        </Column>

        <Column width={130}  align="center" sortable>
          <HeaderCell className="table-header">الدور</HeaderCell>
          <Cell>
            {rowData => {
              switch (rowData.role) {
                case "admin":
                  return "مشرف";
                case "manager_user":
                  return "مدير";
                case "employee_user":
                  return "موظف";
                case "truck_user":
                  return "شاحنة";
                default:
                  return "غير معروف"; // Fallback for unknown roles
              }
            }}
          </Cell>
        </Column>

        <Column width={100}  align="center" sortable>
          <HeaderCell className="table-header">رقم الشاحنة</HeaderCell>
          <Cell dataKey="truck_id"/>
        </Column>

        <Column width={130} flexGrow={1} sortable>
          <HeaderCell className="table-header"> الموظف</HeaderCell>
          <Cell style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {rowData => {
              const employee_name = Employees.find(a => a.id === rowData.employee_id);
              return employee_name ? employee_name.Full_Name : ''; 
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
                    onClick={() => handleDelete(rowData.user_id)}
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
                name="username"
                placeholder=" اسم المستخدم"
                value={currentData.username}
                onChange={value => setCurrentData(prev => ({ ...prev, username: value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name="password"
                placeholder="كلمة السر"
                value={currentData.password}
                onChange={value => setCurrentData(prev => ({ ...prev, password: value }))}
              />
            </Form.Group>
            <Form.Group >
                <Form.ControlLabel>الدور</Form.ControlLabel>
                <SelectPicker data={[{label: 'مشرف', value: 'admin'}, {label: 'مدير', value: 'manager_user'},{label: 'موظف', value: 'manager_user'},{label: 'شاحنة', value: 'truck_user'}]}
                 placeholder="اختر الدور"
                 value={currentData.role}
                  onChange={(value) => setCurrentData({...currentData, role: value})} block />
              </Form.Group>
            {/* Dropdown for Employees */}
            <Form.Group>
              <Form.ControlLabel>الموظف</Form.ControlLabel>
              <SelectPicker
                data={Employees.map(option => ({
                  label: option.Full_Name,
                  value: option.id,
                }))}
                placeholder="اختر الموظف"
                value={currentData.employee_id || null}
                onChange={value => setCurrentData(prev => ({
                  ...prev,
                  employee_id: value
                }))}
                block
              />
            </Form.Group>
            
            
            
            {/* Dropdown for Location */}
            <Form.Group>
              <Form.ControlLabel>الشاحنة</Form.ControlLabel>
              <SelectPicker
                data={Trucks.map(option => ({
                  label: option.id,
                  value: option.id,
                }))}
                placeholder="اختر الشاحنة"
                value={currentData.truck_id || null}
                onChange={value => setCurrentData(prev => ({
                  ...prev,
                  truck_id: value
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