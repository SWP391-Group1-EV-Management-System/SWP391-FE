import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
const HistoryFilters = ({
  query,
  sort,
  onChangeQuery = () => {},
  onChangeSort = () => {}
}) => {
  return (
    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(40,167,69,0.08)' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Tìm kiếm mã phiên/trạm/địa chỉ"
          prefix={<SearchOutlined />}
          style={{ width: 360 }}
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          allowClear // Thêm nút X để xóa nhanh
        />

        <Select value={sort} style={{ width: 160 }} onChange={onChangeSort}>
          <Select.Option value="desc">Mới nhất</Select.Option>
          <Select.Option value="asc">Cũ nhất</Select.Option>
        </Select>
      </Space>
    </div>
  );
};

export default HistoryFilters;
