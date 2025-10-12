import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { formatDateTime, formatCurrency } from '../../utils/historyHelpers';

const { Title, Text } = Typography;

const HistorySessionDetail = ({ session }) => {
  const detailItemStyle = {
    padding: '1.5rem',
    border: '1px solid #d4edda',
    background: 'linear-gradient(135deg, #ffffff, #f8fffe)',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fffe, #f0f9f0)',
      padding: '2rem'
    }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #d4edda',
              borderLeft: '4px solid #28a745',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.08)',
              height: '100%'
            }}
            styles={{ 
              body: { padding: '2rem' }
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title 
                level={4} 
                style={{ 
                  color: 'black', 
                  fontWeight: 700,
                  marginBottom: '2rem',
                  borderBottom: '3px solid #28a745',
                  paddingBottom: '1rem',
                  fontSize: '1.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#fff', // nền trắng
                  boxShadow: '0 2px 8px rgba(40,167,69,0.07)'
                }}
              >
                <BarChartOutlined style={{ 
                  fontSize: '2.6rem',
                  background: 'linear-gradient(135deg, #28a745, #34ce57)', // icon xanh lá
                  borderRadius: '50%',
                  width: '3.6rem',
                  height: '3.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 0 0 4px #eafaf1' // viền xanh lá nhạt quanh icon
                }} />
                Thông tin chi tiết
              </Title>
              
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#fff', // nền trắng
                  boxShadow: 'none',
                  border: '1px solid #28a745', // viền xanh lá
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '1.7rem'
                }}
              >
                <tbody>
                  {[
                    { label: 'Mã phiên sạc:', value: session.charging_session_id },
                    { label: 'Công suất tối đa:', value: `${session.max_power || session.maxPower || 'N/A'} kW` },
                    { label: 'Công suất trung bình:', value: `${session.avgPower || 'N/A'} kW` },
                    { label: 'Pin đầu:', value: `${session.batteryStart || 'N/A'}%` },
                    { label: 'Pin cuối:', value: `${session.batteryEnd || 'N/A'}%` }
                  ].map((item, index) => (
                    <tr key={index} style={{ borderBottom: index !== 4 ? '1px solid #e9ecef' : 'none' }}>
                      <td
                        style={{
                          padding: '1.5rem 2.5rem',
                          color: '#212529', // chữ đen
                          fontWeight: 700,
                          fontSize: '1.35rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          width: '50%',
                          background: index % 2 === 0 ? '#f8fffe' : '#fff', // nền trắng/xanh lá nhạt xen kẽ
                          borderLeft: '4px solid #28a745' // viền xanh lá bên trái
                        }}
                      >
                        {item.label}
                      </td>
                      <td
                        style={{
                          padding: '1.5rem 2.5rem',
                          color: '#212529', // chữ đen
                          fontWeight: 700,
                          fontSize: '1.45rem',
                          textAlign: 'right',
                          background: index % 2 === 0 ? '#fff' : '#eafaf1', // nền trắng/xanh lá nhạt xen kẽ
                          borderRight: '4px solid #28a745' // viền xanh lá bên phải
                        }}
                      >
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistorySessionDetail;