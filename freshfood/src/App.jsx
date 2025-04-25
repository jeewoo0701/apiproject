import { useState, useEffect } from 'react';
import SearchForm from './components/search/SearchForm.jsx';
import ProductTable from './components/table/ProductTable.jsx';
import Pagination from './components/common/Pagination.jsx';
import './App.css';

// 등급에 따른 정렬 우선순위
const gradePriority = {
  '특': 1,
  '상': 2,
  '중': 3,
  '하': 4
};

function App() {
  const [productData, setProductData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('고구마');
  const [dataCount, setDataCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'GET_DATE',
    direction: 'descending'
  });
  
  // 데이터 캐싱을 위한 상태 추가
  const [cachedData, setCachedData] = useState({});

  // 전체 데이터 개수만 가져오는 함수
  const fetchTotalCount = async (productName) => {
    try {
      const searchParam = productName.trim() ? `&searchTerm=${encodeURIComponent(productName.trim())}` : '';
      const response = await fetch(`/api/proxy?startIndex=1&endIndex=1${searchParam}`);
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
        // 데이터가 없는 경우
        setTotalCount(0);
        return 0;
      }
      
      const count = data.foodAuctionItemPrice.list_total_count;
      setTotalCount(count);
      return count;
    } catch (err) {
      console.error("데이터 개수 조회 오류:", err);
      setError(err.message);
      return 0;
    }
  };

  // 필요한 데이터만 가져오는 함수
  const fetchPageData = async (productName, page, itemsPerPage) => {
    try {
      const cacheKey = `${productName}_${page}_${itemsPerPage}_${sortConfig.key}_${sortConfig.direction}`;
      
      // 이미 캐시된 데이터가 있는지 확인
      if (cachedData[cacheKey]) {
        console.log('캐시된 데이터 사용:', cacheKey);
        setProductData(cachedData[cacheKey]);
        return;
      }
      
      setLoading(true);
      
      const searchParam = productName.trim() ? `&searchTerm=${encodeURIComponent(productName.trim())}` : '';
      const startIndex = (page - 1) * itemsPerPage + 1;
      const endIndex = Math.min(page * itemsPerPage, totalCount);
      
      // 필요한 데이터 범위만 요청
      console.log(`데이터 가져오는 중 ${startIndex}~${endIndex}...`);
      
      const response = await fetch(`/api/proxy?startIndex=${startIndex}&endIndex=${endIndex}${searchParam}`);
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.foodAuctionItemPrice || !data.foodAuctionItemPrice.row) {
        setProductData([]);
        return;
      }
      
      const items = data.foodAuctionItemPrice.row;
      
      // 서버에서 가져온 데이터 정렬 (API가 이미 정렬된 데이터를 제공하지 않기 때문)
      const sortedItems = sortData(items, sortConfig);
      
      // 캐시에 저장
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: sortedItems
      }));
      
      setProductData(sortedItems);
    } catch (err) {
      console.error("데이터 가져오기 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 함수
  const sortData = (data, config) => {
    if (!config.key || !data) return data;

    return [...data].sort((a, b) => {
      if (config.key === 'GET_DATE') {
        const dateA = new Date(a.GET_DATE);
        const dateB = new Date(b.GET_DATE);
        return config.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      } 
      else if (config.key === 'G_NAME_A') {
        const gradeA = a.G_NAME_A || a.E_NAME || '';
        const gradeB = b.G_NAME_A || b.E_NAME || '';
        
        const priorityA = gradePriority[gradeA] || 999;
        const priorityB = gradePriority[gradeB] || 999;
        
        return config.direction === 'ascending' 
          ? priorityA - priorityB 
          : priorityB - priorityA;
      }
      else if (config.key === 'AV_P_A' || config.key === 'UNIT_QTY' || config.key === 'PAV_P_A' || 
              config.key === 'PAV_PY_A' || config.key === 'A_B' || config.key === 'A_C') {
        const valA = parseFloat(a[config.key]) || 0;
        const valB = parseFloat(b[config.key]) || 0;
        return config.direction === 'ascending' ? valA - valB : valB - valA;
      }
      else {
        const valA = a[config.key] || '';
        const valB = b[config.key] || '';
        return config.direction === 'ascending' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
    });
  };

  // 데이터 불러오는 메인 함수
  const fetchData = async (productName, page = 1, count = dataCount) => {
    setError(null);
    
    // 1. 총 데이터 개수 조회
    const total = await fetchTotalCount(productName);
    
    if (total === 0) {
      setProductData([]);
      setLoading(false);
      return;
    }
    
    // 2. 현재 페이지 데이터만 불러오기
    await fetchPageData(productName, page, count);
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm, currentPage, dataCount);
    }
  }, []);

  // dataCount나 정렬 설정이 변경되면 데이터 다시 로드
  useEffect(() => {
    if (searchTerm && totalCount > 0) {
      fetchPageData(searchTerm, currentPage, dataCount);
    }
  }, [sortConfig, dataCount, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    fetchData(searchTerm, 1, dataCount);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(totalCount / dataCount)) return;
    setCurrentPage(newPage);
  };

  // 정렬 방식 변경 핸들러
  const handleSortChange = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 정렬 방향 토글 핸들러
  const toggleSortDirection = () => {
    const newDirection = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    setSortConfig({
      ...sortConfig,
      direction: newDirection
    });
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / dataCount);

  return (
    <div className="App">
      <h1>농산물 도매 시장 데이터</h1>
      
      <SearchForm 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dataCount={dataCount}
        setDataCount={setDataCount}
        sortConfig={sortConfig}
        handleSearch={handleSearch}
        handleSortChange={handleSortChange}
        toggleSortDirection={toggleSortDirection}
      />
      
      {error && <p className="error">오류: {error}</p>}
      
      <p className="data-info">
        {loading ? (
          <span className="loading">데이터 로딩 중<span className="loading-dots">...</span></span>
        ) : (
          totalCount > 0 && 
          `검색된 데이터: 총 ${totalCount}개 중 ${productData.length}개 표시 (페이지 ${currentPage}/${totalPages || 1})`
        )}
      </p>
      
      <ProductTable 
        data={productData}
        loading={loading}
        error={error}
      />
      
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default App;