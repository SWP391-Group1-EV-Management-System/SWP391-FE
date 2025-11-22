import React, { useState } from "react";
import { Button, Table, Space, Tag, Switch } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import usePost from "../../hooks/usePost";
import PostForm from "./PostForm";

function PostManagement() {
  const { posts, types, loading, createNewPost, updateExistingPost } =
    usePost();

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingRecord, setEditingRecord] = useState(null);

  const openCreate = () => {
    setMode("create");
    setEditingRecord(null);
    setModalVisible(true);
  };

  const openEdit = (record) => {
    setMode("edit");
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (mode === "create") {
        await createNewPost(values);
      } else if (mode === "edit" && editingRecord) {
        const id = editingRecord.postId || editingRecord.id;
        await updateExistingPost(id, values);
      }
      setModalVisible(false);
      setEditingRecord(null);
    } catch {
      // errors handled in hook
    }
  };

  const chargingTypeMap = {};
  (types || []).forEach((t) => {
    chargingTypeMap[t.idChargingType ?? t.id] = t.nameChargingType || t.name;
  });

  const columns = [
    { title: "ID", dataIndex: "postId", key: "postId", width: 80 },
    // `name` removed: backend does not provide a separate name field for posts
    {
      title: "Loại sạc",
      dataIndex: "chargingTypes",
      key: "chargingTypes",
      render: (val) => {
        if (!Array.isArray(val)) return "-";
        return val.map((v) => chargingTypeMap[v] || `Type ${v}`).join(", ");
      },
    },
    {
      title: "Trạm ID",
      dataIndex: "chargingStationId",
      key: "chargingStationId",
    },
    {
      title: "Phí (VNĐ/kWh)",
      dataIndex: "chargingFeePerKWh",
      key: "chargingFeePerKWh",
      render: (v) => (v !== undefined && v !== null ? v : "-"),
    },
    {
      title: "Kích hoạt",
      dataIndex: "active",
      key: "active",
      render: (v) => <Switch checked={v} disabled />,
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý trụ</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm trụ
        </Button>
      </div>

      <Table
        rowKey={(r) => r.postId || r.id}
        dataSource={posts}
        columns={columns}
        loading={loading}
      />

      <PostForm
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        // Provide initial values shaped for PostForm: chargingTypes as array
        initialValues={
          editingRecord?.raw
            ? {
                chargingTypes: Array.isArray(editingRecord.chargingTypes)
                  ? editingRecord.chargingTypes
                  : editingRecord.chargingTypes
                  ? [editingRecord.chargingTypes]
                  : [],
                chargingStationId: editingRecord.chargingStationId,
                maxPower:
                  editingRecord.raw.maxPower || editingRecord.maxPower || 0,
                chargingFeePerKWh:
                  editingRecord.raw.chargingFeePerKWh ||
                  editingRecord.chargingFeePerKWh ||
                  0,
                active: editingRecord.active,
              }
            : null
        }
        loading={loading}
        mode={mode}
        types={types}
      />
    </div>
  );
}

export default PostManagement;
