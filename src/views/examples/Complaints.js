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
  const [filterEmployee, setFilterEmployee] = useState(false); 
  const [filterRequest, setFilterRequest] = useState(false);
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

  const getFilteredData = () => {
    return data.filter(item => {
      // Employee filter
      if (filterEmployee !== null && item.is_employee !== filterEmployee) {
        return false;
      }
      // Request filter
      if (filterRequest !== null && item.request !== filterRequest) {
        return false;
      }
      return true;
    });
  };

  const getData = () => {
    const filteredData = getFilteredData();
    const sortedData = [...filteredData];
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

        {/* Dropdown filter for employee */}
        <Form.Group controlId="employeeFilter" style={{ marginBottom: 10 }}>
          <SelectPicker
            data={[
              { label: 'مواطنين', value: false },
              { label: 'موظفين', value: true },
            ]}
            placeholder="فلتر حسب الموظف"
            style={{ width: 200 }}
            value={filterEmployee}
            onChange={(value) => {
              setFilterEmployee(value);
              setPage(1); // reset to page 1 after filter change
            }}
            cleanable={false}
            searchable={false}
          />
        </Form.Group>
        <Form.Group controlId="requestFilter" style={{ marginBottom: 10 }}>
          <SelectPicker
            data={[
              { label: 'شكاوى', value: false },
              { label: 'طلبات', value: true },
            ]}
            placeholder="فلتر حسب النوع"
            style={{ width: 200 }}
            value={filterRequest}
            onChange={(value) => {
              setFilterRequest(value);
              setPage(1);
            }}
            cleanable={false}
            searchable={false}
          />
        </Form.Group>
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
                        تفاصيل
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
          total={getFilteredData().length}
          limit={limit}
          activePage={page}
          onLimitChange={setLimit}
          onPageChange={setPage}
        />
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="sm" dir="rtl">
  <Modal.Header>
    <Modal.Title>تفاصيل الشكوى</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div><strong>عنوان الشكوى:</strong> {currentData.Title}</div>
    <div><strong>الوصف:</strong> {currentData.Description}</div>
    <div><strong>الاسم</strong> {currentData.Name}</div>
    <div><strong>الرقم</strong> {currentData.Number}</div>
    <div><strong>تاريخ الإرسال</strong> {currentData.Date_filed}</div>
    <div><strong>الحالة:</strong> {currentData.Status === 'S' ? 'محلول' : 'غير محلول'}</div>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={() => setIsModalOpen(false)} appearance="subtle">
      إغلاق
    </Button>
  </Modal.Footer>
</Modal>
      </div>
    </div>
  );
};

export default App;
