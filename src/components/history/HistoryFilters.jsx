import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import '../../assets/styles/history/HistoryFilters.css';

const HistoryFilters = ({ searchTerm, setSearchTerm, sortOrder, setSortOrder }) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex gap-3 align-items-end">
          <div className="flex-grow-1">
            <Form.Group className="mb-0">
              <Form.Label htmlFor="searchInput">Tìm kiếm</Form.Label>
              <Form.Control
                id="searchInput"
                name="searchInput"
                type="text"
                placeholder="Tên trạm, mã giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </div>
          <div style={{ minWidth: '200px' }}>
            <Form.Group className="mb-0">
              <Form.Label htmlFor="sortSelect">Sắp xếp theo thời gian</Form.Label>
              <Form.Select
                id="sortSelect"
                name="sortSelect"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default HistoryFilters;