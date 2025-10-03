import React, { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Tabs, 
  Row, 
  Col, 
  Space,
  Card,
  Button,
  message
} from 'antd';
import { 
  UserOutlined, 
  SettingOutlined,
  CarOutlined,
  ToolOutlined
} from '@ant-design/icons';

import ServicePackageCard from '../components/service/ServicePackageCard';
import ServicePackageTable from '../components/service/ServicePackageTable';
import ServicePackageForm from '../components/service/ServicePackageForm';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Trang chính ServicePackage sử dụng Ant Design
 * Hiển thị cả Driver View và Admin View
 * 
 * TODO: Sau này khi có phân quyền từ login context:
 * - if (userRole === 'driver') → chỉ hiển thị Driver View  
 * - if (userRole === 'admin') → chỉ hiển thị Admin View
 */
const ServicePackage = () => {
    
  // 📦 Dữ liệu gói dịch vụ (hardcode) - sau này thay bằng API call
  const [packages, setPackages] = useState([
    { 
      id: 1, 
      name: "Basic Plan", 
      description: "Gói cơ bản cho người dùng mới, phù hợp sử dụng hàng ngày với mức giá tiết kiệm", 
      price: 100000, 
      duration: "30 ngày", 
      type: "Prepaid" 
    },
    { 
      id: 2, 
      name: "Premium Plan", 
      description: "Gói cao cấp cho người dùng thường xuyên, nhiều ưu đãi và dịch vụ hỗ trợ tốt nhất", 
      price: 300000, 
      duration: "90 ngày", 
      type: "VIP" 
    },
    { 
      id: 3, 
      name: "Enterprise Plan", 
      description: "Gói dành cho doanh nghiệp với quota lớn và chính sách thanh toán linh hoạt", 
      price: 1000000, 
      duration: "365 ngày", 
      type: "Postpaid" 
    }
  ]);

  // State quản lý form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 DRIVER VIEW HANDLERS
   */

  /**
   * Xử lý đăng ký gói dịch vụ từ Driver
   */
  const handleSubscribe = (packageData) => {
    console.log('🎯 Driver đăng ký gói:', packageData);
    message.success(`Đăng ký gói "${packageData.name}" thành công!`);
    // TODO: Gọi API đăng ký gói dịch vụ
  };

  /**
   * 🔹 ADMIN VIEW HANDLERS
   */

  /**
   * Mở form thêm gói mới
   */
  const handleAddPackage = () => {
    setFormMode('add');
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  /**
   * Mở form chỉnh sửa gói
   */
  const handleEditPackage = (packageData) => {
    setFormMode('edit');
    setEditingPackage(packageData);
    setIsFormOpen(true);
  };

  /**
   * Xử lý xóa gói dịch vụ
   */
  const handleDeletePackage = (packageId) => {
    const packageToDelete = packages.find(pkg => pkg.id === packageId);
    
    setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
    message.success(`Đã xóa gói "${packageToDelete?.name}" thành công!`);
    
    console.log(`🗑️ Đã xóa gói ID: ${packageId}`);
  };

  /**
   * Xử lý submit form (thêm/sửa)
   */
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formMode === 'edit') {
        // Cập nhật gói hiện có
        setPackages(prev => 
          prev.map(pkg => 
            pkg.id === editingPackage.id 
              ? { ...pkg, ...formData }
              : pkg
          )
        );
        message.success(`Cập nhật gói "${formData.name}" thành công!`);
      } else {
        // Thêm gói mới
        const newPackage = {
          ...formData,
          id: Math.max(...packages.map(p => p.id), 0) + 1
        };
        setPackages(prev => [...prev, newPackage]);
        message.success(`Thêm gói "${formData.name}" thành công!`);
      }
      
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đóng form
   */
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  /**
   * Định nghĩa các tab items
   */
  const tabItems = [
    {
      key: 'driver',
      label: (
        <Space>
          <CarOutlined />
          Driver View
        </Space>
      ),
      children: (
        // 🔹 ĐÂY LÀ UI CỦA DRIVER
        <div style={{ padding: '20px 0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
              🔹 Chọn gói dịch vụ phù hợp
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '600px', margin: '0 auto' }}>
              Khám phá các gói dịch vụ sạc điện với nhiều ưu đãi hấp dẫn, 
              phù hợp với mọi nhu cầu sử dụng của bạn
            </Paragraph>
          </div>

          {/* Package Cards Grid */}
          {packages.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
              <Title level={3} type="secondary">
                Chưa có gói dịch vụ nào
              </Title>
              <Paragraph type="secondary">
                Hiện tại chưa có gói dịch vụ nào khả dụng
              </Paragraph>
            </Card>
          ) : (
            <Row gutter={[24, 24]} justify="center">
              {packages.map((packageData) => (
                <Col 
                  key={packageData.id}
                  xs={24} 
                  sm={12} 
                  lg={8}
                  xl={6}
                >
                  <ServicePackageCard
                    id={packageData.id}
                    name={packageData.name}
                    description={packageData.description}
                    price={packageData.price}
                    duration={packageData.duration}
                    type={packageData.type}
                    onSubscribe={handleSubscribe}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: 'admin',
      label: (
        <Space>
          <ToolOutlined />
          Admin View
        </Space>
      ),
      children: (
        // 🔹 ĐÂY LÀ UI CỦA ADMIN
        <div style={{ padding: '20px 0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ color: '#f5222d', marginBottom: '8px' }}>
              🔹 Quản lý gói dịch vụ
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '600px', margin: '0 auto' }}>
              Thêm, sửa, xóa và quản lý tất cả gói dịch vụ trong hệ thống
            </Paragraph>
          </div>

          {/* Admin Table */}
          <ServicePackageTable
            packages={packages}
            loading={loading}
            onAdd={handleAddPackage}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
          />
        </div>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={1} style={{ marginBottom: '8px' }}>
              Service Package Management
            </Title>
            <Paragraph style={{ fontSize: '18px', color: '#595959' }}>
              Quản lý và đăng ký các gói dịch vụ sạc điện
            </Paragraph>
          </div>

          {/* Main Content with Tabs */}
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
            }}
            styles={{
              body: { padding: '0' } // Fixed: Changed from bodyStyle
            }}
          >
            <Tabs 
              defaultActiveKey="driver"
              size="large"
              items={tabItems}
              tabBarStyle={{
                padding: '0 24px',
                margin: 0,
                borderBottom: '1px solid #f0f0f0'
              }}
            />
          </Card>

        </div>
      </Content>

      {/* Form Modal */}
      <ServicePackageForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={editingPackage}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    </Layout>
  );
};

export default ServicePackage;