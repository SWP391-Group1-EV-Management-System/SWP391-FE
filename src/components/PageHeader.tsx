import React from 'react';
import { Typography, Space, Row, Col, Card, Tag, Button } from 'antd';
import { 
  DollarOutlined, 
  ThunderboltOutlined, 
  EnvironmentOutlined, 
  PlusOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  statusTag?: {
    color: string;
    icon: React.ReactNode;
    text: string;
  };
  actionButton?: {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
  };
  customStyle?: {
    level?: 1 | 2 | 3 | 4 | 5;
    color?: string;
    fontSize?: string;
    fontWeight?: number;
    letterSpacing?: string;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  subtitle,
  statusTag,
  actionButton,
  customStyle
}) => {
  return (
    <Card
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        marginBottom: "24px",
        ...customStyle
      }}
      styles={{
        body: { padding: "24px" },
      }}
    >
      <Row align="middle" justify={statusTag || actionButton ? "space-between" : "center"} gutter={[16, 16]}>
        <Col xs={24} md={statusTag || actionButton ? 16 : 24}>
          <Space size="large" align="start">
            {icon && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  borderRadius: "16px",
                  color: "white",
                  fontSize: "32px",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <Title
                level={customStyle?.level || 2}
                style={{
                  margin: 0,
                  marginBottom: subtitle ? "8px" : 0,
                  color: customStyle?.color || "#1a1a1a",
                  fontSize: customStyle?.fontSize || "28px",
                  fontWeight: customStyle?.fontWeight || 700,
                  letterSpacing: customStyle?.letterSpacing || "0",
                }}
              >
                {title}
              </Title>
              {subtitle && (
                <Space size="small" style={{ color: "#6b7280" }}>
                  <EnvironmentOutlined style={{ fontSize: "16px" }} />
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {subtitle}
                  </Text>
                </Space>
              )}
            </div>
          </Space>
        </Col>
        {(statusTag || actionButton) && (
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space direction="vertical" size="small">
              {statusTag && (
                <Tag
                  color={statusTag.color}
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: "12px",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "16px", display: "flex", alignItems: "center" }}>
                    {typeof statusTag.icon === 'function' 
                      ? React.createElement(statusTag.icon) 
                      : statusTag.icon}
                  </span>
                  {statusTag.text}
                </Tag>
              )}
              {actionButton && (
                <Button
                  type="primary"
                  icon={actionButton.icon}
                  size="large"
                  onClick={actionButton.onClick}
                  style={{ borderRadius: '8px', backgroundColor: "#0b9459", color: "#fff"  }}
                >
                  {actionButton.text}
                </Button>
              )}
            </Space>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default PageHeader;