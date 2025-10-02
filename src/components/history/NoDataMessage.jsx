import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { ReloadOutlined, FileSearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NoDataMessage = ({ onClearFilter }) => {
  return (
    <div style={{ 
      margin: '2rem 0',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Card
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(40, 167, 69, 0.08)',
          border: '1px solid #d4edda',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <FileSearchOutlined 
            style={{ 
              fontSize: '4rem',
              color: '#28a745',
              marginBottom: '1rem'
            }} 
          />
          
          <Title 
            level={4} 
            style={{ 
              color: '#155724',
              marginBottom: '1rem',
              fontSize: '2rem'
            }}
          >
            Không có dữ liệu
          </Title>
          
          <Text 
            style={{ 
              color: '#28a745',
              marginBottom: '2rem',
              fontSize: '1.5rem',
              display: 'block'
            }}
          >
            Không tìm thấy phiên sạc nào phù hợp với bộ lọc hiện tại.
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default NoDataMessage;