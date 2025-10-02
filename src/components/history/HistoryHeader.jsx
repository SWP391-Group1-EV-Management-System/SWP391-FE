import React from 'react';
import { Row, Col, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const { Title } = Typography;

const HistoryHeader = () => {
  return (
    <Row style={{ marginBottom: '2rem' }}>
      <Col span={24}>
        <div style={{
          padding: '1.5rem',
          background: '#ffffff',
          border: '1px solid #d4edda',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title 
            level={2} 
            style={{ 
              margin: 0,
              color: '#155724',
              fontSize: '2.5rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <ThunderboltOutlined 
              style={{ 
                color: '#28a745',
                fontSize: '2.5rem'
              }} 
            />
            Lịch sử sạc xe điện
          </Title>
        </div>
      </Col>
    </Row>
  );
};

export default HistoryHeader;