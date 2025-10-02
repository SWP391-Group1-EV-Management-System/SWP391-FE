import React from 'react';
import { Row, Col, Input, Select, Form } from 'antd';

const { Option } = Select;

const HistoryFilters = ({ searchTerm, setSearchTerm, sortOrder, setSortOrder }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Row gutter={16} align="bottom">
        <Col flex="auto">
          <Form.Item 
            label="Tìm kiếm" 
            style={{ marginBottom: 0 }}
            labelCol={{ style: { fontWeight: 600, fontSize: '1.4rem', color: '#155724' } }}
          >
            <Input
              placeholder="Tên trạm, mã giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              style={{ 
                borderRadius: '6px',
                fontSize: '1.4rem'
              }}
            />
          </Form.Item>
        </Col>
        <Col style={{ minWidth: '200px' }}>
          <Form.Item 
            label="Sắp xếp theo thời gian" 
            style={{ marginBottom: 0 }}
            labelCol={{ style: { fontWeight: 600, fontSize: '1.4rem', color: '#155724' } }}
          >
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              size="large"
              style={{ 
                width: '100%',
                fontSize: '1.4rem'
              }}
            >
              <Option value="desc">Mới nhất</Option>
              <Option value="asc">Cũ nhất</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default HistoryFilters;