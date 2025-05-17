import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form, SelectPicker } from 'rsuite';
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
  const [currentData, setCurrentData] = useState({
    Title: '', Description: '', Date_solved: '', Status: ''
  });
  const [descriptionModal, setDescriptionModal] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const usertype = getUserType();

  const pageString = currentPath.split('/').filter(Boolean).pop() || '';
  const userPermissions = permissions[usertype]?.[pageString] || { edit: false, delete: false, add: false, view: false };

  const openModal = (rowData = {}) => {
    setCurrentData(rowData);
    setIsEditing(!!rowData.id);
    setIsModalOpen(true);
  };

  const openDescriptionModal = (content) => {
    setDescriptionContent(content);
    setDescriptionModal(true);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/complaints/`);
      const complaintsData = await response.json();
      setData(complaintsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      Title: currentData.Title,
      Description: currentData.Description,
      Date_solved: currentData.Date_solved,
      Status: currentData.Status,
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${backendUrl}/Staff/complaints/${currentData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/Staff/complaints/`, {
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
      setCurrentData({ Title: '', Description: '', Date_solved: '', Status: '' });
    } catch (error) {
      console.error('Error in save operation:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الصف؟')) {
      try {
        const response = await fetch(`${backendUrl}/Staff/complaints/${id}`, {
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
            <Cell dataKey="id" />
          </Column>
          <Column width={150} align="center" sortable>
            <HeaderCell>عنوان الشكوى</HeaderCell>
            <Cell dataKey="Title" />
          </Column>
          <Column width={150} flexGrow={1} align="center" sortable>
            <HeaderCell>الوصف</HeaderCell>
            <Cell>
              {(rowData) => (
                <span onClick={() => openDescriptionModal(rowData.Description)} style={{ cursor: 'pointer', color: 'gray' }}>
                  {rowData.Description.slice(0, 30)}...
                </span>
              )}
            </Cell>
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>تاريخ الحل</HeaderCell>
            <Cell dataKey="Date_solved" />
          </Column>
          <Column width={100} align="center" sortable>
            <HeaderCell>الحالة</HeaderCell>
            <Cell>
              {(rowData) => (rowData.Status === 'S' ? 'محلول' : 'غير محلول')}
            </Cell>
          </Column>
          {userPermissions.edit || userPermissions.delete ? (
            <Column width={300} align="center" >
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
            <Modal.Title>{isEditing ? 'تعديل الشكوى' : 'إضافة شكوى جديدة'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form fluid>
              <Form.Group controlId="title">
                <Form.ControlLabel>عنوان الشكوى</Form.ControlLabel>
                <Form.Control name="Title" value={currentData.Title} onChange={(value) => setCurrentData({...currentData, Title: value})} />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.ControlLabel>الوصف</Form.ControlLabel>
                <Form.Control name="Description" value={currentData.Description} onChange={(value) => setCurrentData({...currentData, Description: value})} />
              </Form.Group>
              <Form.Group controlId="date_solved">
                <Form.ControlLabel>تاريخ الحل</Form.ControlLabel>
                <Form.Control name="Date_solved" type="date" value={currentData.Date_solved} onChange={(value) => setCurrentData({...currentData, Date_solved: value})} />
              </Form.Group>
              <Form.Group controlId="status">
                <Form.ControlLabel>الحالة</Form.ControlLabel>
                <SelectPicker
                  data={[{label: 'محلول', value: 'S'}, {label: 'غير محلول', value: 'U'}]}
                  value={currentData.Status}
                  onChange={(value) => setCurrentData({...currentData, Status: value})}
                  block
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSave} appearance="primary">حفظ</Button>
            <Button onClick={() => setIsModalOpen(false)}>إلغاء</Button>
          </Modal.Footer>
        </Modal>

        {/* Description Pop-up Modal */}
        <Modal open={descriptionModal} onClose={() => setDescriptionModal(false)} size="sm">
          <Modal.Header>
            <Modal.Title>الوصف الكامل</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: 'black', fontSize: '16px' }}>{descriptionContent}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setDescriptionModal(false)}>إغلاق</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default App;
