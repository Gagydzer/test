import React, { ReactNode, useMemo } from 'react';
import PropTypes from 'prop-types';
import './DataTable.css';
import { Sort, TableSorter } from '../TableSorter/TableSorter';

export type TableColumn<Rec extends Record<string, any>, Key extends keyof Rec> = {
  key: Key;
  label: string;
  renderCell: (record: Rec) => string|ReactNode
}

export type TableColumns<Rec extends Record<string, any>> = Array<TableColumn<Rec, keyof Rec>>

export type SortData<
    Rec extends Record<string, any>
    > = { key: keyof Rec; value: Sort }

export default function DataTable<Rec extends Record<string, any>>(
  {
    records, recordKey, sort, columns, onSortChange, statusText,
  }: { records: Rec[],
    recordKey: keyof Rec,
    sort: SortData<Rec>|undefined,
    onSortChange: (param: SortData<Rec>|undefined) => void,
    statusText?: string,
    columns: TableColumn<Rec, keyof Rec>[] },
) {
  const sortedRecords = useMemo(() => {
    if (!sort) return [...records];
    const comppare = (a: Rec, b: Rec) => {
      if (sort.value === 'asc') return a[sort.key] > b[sort.key] ? 1 : -1;
      else return a[sort.key] < b[sort.key] ? 1 : -1;
    };
    return [...records].sort(comppare);
  }, [records, sort]);

  const changeSort = (key: keyof Rec) => {
    if (key === sort?.key) {
      const { value } = sort;
      onSortChange(value === 'desc' ? undefined : {
        key, value: 'desc',
      });
    } else {
      onSortChange({
        key, value: 'asc',
      });
    }
  };

  const renderedStatusText = useMemo(() => statusText && (
  <div className="Table-statusText">
    { statusText }
  </div>
  ), [statusText]);

  const columnPercentWidth = useMemo(() => (columns.length ? (100 / columns.length) : 100), [columns]);

  return (
    <div className="Table-wrapper">
      { renderedStatusText }
      <table className="Table">
        <thead>
          <tr className="Table-header">
            {
              columns.map((col) => (
                <th
                  className={['TableCell', sort?.key === col.key && 'TableCell--active'].filter(Boolean).join(' ')}
                  style={{ width: `${columnPercentWidth}%` }}
                  key={col.key as string}
                  onClick={() => changeSort(col.key)}
                >
                  <div className="TableCell-label">
                    { col.label }
                    <TableSorter state={sort?.key === col.key ? sort.value : undefined} />
                  </div>
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            sortedRecords.map((record) => (
              <tr key={record[recordKey]}>
                {
                    columns.map((col) => (
                      <td
                        key={col.key as string}
                        style={{ width: `${columnPercentWidth}%` }}
                      >
                        { col.renderCell ? col.renderCell(record) : record[col.key] }
                      </td>
                    ))
                  }
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

DataTable.defaultProps = {
  sort: undefined,
  statusText: undefined,
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    renderCell: PropTypes.func,
  })).isRequired,
  sort: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.oneOf(['asc', 'desc']),
  }),
  recordKey: PropTypes.string.isRequired,
  statusText: PropTypes.string,
  records: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
};
