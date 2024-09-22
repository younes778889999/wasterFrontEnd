import React from 'react';
import { Button } from 'rsuite';

const CustomPagination = ({ total, limit, activePage, onChangePage, onChangeLimit }) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'px' }}>
      <span style={{ marginRight: '5px' }}>إجمالي الأسطر: {total}</span>
      
      <span style={{ marginRight: '5px' }}>حد الأسطر:</span>
      <select value={limit} onChange={e => onChangeLimit(parseInt(e.target.value, 10))}>
        <option value={10}>10</option>
        <option value={30}>30</option>
        <option value={50}>50</option>
      </select>
      
      <span style={{ marginRight: '2px' }}>اذهب إلى:</span>
      <input
        type="number"
        value={activePage}
        onChange={e => {
          const pageNumber = parseInt(e.target.value, 10);
          if (pageNumber > 0 && pageNumber <= totalPages) {
            onChangePage(pageNumber);
          }
        }}
        style={{ width: '60px', marginRight: '5px' }}
      />
      <Button
        disabled={activePage === 1}
        onClick={() => onChangePage(activePage - 1)}
        style={{ marginRight: '5px' }}
      >
        السابق
      </Button>
      <span style={{ margin: '0 5px' }}>{activePage} من {totalPages}</span>
      <Button
        disabled={activePage === totalPages}
        onClick={() => onChangePage(activePage + 1)}
        style={{ marginLeft: '5px' }}
      >
        التالي
      </Button>
    </div>
  );
};

export default CustomPagination;
