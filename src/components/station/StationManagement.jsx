import React, { useState } from "react";
import { Card, Button, Space, Typography, Table } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import PageHeader from "../PageHeader";
import StationForm from "./StationForm";
import useStation from "../../hooks/useStation";
import useChargingStations from "../../hooks/useChargingStations";

const { Title, Text } = Typography;

function StationManagement() {
  // Use charging stations hook for listing and explicit fetchStations
  const {
    stations: listedStations,
    loading: listLoading,
    fetchStations,
  } = useChargingStations();

  // Use station hook for create/update actions
  const { createNewStation, updateExistingStation } = useStation();

  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedStation, setSelectedStation] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Note: `useChargingStations` auto-fetches by default. No explicit effect needed here.
  const handleCreate = () => {
    setFormMode("create");
    setSelectedStation(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setFormMode("edit");
    setSelectedStation(record);
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (formMode === "create") {
        await createNewStation(values);
      } else if (formMode === "edit") {
        const stationId =
          selectedStation?.stationId ||
          selectedStation?.id ||
          selectedStation?.idChargingStation;
        await updateExistingStation(stationId, values);
      }
      // refresh list after change
      await fetchStations();
      setModalVisible(false);
      setSelectedStation(null);
    } catch (error) {
      console.error("Station form submit error:", error);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedStation(null);
  };

  const columns = [
    {
      title: "Tên trạm",
      dataIndex: "name",
      key: "name",
      render: (t) => t || "-",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (t) => t || "-",
    },
    { title: "Số trụ", dataIndex: "numberOfPosts", key: "numberOfPosts" },
    {
      title: "Người quản lý",
      dataIndex: "userManagerName",
      key: "userManagerName",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (v) => (v ? "Hoạt động" : "Ngưng"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ transition: "box-shadow 0.2s ease, transform 0.12s ease" }}
      >
        <Card
          style={{
            borderRadius: 10,
            background: "#ffffff",
            boxShadow: hovered
              ? "0 6px 18px rgba(6, 27, 18, 0.12)"
              : "0 2px 6px rgba(6, 27, 18, 0.06)",
          }}
          bodyStyle={{ padding: 16 }}
        >
          <PageHeader
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ThunderboltOutlined style={{ color: "#0b6b3d" }} /> Quản lý
                trạm
              </span>
            }
            subtitle={`Tổng số: ${listedStations.length} trạm`}
            actionButton={{
              icon: <PlusOutlined />,
              text: "Thêm trạm mới",
              onClick: handleCreate,
            }}
          />

          <Table
            rowKey={(r) =>
              r.stationId || r.id || r.idChargingStation || JSON.stringify(r)
            }
            columns={columns}
            dataSource={listedStations}
            loading={listLoading}
            style={{ marginTop: 16 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <StationForm
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleFormSubmit}
        // Map the selected station into the shape expected by StationForm
        initialValues={
          selectedStation
            ? {
                nameChargingStation:
                  selectedStation.nameChargingStation ||
                  selectedStation.name ||
                  "",
                address: selectedStation.address || "",
                numberOfPosts:
                  typeof selectedStation.numberOfPosts === "number"
                    ? selectedStation.numberOfPosts
                    : selectedStation.totalSlots || 0,
                // userManagerId may not be provided by mapper; fall back to name or empty
                userManagerId:
                  selectedStation.userManagerId ||
                  selectedStation.userManagerName ||
                  "",
                active:
                  typeof selectedStation.active === "boolean"
                    ? selectedStation.active
                    : true,
              }
            : null
        }
        loading={false}
        mode={formMode}
      />
    </div>
  );
}

export default StationManagement;
