import React from 'react';
import { Empty, Button, Typography, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const NoDataMessage = ({ onRefresh }) => {
  return (
    <div style={{
      background: '#ffffff',
      padding: '3rem',
      borderRadius: '12px',
      border: '1px dashed rgba(40,167,69,0.08)',
      textAlign: 'center'
    }}>
      <Empty description={false} />
      <Text strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '1rem', color: '#08321a' }}>
        Không có dữ liệu lịch sử sạc
      </Text>
      <Text type="secondary" style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.2rem' }}>
        Bạn chưa có phiên sạc nào hoặc dữ liệu chưa được cập nhật.
      </Text>
      {onRefresh && (
        <Space style={{ marginTop: '1.5rem' }}>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          >
            Tải lại
          </Button>
        </Space>
      )}
    </div>
  );
};

export default NoDataMessage;