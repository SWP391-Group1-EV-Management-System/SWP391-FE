import React from "react";
import { Row, Col, Input, Select, Form } from "antd";
import "../../assets/styles/HistoryFilters.css";

const { Option } = Select;

const HistoryFilters = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="history-filters-container">
      <Row gutter={16} align="bottom">
        <Col flex="auto">
          <Form.Item
            label="Tìm kiếm"
            className="history-filters-form-item"
            labelCol={{ className: "history-filters-label" }}
          >
            <Input
              placeholder="Tên trạm, mã giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              className="history-search-input"
            />
          </Form.Item>
        </Col>
        <Col className="history-sort-column">
          <Form.Item
            label="Sắp xếp theo thời gian"
            className="history-filters-form-item"
            labelCol={{ className: "history-filters-label" }}
          >
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              size="large"
              className="history-sort-select"
            >
              <Option value="desc">Mới nhất</Option>
              <Option value="asc">Cũ nhất</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default HistoryFilters;
