import React from 'react';
import { Row, Col } from 'react-bootstrap';
import HistorySessionCard from './HistorySessionCard';
import '../../assets/styles/history/HistoryList.css';

const HistoryList = ({ sessions, expandedSession, onRowClick }) => {
  return (
    <>
      {/* List Header */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center list-header">
            <h5 className="mb-0">Danh sách phiên sạc ({sessions.length})</h5>
          </div>
        </Col>
      </Row>

      {/* Session Cards */}
      <Row>
        <Col>
          {sessions.map((session) => (
            <HistorySessionCard
              key={session.charging_session_id}
              session={session}
              isExpanded={expandedSession === session.charging_session_id}
              onToggleExpand={() => onRowClick(session)}
            />
          ))}
        </Col>
      </Row>
    </>
  );
};

export default HistoryList;