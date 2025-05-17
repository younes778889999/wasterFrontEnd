import React, { useEffect, useState } from "react";
import { Table, Pagination, Modal, Button, Form } from 'rsuite';
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
  const [currentData, setCurrentData] = useState({ Name: "", Population: "", Avg_waste: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [permissions, setPermissions] = useState({
    add: false,
    edit: false,
    delete: false,
    view: false,
    approval_chain: {}
  });
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const getUserType = () => {
    return localStorage.getItem('role');
  };

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
      const userPermissions = allPermissions.find(p => p.user_type === getUserType());
      
      if (userPermissions && userPermissions.table_permissions["Locations"]) {
        setPermissions({
          ...userPermissions.table_permissions["Locations"],
          approval_chain: userPermissions.approval_chain["Locations"] || {}
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/Staff/locations/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const locationsData = await response.json();
      setData(locationsData);
      return locationsData;
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
      Name: currentData.Name,
      Population: currentData.Population,
      Avg_waste: currentData.Avg_waste,
    };

    try {
      let response;
      const needsApproval = permissions.approval_chain?.admin || permissions.approval_chain?.manager;

      if (needsApproval) {
        // Prepare approval data based on approval chain
        const approvalData = {
          manager_approval: !permissions.approval_chain.manager, // False if manager needs to approve
          admin_approval: !permissions.approval_chain.admin     // False if admin needs to approve
        };

        // Auto-approve for roles that don't need to approve
        if (!permissions.approval_chain.manager) {
          approvalData.manager_approval = true;
        }
        if (!permissions.approval_chain.admin) {
          approvalData.admin_approval = true;
        }

        response = await fetch(`${backendUrl}/approvals/pending-changes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            table_name: 'Location',
            action: isEditing ? 'update' : 'create',
            data: payload,
            object_id: isEditing ? currentData.id : null,
            ...approvalData
          }),
        });

        if (response.ok) {
          const result = await response.json();
          window.alert("تم إرسال الطلب بنجاح، سيتم التعديل عند الحصول على الموافقة");
        } else {
          const errorData = await response.json();
          window.alert(`Error: ${errorData.message || "حدث خطأ في إرسال الطلب"}`);
        }
      } else {
        // No approval needed, modify directly
        if (isEditing) {
          response = await fetch(`${backendUrl}/Staff/locations/${currentData.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch(`${backendUrl}/Staff/locations/`, {
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
      }

      setIsModalOpen(false);
      setCurrentData({ Name: "", Population: "", Avg_waste: "" });
      fetchData();
    } catch (error) {
      console.error('Error in save operation:', error);
      window.alert("حدث خطأ أثناء محاولة حفظ البيانات");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الصف؟')) {
      try {
        let response;
        const needsApproval = permissions.approval_chain?.admin || permissions.approval_chain?.manager;

        if (needsApproval) {
          // Prepare approval data based on approval chain
          const approvalData = {
            manager_approval: !permissions.approval_chain.manager,
            admin_approval: !permissions.approval_chain.admin
          };

          // Auto-approve for roles that don't need to approve
          if (!permissions.approval_chain.manager) {
            approvalData.manager_approval = true;
          }
          if (!permissions.approval_chain.admin) {
            approvalData.admin_approval = true;
          }

          response = await fetch(`${backendUrl}/approvals/pending-changes/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              table_name: 'Location',
              action: 'delete',
              data: {},
              object_id: id,
              ...approvalData
            }),
          });

          if (response.ok) {
            const result = await response.json();
            window.alert("تم إرسال الطلب بنجاح، سيتم الحذف عند الحصول على الموافقة");
          } else {
            const errorData = await response.json();
            window.alert(`Error: ${errorData.message || "حدث خطأ في إرسال طلب الحذف"}`);
          }
        } else {
          // No approval needed, delete directly
          response = await fetch(`${backendUrl}/Staff/locations/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete the record');
          }

          setData(data.filter(row => row.id !== id));
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        window.alert("حدث خطأ أثناء محاولة حذف البيانات");
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
          <HeaderCell className="table-header">الاسم</HeaderCell>
          <Cell dataKey="Name" />
        </Column>
        <Column width={100} align="center" fixed sortable>
          <HeaderCell className="table-header">التعداد السكاني</HeaderCell>
          <Cell dataKey="Population" />
        </Column>
        <Column width={100} align="center" flexGrow={1} sortable>
          <HeaderCell className="table-header">متوسط كمية القمامة</HeaderCell>
          <Cell dataKey="Avg_waste" />
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>
          <Modal.Title>{isEditing ? 'تعديل البيانات' : 'إضافة بيانات جديدة'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid formValue={currentData} onChange={setCurrentData}>
            <Form.Group>
              <Form.Control
                name="Name"
                placeholder="الاسم"
                value={currentData.Name}
                onChange={value => setCurrentData(prev => ({ ...prev, Name: value }))}
              />
            </Form.Group>
            <Form.Group controlId="Population">
              <Form.ControlLabel>التعداد السكاني</Form.ControlLabel>
              <Form.Control
                name="Population"
                type="number"
                value={currentData.Population}
                onChange={(value) => 
                  setCurrentData({ ...currentData, Population: parseInt(value) || 0 })
                }
              />
            </Form.Group>
            <Form.Group controlId="Avg_waste">
              <Form.ControlLabel>متوسط كمية القمامة</Form.ControlLabel>
              <Form.Control
                name="Avg_waste"
                type="number"
                value={currentData.Avg_waste}
                onChange={(value) => 
                  setCurrentData({ ...currentData, Avg_waste: parseFloat(value) || 0 })
                }
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