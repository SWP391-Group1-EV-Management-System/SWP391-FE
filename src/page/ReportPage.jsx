// Trang quản lý báo cáo xe (Admin) - tạo và xem báo cáo chuyển quyền sở hữu xe
import React, { useEffect, useState, useMemo } from 'react';
import { Table, Spin, Input, Row, Col, message } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import ReportForm from '../components/report/ReportForm';
import useCar from '../hooks/useCar';

const ReportPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const { createReportCar, fetchAllReports } = useCar();

  // Tải toàn bộ danh sách báo cáo khi component mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAllReports();
        if (mounted) setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error('Không thể tải danh sách báo cáo');
        console.error('Lỗi khi lấy báo cáo:', error);
        if (mounted) setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchAllReports]);

  // Lọc danh sách báo cáo theo từ khóa tìm kiếm
  const filteredReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    const search = (searchText || '').trim().toUpperCase();

    if (!search) return reports;

    return reports.filter((r) => {
      const lp = (r.licensePlate || '').toString().toUpperCase();
      const ch = (r.chassisNumber || '').toString().toUpperCase();
      const title = (r.title || '').toString().toUpperCase();
      return lp.includes(search) || ch.includes(search) || title.includes(search);
    });
  }, [reports, searchText]);

  // Định nghĩa các cột của bảng báo cáo
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '15%',
    },
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: '12%',
    },
    {
      title: 'Loại xe',
      dataIndex: 'typeCar',
      key: 'typeCar',
      width: '18%',
    },
    {
      title: 'Số khung',
      dataIndex: 'chassisNumber',
      key: 'chassisNumber',
      width: '15%',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '30%',
      render: (text) => {
        if (!text) return '—';
        const str = String(text);
        return str.length > 120 ? `${str.slice(0, 120)}...` : str;
      },
    },
    {
      title: 'Chủ cũ',
      dataIndex: 'olderOwnerId',
      key: 'olderOwnerId',
      width: '14%',
    },
    {
      title: 'Chủ mới',
      dataIndex: 'newerOwnerId',
      key: 'newerOwnerId',
      width: '14%',
    },
  ];

  // Hiển thị loading khi đang tải
  if (loading && (!reports || reports.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Hiển thị giao diện chính
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header với nút Báo cáo */}
        <PageHeader
          title="Quản lý báo cáo xe (Admin)"
          icon={<FileTextOutlined />}
          subtitle="Tạo báo cáo chuyển quyền sở hữu xe"
          actionButton={{
            icon: <PlusOutlined />,
            text: "Báo cáo",
            onClick: () => setIsFormOpen(true)
          }}
        />

        {/* Bảng danh sách báo cáo */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Danh sách báo cáo chuyển xe
          </h2>

          {/* Search controls */}
          <div className="mb-4">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={16} lg={12}>
                <Input.Search
                  placeholder="Tìm kiếm theo biển số, số khung hoặc tiêu đề"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  enterButton
                  size="large"
                />
              </Col>
            </Row>
          </div>

          {!loading && (!reports || reports.length === 0) ? (
            <div className="text-gray-500 text-center py-12">
              <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', display: 'block', color: '#ccc' }} />
              Chưa có báo cáo nào trong hệ thống.
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey={(record) => record.id || record.reportID}
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Tổng số ${total} báo cáo`,
              }}
              loading={loading}
              scroll={{ x: 1200 }}
            />
          )}
        </div>
      </div>

      {/* Form tạo báo cáo */}
      <ReportForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (values) => {
          try {
            await createReportCar(values);
            message.success('Tạo báo cáo thành công!');
            // refresh danh sách sử dụng hàm từ hook
            const data = await fetchAllReports();
            setReports(Array.isArray(data) ? data : []);
            setIsFormOpen(false);
          } catch (error) {
            message.error(error.response?.data || 'Tạo báo cáo thất bại!');
            console.error('Lỗi khi tạo báo cáo:', error);
          }
        }}
      />
    </div>
  );
};

export default ReportPage;