import React from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag, Descriptions } from 'antd';
import { 
  BarChartOutlined, 
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const HistorySessionDetail = ({ session, onBack }) => {
  if (!session) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Text style={{ fontSize: '1.5rem', color: '#666' }}>
          Không có thông tin phiên sạc
        </Text>
      </div>
    );
  }

  const isPaid = session.payment?.paid || false;
  const isDone = session.done || false;

  const rightCell = (content, extraStyle = {}) => (
    <div style={{ textAlign: 'right', fontWeight: 600, ...extraStyle }}>{content}</div>
  );

  return (
    <div style={{ 
      background: 'white',
      padding: '2rem',
      minHeight: '100vh'
    }}>
      {onBack && (
        <Button 
          icon={<ArrowLeftOutlined />}
          size="large"
          onClick={onBack}
          style={{ 
            marginBottom: '2rem',
            fontSize: '1.3rem',
            height: 'auto',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px'
          }}
        >
          Quay lại danh sách
        </Button>
      )}

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(33, 78, 43, 0.12)',
              boxShadow: '0 6px 20px rgba(40,167,69,0.08)'
            }}
            styles={{ body: { padding: '2rem' } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '3px solid rgba(40,167,69,0.18)',
                paddingBottom: '1rem'
              }}>
                <Title 
                  level={3} 
                  style={{ 
                    color: '#000',
                    fontWeight: 700,
                    margin: 0,
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <BarChartOutlined style={{ 
                    fontSize: '2.6rem',
                    background: 'linear-gradient(135deg, #28a745, #34ce57)',
                    borderRadius: '50%',
                    width: '3.6rem',
                    height: '3.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 0 0 6px rgba(32, 90, 46, 0.06)'
                  }} />
                  Chi tiết phiên sạc
                </Title>
                
                <Space>
                  <Tag 
                    icon={isDone ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={isDone ? 'success' : 'warning'}
                    style={{ 
                      fontSize: '1.3rem', 
                      padding: '0.75rem 1.5rem',
                      borderRadius: '20px',
                      fontWeight: 600
                    }}
                  >
                    {isDone ? 'Đã hoàn tất' : 'Đang sạc'}
                  </Tag>
                  <Tag 
                    icon={isPaid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={isPaid ? 'success' : 'error'}
                    style={{ 
                      fontSize: '1.3rem', 
                      padding: '0.75rem 1.5rem',
                      borderRadius: '20px',
                      fontWeight: 600
                    }}
                  >
                    {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Tag>
                </Space>
              </div>

              {/* Thay bảng HTML bằng Ant Design Descriptions */}
              <Descriptions
                bordered
                column={1}
                size="middle"
                style={{ background: '#fff', fontSize: '1.4rem' }}
              >
                <Descriptions.Item label="Mã phiên sạc:">
                  {rightCell(session.sessionId)}
                </Descriptions.Item>

                <Descriptions.Item label={<span><EnvironmentOutlined style={{ marginRight: 8, color: '#28a745' }} />Trạm sạc:</span>}>
                  {rightCell(session.station?.name || 'N/A')}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ:">
                  {rightCell(session.station?.address || 'N/A')}
                </Descriptions.Item>

                <Descriptions.Item label="Cổng sạc:">
                  {rightCell(session.post?.id || 'N/A')}
                </Descriptions.Item>

                <Descriptions.Item label="Công suất tối đa:">
                  {rightCell(`${session.post?.maxPower || 'N/A'} kW`)}
                </Descriptions.Item>

                <Descriptions.Item label={<span><ClockCircleOutlined style={{ marginRight: 8, color: '#28a745' }} />Thời gian bắt đầu:</span>}>
                  {rightCell(formatDateTime(session.startTime))}
                </Descriptions.Item>

                <Descriptions.Item label={<span><ClockCircleOutlined style={{ marginRight: 8, color: '#28a745' }} />Thời gian kết thúc:</span>}>
                  {rightCell(isDone ? formatDateTime(session.endTime) : 'Đang sạc...', { color: isDone ? '#000' : '#ff9800' })}
                </Descriptions.Item>

                <Descriptions.Item label={<span><ThunderboltOutlined style={{ marginRight: 8, color: '#28a745' }} />Năng lượng tiêu thụ:</span>}>
                  {rightCell(`${parseFloat(session.kwh || 0).toFixed(2)} kWh`, { fontSize: '1.6rem' })}
                </Descriptions.Item>

                <Descriptions.Item label={<span><DollarOutlined style={{ marginRight: 8, color: '#28a745' }} />Tổng chi phí:</span>}>
                  {rightCell(formatCurrency(session.totalAmount), { color: '#28a745', fontWeight: 700, fontSize: '1.8rem' })}
                </Descriptions.Item>

                <Descriptions.Item label={<span><CreditCardOutlined style={{ marginRight: 8, color: '#28a745' }} />Phương thức thanh toán:</span>}>
                  {rightCell(session.payment?.methodName || 'N/A')}
                </Descriptions.Item>

                {session.payment?.paidAt && (
                  <Descriptions.Item label="Thời gian thanh toán:">
                    {rightCell(formatDateTime(session.payment.paidAt))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistorySessionDetail;