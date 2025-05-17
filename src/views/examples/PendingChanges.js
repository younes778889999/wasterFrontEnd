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

  const openModal = (change) => {
    setCurrentChange(change);
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${backendUrl}/approvals/pending-changes/`);
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
    if (!currentChange) return;
    
    // Define the appropriate endpoint based on action
    const endpoint = action === 'approve' 
      ? `${backendUrl}/approvals/approve-change/${currentChange.id}/`
      : `${backendUrl}/approvals/reject-change/${currentChange.id}/`;
  
    try {
      const response = await fetch(endpoint, {
        method: 'GET', // Change to GET as required by your API
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${action} the change`);
      }
  
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error processing change:', error);
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
