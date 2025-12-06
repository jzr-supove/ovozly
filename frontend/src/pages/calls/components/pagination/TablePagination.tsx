import { Pagination } from "antd";
import React from "react";

type PropsType = {
  total?: number;
  page?: number;
  setPage?: (page: number) => void;
  pageSize?: number;
  pagination?: boolean;
};

const TablePagination: React.FC<PropsType> = ({
  total,
  page,
  setPage,
  pageSize = 10,
  pagination,
}) => {
  return (
    <div className="d-flex align-items-center justify-content-between ps-3 w-100 pt-4">
      <span className="fw-bold">Total: {total}</span>
      {pagination === false ? (
        <></>
      ) : (
        <div>
          <Pagination
            total={total}
            pageSize={pageSize}
            showSizeChanger={false}
            defaultCurrent={1}
            responsive={true}
            current={page}
            onChange={(page) => setPage && setPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default TablePagination;
