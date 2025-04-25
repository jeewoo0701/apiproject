function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = [];
  const maxPageButtons = 5;
  
  // 시작 페이지와 끝 페이지 계산
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  // 끝 페이지가 최대 페이지 버튼 수보다 작을 경우 시작 페이지 조정
  if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  // 페이지 번호 배열 생성
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
        className="page-button"
      >
        {'<<'}
      </button>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="page-button"
      >
        {'<'}
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`page-button ${currentPage === number ? 'active' : ''}`}
        >
          {number}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="page-button"
      >
        {'>'}
      </button>
      <button 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        className="page-button"
      >
        {'>>'}
      </button>
    </div>
  );
}

export default Pagination;  