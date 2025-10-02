import React from 'react';
import { Card, Typography, Space, Button, Alert, Divider, Spin, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined, MailOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/paymentUtils';

const { Title, Text } = Typography;

// Success Page
const SuccessPage = ({ 
  reservationData, 
  paymentMethod, 
  sendInvoiceEmail, 
  customerEmail, 
  calculateTotal 
}) => {
  return (
    <div style={{
      padding: '2rem',
      background: '#f0fdf4',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        style={{
          maxWidth: '600px',
          width: '100%',
          borderRadius: '16px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)'
        }}
        styles={{
          body: { padding: '3rem 2rem' }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Success Icon */}
          <div style={{
            fontSize: '4rem',
            color: '#10b981',
            marginBottom: '1rem'
          }}>
            <CheckCircleOutlined />
          </div>
          
          {/* Title */}
          <Title 
            level={2}
            style={{
              color: '#059669',
              fontSize: '2rem',
              fontWeight: 700,
              margin: 0
            }}
          >
            Thanh toán thành công!
          </Title>
          
          <Text style={{
            fontSize: '1.125rem',
            color: '#047857',
            marginBottom: '2rem',
            display: 'block'
          }}>
            Cảm ơn bạn đã sử dụng dịch vụ EcoCharge
          </Text>

          {/* Transaction Details */}
          <Card
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              width: '100%'
            }}
            styles={{
              body: { padding: '1.5rem' }
            }}
          >
            <Title 
              level={4}
              style={{
                color: '#374151',
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '1rem',
                textAlign: 'left'
              }}
            >
              Thông tin giao dịch
            </Title>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {[
                { label: 'Mã giao dịch', value: `#EC${Date.now().toString().slice(-6)}` },
                { label: 'Trạm sạc', value: reservationData.station },
                { label: 'Thời gian', value: new Date().toLocaleString('vi-VN') },
                { label: 'Phương thức', value: paymentMethod === 'cash' ? 'Tiền mặt' : 'Ví điện tử' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <Text style={{ 
                    color: '#6b7280', 
                    fontSize: '0.875rem', 
                    fontWeight: 500 
                  }}>
                    {item.label}:
                  </Text>
                  <Text style={{ 
                    color: '#111827', 
                    fontWeight: 600, 
                    fontSize: '0.875rem' 
                  }}>
                    {item.value}
                  </Text>
                </div>
              ))}
              
              <Divider style={{ margin: '0.5rem 0' }} />
              
              {/* Total Amount */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#10b981',
                borderRadius: '8px'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: '1rem', 
                  fontWeight: 600 
                }}>
                  Tổng thanh toán:
                </Text>
                <Text style={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  fontSize: '1.25rem' 
                }}>
                  {formatCurrency(calculateTotal())}
                </Text>
              </div>
            </Space>
          </Card>

          {/* Email Notification */}
          {sendInvoiceEmail && (
            <Alert
              message={
                <Space>
                  <MailOutlined />
                  <span>Hóa đơn điện tử đã được gửi đến: <strong>{customerEmail}</strong></span>
                </Space>
              }
              type="success"
              showIcon={false}
              style={{
                background: '#ecfdf5',
                border: '1px solid #bbf7d0',
                borderRadius: '8px'
              }}
            />
          )}

          {/* Action Button */}
          <Button 
            type="primary"
            size="large"
            onClick={() => window.location.reload()}
            style={{
              background: '#10b981',
              borderColor: '#10b981',
              borderRadius: '8px',
              fontWeight: 600,
              padding: '0.75rem 2rem',
              height: 'auto',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.borderColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.borderColor = '#10b981';
            }}
          >
            Hoàn tất
          </Button>
        </Space>
      </Card>
    </div>
  );
};

// Pending Page (Cash Payment)
const PendingPage = ({ calculateTotal }) => {
  return (
    <div style={{
      padding: '2rem',
      background: '#fffbeb',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: '16px',
          border: '1px solid #fbbf24',
          boxShadow: '0 10px 25px rgba(251, 191, 36, 0.1)'
        }}
        styles={{
          body: { padding: '3rem 2rem', textAlign: 'center' }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Pending Icon */}
          <div style={{
            fontSize: '4rem',
            color: '#f59e0b',
            marginBottom: '1rem'
          }}>
            <ClockCircleOutlined />
          </div>
          
          {/* Title */}
          <Title 
            level={2}
            style={{
              color: '#92400e',
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: 0
            }}
          >
            Đang chờ xác nhận thanh toán
          </Title>
          
          <Text style={{
            fontSize: '1.125rem',
            color: '#78350f',
            marginBottom: '2rem',
            display: 'block'
          }}>
            Vui lòng liên hệ nhân viên để xác nhận thanh toán tiền mặt
          </Text>

          {/* Amount Display */}
          <Card
            style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '12px'
            }}
            styles={{
              body: { padding: '2rem' }
            }}
          >
            <Title 
              level={1}
              style={{
                color: '#92400e',
                fontSize: '2.5rem',
                fontWeight: 700,
                margin: 0,
                marginBottom: '0.5rem'
              }}
            >
              {formatCurrency(calculateTotal())}
            </Title>
            <Text style={{
              fontSize: '1rem',
              color: '#78350f',
              fontWeight: 500
            }}>
              Số tiền cần thanh toán
            </Text>
          </Card>

          {/* Loading Indicator */}
          <Space direction="vertical" size="middle">
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 32, color: '#f59e0b' }} spin />}
              size="large"
            />
            <Text style={{
              fontSize: '1rem',
              color: '#92400e',
              fontWeight: 500
            }}>
              Đang chờ xác nhận...
            </Text>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

// Processing Page (E-wallet Payment)
const ProcessingPage = () => {
  return (
    <div style={{
      padding: '2rem',
      background: '#eff6ff',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: '16px',
          border: '1px solid #60a5fa',
          boxShadow: '0 10px 25px rgba(96, 165, 250, 0.1)'
        }}
        styles={{
          body: { padding: '3rem 2rem', textAlign: 'center' }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Processing Animation */}
          <div style={{
            fontSize: '4rem',
            color: '#3b82f6',
            marginBottom: '1rem'
          }}>
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 64, color: '#3b82f6' }} spin />}
              size="large"
            />
          </div>
          
          {/* Title */}
          <Title 
            level={2}
            style={{
              color: '#1e40af',
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: 0
            }}
          >
            Đang xử lý thanh toán
          </Title>
          
          <Text style={{
            fontSize: '1.125rem',
            color: '#1e3a8a',
            marginBottom: '1rem',
            display: 'block'
          }}>
            Đang kết nối với ví điện tử...
          </Text>

          {/* Status Tags */}
          <Space direction="vertical" size="small">
            <Tag color="processing" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
              Đang xử lý giao dịch
            </Tag>
            <Text style={{
              fontSize: '0.875rem',
              color: '#64748b',
              fontStyle: 'italic'
            }}>
              Vui lòng không tắt trình duyệt
            </Text>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

// Export as object with named components
const StatusPages = {
  Success: SuccessPage,
  Pending: PendingPage,
  Processing: ProcessingPage
};

export default StatusPages;