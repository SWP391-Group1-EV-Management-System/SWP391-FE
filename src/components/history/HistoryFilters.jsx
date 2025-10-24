import React from 'react';
import { Row, Col, Input, Select, Button, DatePicker, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const HistoryFilters = () => {
  // Local hard-coded/disabled filter UI
  return (
    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(40,167,69,0.08)' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <RangePicker disabled allowEmpty={[true, true]} />

        <Input
          placeholder="Tìm kiếm mã/địa chỉ"
          prefix={<SearchOutlined />}
          style={{ width: 360 }}
          disabled
        />

        <Select value="desc" style={{ width: 160 }} disabled>
          <Select.Option value="desc">Mới nhất</Select.Option>
          <Select.Option value="asc">Cũ nhất</Select.Option>
        </Select>

        <Button type="primary" disabled>
          Áp dụng
        </Button>
      </Space>
    </div>
  );
};

export default HistoryFilters;
