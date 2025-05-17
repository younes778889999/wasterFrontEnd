import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from 'components/Headers/Header.js';

const tableLabels = {
  Trucks: 'الشاحنات',
  Trips: 'الرحلات',
  Workers: 'العمال',
  Employees: 'الموظفون',
  Drivers: 'السائقون',
  Landfills: 'مكبات النفايات',
  Locations: 'المواقع',
  Waste_Containers: 'حاويات النفايات',
};

const pagesLabels = {
  Insights: 'الإحصائيات',
  Maps: 'الخرائط',
  Users: 'المستخدمين',
  Permissions: 'الصلاحيات',
  Requests: 'طلبات التعديل',
  Complaints: 'الشكاوى',
};

const permissionLabels = {
  view: 'عرض',
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
};

const approvalLabels = {
  manager: 'موافقة المدير',
  admin: 'موافقة المشرف',
};

const userTypeLabels = {
  manager_user: 'مدير',
  employee_user: 'موظف',
  admin:"مشرف"
};

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// ----------------- API FUNCTIONS -----------------

const fetchPermissions = async () => {
  const response = await axios.get(`${backendUrl}/approvals/permissions/`);
  return response.data;
};

const updatePermissionByType = async (userType, data) => {
  const response = await axios.patch(`${backendUrl}/approvals/permissions/${userType}/`, data);
  return response.data;
};

// ----------------- COMPONENT -----------------

const AdminPermissionPanel = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchPermissions().then(setPermissions);
  }, []);

  const togglePermission = (userType, table, key, isApproval = false) => {
    setPermissions((prev) =>
      prev.map((perm) => {
        if (perm.user_type !== userType) return perm;
        const target = isApproval ? 'approval_chain' : 'table_permissions';
        return {
          ...perm,
          [target]: {
            ...perm[target],
            [table]: {
              ...perm[target][table],
              [key]: !perm[target][table][key],
            },
          },
        };
      })
    );
  };

  const handleSave = async (userType) => {
    const perm = permissions.find((p) => p.user_type === userType);
    try {
      await updatePermissionByType(userType, {
        table_permissions: perm.table_permissions,
        approval_chain: perm.approval_chain,
      });
      alert(`تم حفظ الصلاحيات لـ ${userTypeLabels[userType]}`);
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const isPage = (table) => Object.keys(pagesLabels).includes(table);
  const isMainTable = (table) => Object.keys(tableLabels).includes(table);

  return (
    <>
      <Header />
      <div style={styles.page}>
        <div style={styles.panel} dir="rtl">
          <h2 style={styles.title}>إدارة الصلاحيات</h2>

          {permissions.map((p) => (
            <div key={p.user_type} style={styles.userBlock}>
              <h3 style={styles.userTitle}>{userTypeLabels[p.user_type]}</h3>

              {/* Main Tables Section */}
              <h4 style={styles.sectionTitle}>الجداول</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>الجدول</th>
                    {Object.values(permissionLabels).map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                    {Object.values(approvalLabels).map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.table_permissions)
                    .filter(([table]) => isMainTable(table))
                    .map(([table, perms]) => (
                      <tr key={table}>
                        <td>{tableLabels[table] || table}</td>
                        {Object.keys(permissionLabels).map((key) => (
                          <td key={key}>
                            <input
                              type="checkbox"
                              checked={perms[key]}
                              onChange={() =>
                                togglePermission(p.user_type, table, key)
                              }
                            />
                          </td>
                        ))}
                        {Object.keys(approvalLabels).map((role) =>
                          p.approval_chain[table]?.[role] !== undefined ? (
                            <td key={role}>
                              <input
                                type="checkbox"
                                checked={p.approval_chain[table][role]}
                                onChange={() =>
                                  togglePermission(p.user_type, table, role, true)
                                }
                              />
                            </td>
                          ) : (
                            <td key={role}>-</td>
                          )
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Pages Section */}
              <h4 style={styles.sectionTitle}>صفحات النظام</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>الصفحة</th>
                    <th>{permissionLabels.view}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.table_permissions)
                    .filter(([table]) => isPage(table))
                    .map(([table, perms]) => (
                      <tr key={table}>
                        <td>{pagesLabels[table]}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={perms.view}
                            onChange={() =>
                              togglePermission(p.user_type, table, 'view')
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <button style={styles.saveBtn} onClick={() => handleSave(p.user_type)}>
                حفظ
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ----------------- STYLES -----------------

const styles = {
  page: {
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    padding: '40px 20px',
  },
  panel: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '1000px',
    margin: 'auto',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#555',
    backgroundColor: '#f7f7f7',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '30px',
    marginBottom: '15px',
    textAlign: 'right',
  },
  userBlock: {
    marginBottom: '40px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
    marginBottom: '20px',
  },
  saveBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  userTitle: {
    fontSize: '24px',
    backgroundColor: '#e8f0fe',
    padding: '10px 20px',
    borderRadius: '8px',
    textAlign: 'right',
    direction: 'rtl',
    color: '#333',
    marginBottom: '15px',
  },
};

export default AdminPermissionPanel;
