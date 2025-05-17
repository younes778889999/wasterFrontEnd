import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form, SelectPicker,Checkbox } from 'rsuite';
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
  const [currentData, setCurrentData] = useState({Full_Name: '', Gender: '', Age: '', Certificate: '',Phone_Number:'',Status:'',Performance_Score:'',Has_Disability:'', Position: '', Remarks: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const usertype = getUserType();
  
  const pageString  = currentPath.split('/').filter(Boolean).pop() || '';
  
  const userPermissions = permissions[usertype]?.[pageString] || { edit: false, delete: false, add: false, view: false };
  
  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.id);
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/employees/`);
      
      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const EmployeesData = await response.json();
      setData(EmployeesData); // Update your state with the data
      return EmployeesData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      Full_Name: currentData.Full_Name,
      Gender: currentData.Gender,
      Age: currentData.Age,
      Certificate: currentData.Certificate,
      Phone_Number:currentData.Phone_Number,
      Status:currentData.Status,
      Performance_Score:currentData.Performance_Score,
      Has_Disability:currentData.Has_Disability,
      Position: currentData.Position, 
      Remarks: currentData.Remarks
    };
    console.log(payload)

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${backendUrl}/Staff/employees/${currentData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/Staff/employees/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update the record' : 'Failed to add new record');
      }

      const savedRecord = await response.json();
      setData(isEditing ? data.map(row => (row.id === savedRecord.id ? savedRecord : row)) : [...data, savedRecord]);
      setIsModalOpen(false);
      setCurrentData({Full_Name: '', Gender: '', Age: '', Certificate: '',Phone_Number:'',Status:'',Performance_Score:'',Has_Disability:'', Position: '', Remarks: ''});
    } catch (error) {
      console.error('Error in save operation:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الصف؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/employees/${id}`, {
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

  return (
    <div dir="rtl">
      <Header />
      <div style={{ margin: '20px 20px' }}>
        {userPermissions.add && (
          <Button className="add-button" onClick={() => openModal()} appearance="primary" color="blue">
            <FaPlus style={{ fontSize: '20px', marginRight: '5px' }} />
            إضافة عنصر جديد
          </Button>
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
          <Column width={50} align="center"  sortable>
            <HeaderCell>رقم</HeaderCell>
            <Cell dataKey="id"/>
          </Column>
          
          <Column width={130} align="center" sortable>
            <HeaderCell>الاسم الكامل</HeaderCell>
            <Cell dataKey="Full_Name" />
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>الجنس</HeaderCell>
            <Cell>
            {rowData => rowData.Gender=='M' ? "ذكر" :"أنثى"}
          </Cell>
          </Column>
          <Column width={50} align="center" sortable>
            <HeaderCell>العمر</HeaderCell>
            <Cell dataKey="Age" />
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>رقم الجوال</HeaderCell>
            <Cell dataKey="Phone_Number" />
          </Column>
          <Column width={50} align="center"  sortable>
            <HeaderCell>التقييم</HeaderCell>
            <Cell dataKey="Performance_Score"/>
          </Column>
          <Column width={50} align="center"  sortable>
            <HeaderCell>إعاقة</HeaderCell>
            <Cell>
            {rowData => rowData.Has_Disability ? 'نعم' : 'كلا'}
          </Cell>
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>الشهادة</HeaderCell>
            <Cell dataKey="Certificate" />
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>المنصب</HeaderCell>
            <Cell dataKey="Position" />
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>الحالة</HeaderCell>
            <Cell>
            {rowData => rowData.Status=='P' ? 'دائم' : 'مؤقت'}
          </Cell>
          </Column>
          <Column width={200} align="center" sortable>
            <HeaderCell>الملاحظات</HeaderCell>
            <Cell dataKey="Remarks" />
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
            <Modal.Title>{isEditing ? 'تعديل العامل' : 'إضافة عامل جديد'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form fluid>
              {/* Form fields for workers */}
              <Form.Group controlId="fullName">
                <Form.ControlLabel>الاسم الكامل</Form.ControlLabel>
                <Form.Control name="Full_Name" value={currentData.Full_Name} onChange={(value) => setCurrentData({...currentData, Full_Name: value})} />
              </Form.Group>
              <Form.Group controlId="gender">
                <Form.ControlLabel>الجنس</Form.ControlLabel>
                <SelectPicker data={[{label: 'ذكر', value: 'M'}, {label: 'أنثى', value: 'F'}]} value={currentData.Gender} onChange={(value) => setCurrentData({...currentData, Gender: value})} block />
              </Form.Group>
              <Form.Group controlId="age">
                <Form.ControlLabel>العمر</Form.ControlLabel>
                <Form.Control name="Age" type="number" value={currentData.Age} onChange={(value) => setCurrentData({...currentData, Age: value})} />
              </Form.Group>
              <Form.Group controlId="phone_number">
                <Form.ControlLabel>رقم الجوال</Form.ControlLabel>
                <Form.Control name="Phone_Number" type="number" value={currentData.Phone_Number} onChange={(value) => setCurrentData({...currentData, Phone_Number: value})} />
              </Form.Group>
              <Form.Group controlId="performance_score">
                <Form.ControlLabel>التقييم</Form.ControlLabel>
                <Form.Control name="Performance_Score" type="number" value={currentData.Performance_Score} onChange={(value) => setCurrentData({...currentData, Performance_Score: value})} />
              </Form.Group>
              <Form.Group>
              <Checkbox
                name="Has_Disability"
                checked={currentData.Has_Disability}
                onChange={(_, checked) => setCurrentData(prev => ({ ...prev, Has_Disability: checked }))}
              >
                إعاقة
              </Checkbox>
            </Form.Group>
              <Form.Group controlId="certificate">
                <Form.ControlLabel>الشهادة</Form.ControlLabel>
                <Form.Control name="Certificate" value={currentData.Certificate} onChange={(value) => setCurrentData({...currentData, Certificate: value})} />
              </Form.Group>
              <Form.Group controlId="position">
                <Form.ControlLabel>المنصب</Form.ControlLabel>
                <Form.Control name="Position" value={currentData.Position} onChange={(value) => setCurrentData({...currentData, Position: value})} />
              </Form.Group>
              <Form.Group controlId="Status">
                <Form.ControlLabel>الحالة</Form.ControlLabel>
                <SelectPicker
                name="Status"
                data={[
                  { label: 'دائم', value: 'P' }, 
                  { label: 'مؤقت', value: 'T' }, 
                ]}
                value={currentData.Status} 
                onChange={(value) => setCurrentData({ ...currentData, Status: value })} 
                placeholder="اختر المنصب"
                block 
              />
            </Form.Group>
              <Form.Group controlId="remarks">
                <Form.ControlLabel>الملاحظات</Form.ControlLabel>
                <Form.Control name="Remarks" value={currentData.Remarks} onChange={(value) => setCurrentData({...currentData, Remarks: value})} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSave} appearance="primary">حفظ</Button>
            <Button onClick={() => setIsModalOpen(false)} appearance="subtle">إلغاء</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default App;
