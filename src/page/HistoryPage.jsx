import React from 'react';
import { Container } from 'react-bootstrap';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryFilters from '../components/history/HistoryFilters';
import HistorySummary from '../components/history/HistorySummary';
import HistoryList from '../components/history/HistoryList';
import NoDataMessage from '../components/history/NoDataMessage';
import { useHistoryData } from '../hooks/useHistoryData';
import '../assets/styles/history/HistoryPage.css';

const HistoryPage = () => {
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    summary,
    expandedSession,
    setExpandedSession,
    loading,
    error
  } = useHistoryData();

  const handleRowClick = (session) => {
    setExpandedSession(expandedSession === session.charging_session_id ? null : session.charging_session_id);
  };

  if (loading) {
    return (
      <Container fluid className="history-page d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="loading-text">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="history-page">
        <div className="alert alert-danger text-center">
          <h5>Có lỗi xảy ra</h5>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="history-page">
      <HistoryHeader />
      
      <HistoryFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      <HistorySummary summary={summary} />
      
      {filteredData.length > 0 ? (
        <HistoryList 
          sessions={filteredData}
          expandedSession={expandedSession}
          onRowClick={handleRowClick}
        />
      ) : (
        <NoDataMessage onClearFilter={() => setSearchTerm('')} />
      )}
    </Container>
  );
};

export default HistoryPage;
