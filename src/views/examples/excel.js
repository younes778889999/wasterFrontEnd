import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Header from "components/Headers/Header.js";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const tableOptions = [
  { label: 'شاحنات', value: 'trucks' },
  { label: 'رحلات', value: 'trips' },
  { label: 'موظفين', value: 'employees' },
  { label: 'سائقين', value: 'drivers' },
  { label: 'عمال', value: 'workers' },
  { label: 'الحاويات', value: 'containers' },
  { label: 'المكبات', value: 'landfills' },
  { label: 'المواقع', value: 'locations' },
];

const ExcelUploader = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [jsonData, setJsonData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
    setJsonData([]);
    setFileName('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTable) {
      alert('الرجاء اختيار نوع الجدول أولاً');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Clean up empty keys (e.g., "__EMPTY") from Excel
      rawJson = rawJson.map(entry => {
        const cleaned = {};
        for (const key in entry) {
          if (key && !key.startsWith('__EMPTY')) {
            cleaned[key] = entry[key];
          }
        }
        return cleaned;
      });

      setJsonData(rawJson);
      console.log('Parsed JSON:', rawJson);
    };
    reader.readAsBinaryString(file);
  };

  const sendDataToBackend = async () => {
    if (!selectedTable || jsonData.length === 0) {
      alert('يرجى اختيار الجدول ورفع ملف يحتوي على بيانات.');
      return;
    }

    const endpoint = `${backendUrl}/Staff/${selectedTable}/`;

    try {
      // Parallel POST requests for faster upload
      const requests = jsonData.map(item =>
        axios.post(endpoint, item, {
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await Promise.all(requests);
      alert('تم رفع جميع البيانات بنجاح!');
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      alert('فشل في رفع بعض أو كل البيانات. تحقق من وحدة التحكم.');
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="bg-white rounded shadow-lg p-6 max-w-xl mx-auto text-right">
          <h2 className="text-2xl font-bold mb-4 text-center">رفع ملف Excel وتحويله</h2>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">اختر نوع الجدول:</label>
            <select
              className="w-full border rounded p-2"
              onChange={handleTableChange}
              value={selectedTable}
            >
              <option value="">-- اختر الجدول --</option>
              {tableOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">اختر ملف Excel:</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="w-full"
            />
            {fileName && <p className="mt-2 text-sm text-green-600">تم تحميل: {fileName}</p>}
          </div>

          {jsonData.length > 0 && (
            <button
              onClick={sendDataToBackend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4"
            >
              إرسال البيانات إلى جدول {tableOptions.find(t => t.value === selectedTable)?.label}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ExcelUploader;
