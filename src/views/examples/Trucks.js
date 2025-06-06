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
  const [drivers, setDrivers] = useState([]); 
  const [workers, setWorkers] = useState([]); 
  const [currentData, setCurrentData] = useState({Truck_model: '',Availability:'',Plate_number: '',Remarks: '',Maintenance: '',driver: null, worker_set: [] });
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
      
      if (userPermissions && userPermissions.table_permissions["Trucks"]) {
        setPermissions({
          ...userPermissions.table_permissions["Trucks"],
          approval_chain: userPermissions.approval_chain["Trucks"] || {}
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
      fetch(`${backendUrl}/Staff/drivers/`)
      .then(response => response.json())
      .then(data => setDrivers(data));

    fetch(`${backendUrl}/Staff/workers/`)
      .then(response => response.json())
      .then(data => setWorkers(data));
      const response = await fetch(`${backendUrl}/Staff/trucks/`);
      
      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const trucksData = await response.json();
      setData(trucksData); // Update your state with the data
      return trucksData;
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
      Truck_model: currentData.Truck_model,
      Availability: currentData.Availability, 
      Plate_number: currentData.Plate_number,
      Maintenance: currentData.Maintenance, 
      Remarks: currentData.Remarks,
      driver: currentData.driver, 
      worker_set: currentData.worker_set  
    };
    console.log(payload)
  
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
            table_name: 'Truck',
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
        response = await fetch(`${backendUrl}/Staff/trucks/${currentData.id}`, {  
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        console.log("Attempting to add a new record");
        response = await fetch(`${backendUrl}/Staff/trucks/`, {  
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
  
      // Update local state with the saved/updated record
      if (isEditing) {
        setData(data.map(row => (row.id === savedRecord.id ? savedRecord : row)));
      } else {
        setData([...data, savedRecord]);
      }
    }
      // Close the modal and reset the form
      setIsModalOpen(false);
      setCurrentData({ Truck_model: '', Availability: "", Plate_number: '', Remarks: '', Maintenance: '', driver: null, worker_set: [] });
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
              table_name: 'Truck',
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
          response = await fetch(`${backendUrl}/Staff/trucks/${id}`, {
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
      return <div>يتم التحميل</div>;
    }
  
    // Don't render the table if user doesn't have view permission
    if (!permissions.view) {
      return (
        <div dir="rtl">
          <Header />
          <div style={{ margin: '20px', textAlign: 'center' }}>
            <h3>ليس لديك الصلاحية للوصول إلى هذه الصفحة</h3>
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

        <Column width={130} sortable>
          <HeaderCell className="table-header">طراز الشاحنة</HeaderCell>
          <Cell dataKey="Truck_model" />
        </Column>

        <Column width={130} sortable>
          <HeaderCell className="table-header">متاحة</HeaderCell>
          <Cell>
            {rowData => rowData.Availability ? 'نعم' : 'كلا'}
          </Cell>
        </Column>
        <Column width={150} sortable>
          <HeaderCell className="table-header">السائق</HeaderCell>
          <Cell>{rowData => {
                const driver = drivers.find(driver => driver.id === rowData.driver);
                return driver ? driver.Full_Name : 'لا يوجد سائق';
      }}</Cell>
       </Column>
       <Column width={250} flexGrow={1} sortable>
          <HeaderCell className="table-header">العمال</HeaderCell>
          <Cell> 
          {rowData => {
            const workerNames = rowData.worker_set ? rowData.worker_set.map(workerId => {
            const worker = workers.find(worker => worker.id === workerId);
            return worker ? worker.Full_Name : null;
        }).filter(name => name !== null) : [];

        return workerNames.length > 0 ? workerNames.join(', ') : 'لا يوجد عمال';
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
            <Form.Group>
              <Form.Control
                name="Truck_model"
                placeholder="طراز الشاحنة"
                value={currentData.Truck_model}
                onChange={value => setCurrentData(prev => ({ ...prev, Truck_model: value }))}
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
            <Checkbox
              name="Availability"
              checked={currentData.Availability}
              onChange={(_, checked) => setCurrentData(prev => ({ ...prev, Availability: checked }))}
            >
              متاحة
            </Checkbox>
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
              <Form.ControlLabel>السائق</Form.ControlLabel>
              <SelectPicker
                data={drivers.filter(driver => driver.Truck===null || driver.Truck === currentData.id).map(driver => ({ label: driver.Full_Name, value: driver.id }))}
                value={currentData.driver}
                onChange={value => setCurrentData(prev => ({ ...prev, driver: value }))}
                placeholder="اختر السائق"
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>العمال</Form.ControlLabel>
              <CheckboxGroup
                value={currentData.worker_set}
                onChange={value => setCurrentData(prev => ({ ...prev, worker_set: value }))}
              >
                {workers.filter(worker => worker.Truck===null || worker.Truck === currentData.id).map(worker => (
                  <Checkbox key={worker.id} value={worker.id}>
                    {worker.Full_Name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </Form.Group>
            <Form.Group>
              <Form.Control
                name="Maintenance"
                placeholder="الأعطال"
                value={currentData.Maintenance}
                onChange={value => setCurrentData(prev => ({ ...prev, Maintenance: value }))}
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