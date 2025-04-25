import { useState, useRef, useEffect } from 'react';

// 정렬 옵션 리스트
const sortOptions = [
  { key: 'GET_DATE', label: '거래일' },
  { key: 'P_PS_GUBUN', label: '시장' },
  { key: 'PUM_MN_A', label: '품목명' },
  { key: 'G_NAME_A', label: '등급' },
  { key: 'F_NAME', label: '거래단위' },
  { key: 'UNIT_QTY', label: '거래수량' },
  { key: 'AV_P_A', label: '평균가격' },
  { key: 'PAV_P_A', label: '전일가격' },
  { key: 'PAV_PY_A', label: '전년가격' },
  { key: 'A_B', label: '전일대비(%)' },
  { key: 'A_C', label: '전년대비(%)' }
];

function SearchForm({ 
  searchTerm, 
  setSearchTerm, 
  dataCount, 
  setDataCount, 
  sortConfig, 
  handleSearch, 
  handleSortChange, 
  toggleSortDirection 
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 정렬 기능 레이블 표시
  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.key === sortConfig.key);
    return option ? option.label : '거래일';
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-container">
        <div className="input-group">
          <label htmlFor="search-term">품목명:</label>
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="품목명 입력 (예: 고구마, 사과)"
            className="search-input"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="data-count">데이터 수:</label>
          <input
            id="data-count"
            type="number"
            value={dataCount}
            min="1"
            max="1000"
            onChange={(e) => setDataCount(Math.max(1, parseInt(e.target.value) || 100))}
            className="count-input"
          />
        </div>
        
        <div className="sort-dropdown-container" ref={sortDropdownRef}>
          <div className="sort-button-group">
            <button 
              type="button"
              className="sort-button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              정렬: {getSortLabel()} {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
            <button 
              type="button"
              className="direction-button"
              onClick={toggleSortDirection}
            >
              {sortConfig.direction === 'ascending' ? '오름차순' : '내림차순'}
            </button>
          </div>
          
          {showSortDropdown && (
            <div className="sort-dropdown">
              <ul>
                {sortOptions.map((option) => (
                  <li 
                    key={option.key}
                    className={sortConfig.key === option.key ? 'active' : ''}
                    onClick={() => {
                      handleSortChange(option.key);
                      setShowSortDropdown(false);
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={sortConfig.key === option.key} 
                      readOnly 
                    />
                    <span>{option.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button type="submit" className="search-button">검색</button>
      </div>
    </form>
  );
}

export default SearchForm;