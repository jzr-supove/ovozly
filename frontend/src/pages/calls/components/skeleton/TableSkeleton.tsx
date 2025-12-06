import { Skeleton, SkeletonProps, Table } from "antd";
import { ColumnsType } from "antd/lib/table";

export type SkeletonTableColumnsType = {
  key: string;
};

type SkeletonTableProps = SkeletonProps & {
  columns: ColumnsType<SkeletonTableColumnsType>;
  rowCount?: number;
};

export default function TableSkeleton({
  loading = false,
  active = true,
  rowCount = 11,
  columns,
  children,
  className = "",
}: SkeletonTableProps): JSX.Element {
  return loading ? (
    <Table
      rowKey="key"
      pagination={false}
      scroll={{ y: "calc(100vh - 370px)" }}
      dataSource={[...Array(rowCount)].map((_, index) => ({
        key: `key${index}`,
      }))}
      className="calls-table"
      columns={columns.map((column) => {
        return {
          ...column,
          render: function renderPlaceholder() {
            return (
              <Skeleton
                key={column.key}
                title
                active={active}
                paragraph={false}
                className={className}
                round={true}
              />
            );
          },
        };
      })}
    />
  ) : (
    <>{children}</>
  );
}
