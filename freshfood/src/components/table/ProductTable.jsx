function ProductTable({ data = [], loading = false, error = null }) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>거래일</th>
              <th style={{ width: '80px' }}>시장</th>
              <th style={{ width: '120px' }}>품목명</th>
              <th style={{ width: '70px' }}>등급</th>
              <th style={{ width: '100px' }}>거래단위</th>
              <th style={{ width: '80px' }}>거래수량</th>
              <th style={{ width: '110px' }}>평균가격 (원)</th>
              <th style={{ width: '110px' }}>전일가격 (원)</th>
              <th style={{ width: '110px' }}>전년가격 (원)</th>
              <th style={{ width: '100px' }}>전일대비 (%)</th>
              <th style={{ width: '100px' }}>전년대비 (%)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan="11">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.GET_DATE}</td>
                  <td>{item.P_PS_GUBUN}</td>
                  <td>{item.PUM_MN_A}</td>
                  <td>{item.G_NAME_A || item.E_NAME}</td>
                  <td>{item.F_NAME}</td>
                  <td>{item.UNIT_QTY}</td>
                  <td>{parseInt(item.AV_P_A).toLocaleString()}원</td>
                  <td>{parseInt(item.PAV_P_A).toLocaleString()}원</td>
                  <td>{parseInt(item.PAV_PY_A).toLocaleString()}원</td>
                  <td>{parseFloat(item.A_B).toFixed(2)}%</td>
                  <td>{parseFloat(item.A_C).toFixed(2)}%</td>
                </tr>
              ))
            ) : !error ? (
              <tr className="empty-row">
                <td colSpan="11">검색 결과가 없습니다</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default ProductTable;