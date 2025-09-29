import React from 'react';
import { Card, Button } from 'react-bootstrap';
import '../../assets/styles/history/NoDataMessage.css';

const NoDataMessage = ({ onClearFilter }) => {
  return (
    <div className="no-data-container">
      <Card>
        <Card.Body className="text-center">
          <div className="no-data-icon mb-3">📊</div>
          <h5>Không có dữ liệu</h5>
          <p>Không tìm thấy phiên sạc nào phù hợp với bộ lọc hiện tại.</p>
          <Button 
            variant="primary" 
            onClick={onClearFilter}
            className="mt-2"
          >
            Xóa bộ lọc
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NoDataMessage;