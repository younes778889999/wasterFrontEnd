import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Form } from 'rsuite';
import Header from "components/Headers/Header.js";
import 'rsuite/dist/rsuite.min.css';
import CustomPagination from 'components/CustomPagination/CustomPagination';
import '../../assets/css/TableStyles.css';

const { Column, HeaderCell, Cell } = Table;

const PendingChanges = () => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [currentChange, setCurrentChange] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const userRole=localStorage.getItem('role');
  const tableApiMap = {
    Trip: `${backendUrl}/Staff/trips/`,
    Employee: `${backendUrl}/Staff/employees/`,
    Truck: `${backendUrl}/Staff/trucks/`,
    Waste_Container: `${backendUrl}/Staff/containers/`,
    Worker: `${backendUrl}/Staff/workers/`,
    Landfill: `${backendUrl}/Staff/landfills/`,
    Complaints: `${backendUrl}/Staff/complaints/`,
    Location: `${backendUrl}/Staff/locations/`,
    Driver: `${backendUrl}/Staff/drivers/`,
  };


  const openModal = (change) => {
    setCurrentChange(change);
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      let endpoint = '';
    
      if (userRole === 'manager_user') {
        endpoint = `${backendUrl}/approvals/pending-changes/manager`;
      } else if (userRole === 'admin') {
        endpoint = `${backendUrl}/approvals/pending-changes/admin`;
      } else {
        console.error('Invalid user type');
        return;
      }
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const changesData = await response.json();
      const pendingChanges = changesData.filter(change => change.status === 'pending');
      setData(pendingChanges);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  

  const handleAction = async (action) => {
    if (!currentChange || !userRole) return;
  
    const changeId = currentChange.id;
    const updatedChange = { ...currentChange };
  
    const nowISO = new Date().toISOString();
  
    if (action === 'reject') {
      // 🟥 Reject path: only update status and reviewed_at
      try {
        await fetch(`${backendUrl}/approvals/pending-changes/${changeId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'rejected',
            reviewed_at: nowISO,
          }),
        });
  
        setIsModalOpen(false);
        fetchData();
      } catch (error) {
        console.error("Failed to reject change:", error);
      }
      return;
    }
  
    // ✅ Approve path
    // Update admin_approval or manager_approval
    if (userRole === 'admin' && !updatedChange.admin_approval) {
      updatedChange.admin_approval = true;
    }
    if (userRole === 'manager_user' && !updatedChange.manager_approval) {
      updatedChange.manager_approval = true;
    }
  
    // Save updated approval state to backend
    try {
      await fetch(`${backendUrl}/approvals/pending-changes/${changeId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_approval: updatedChange.admin_approval,
          manager_approval: updatedChange.manager_approval,
        }),
      });
    } catch (error) {
      console.error("Failed to update approval state:", error);
      return;
    }
  
    // Check if both approvals are now granted
    if (updatedChange.admin_approval  && updatedChange.manager_approval) {
      const apiUrl = tableApiMap[updatedChange.table_name];
      const objectId = updatedChange.object_id;
      const payload = updatedChange.data;
  
      try {
        // Perform the final action
        if (updatedChange.action === 'create') {
          await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else if (updatedChange.action === 'update' && objectId) {
          await fetch(`${apiUrl}${objectId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else if (updatedChange.action === 'delete' && objectId) {
          await fetch(`${apiUrl}${objectId}/`, {
            method: 'DELETE',
          });
        }
  
        // Finalize approval in PendingChange model
        await fetch(`${backendUrl}/approvals/pending-changes/${changeId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved',
            reviewed_at: nowISO,
          }),
        });
  
        setIsModalOpen(false);
        fetchData();
      } catch (error) {
        console.error("Error executing final action:", error);
      }
    } else {
      // Only one side approved, wait for other
      setIsModalOpen(false);
      fetchData();
    }
  };
  

  return (
    <div dir="rtl">
      <Header />
      <Table height={420} data={data} loading={loading} className="table">
        <Column width={50} align="center" fixed>
          <HeaderCell>الرقم</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={200} align="center" fixed>
          <HeaderCell>نوع التعديل</HeaderCell>
          <Cell dataKey="action" />
        </Column>
        <Column width={200} align="center" fixed>
          <HeaderCell>الصنف</HeaderCell>
          <Cell dataKey="table_name" />
        </Column>
        <Column width={200} align="center" flexGrow={1}>
          <HeaderCell>التاريخ</HeaderCell>
          <Cell dataKey="created_at" />
        </Column>
        
        <Column width={150} align="center" fixed>
          <HeaderCell>الإجراءات</HeaderCell>
          <Cell>
            {rowData => (
              <Button appearance="primary" onClick={() => openModal(rowData)}>
                التفاصيل
              </Button>
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

      {currentChange && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>
          <Modal.Title>تفاصيل التغيير</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentChange && (
            <>
              <p>
                <strong>نوع التغيير:</strong>{" "}
                {currentChange.action === "create"
                  ? "إضافة عنصر جديد"
                  : currentChange.action === "modify"
                  ? "تعديل عنصر موجود"
                  : currentChange.action === "delete"
                  ? "حذف عنصر"
                  : "غير معروف"}
              </p>
              <p>
                <strong>الصف:</strong> {currentChange.table_name}
              </p>
              <hr />
      
              <h4>تفاصيل العنصر:</h4>
        {currentChange.data ? (
          <ul>
            {Object.entries(currentChange.data).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value?.toString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا توجد بيانات متاحة.</p>
        )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleAction('approve')} appearance="primary">
            الموافقة
          </Button>
          <Button onClick={() => handleAction('decline')} appearance="subtle">
            رفض
          </Button>
        </Modal.Footer>
      </Modal>
      
      )}
    </div>
  );
};

export default PendingChanges;
