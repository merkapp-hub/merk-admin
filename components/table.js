import React, { useEffect } from "react";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
  useRowSelect,
} from "react-table";
import { Button, PageButton } from "./buttons";
import { SortIcon, SortUpIcon, SortDownIcon } from "./icons";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);

  const onChange = (value) => {
    setGlobalFilter(value || undefined);
  };

  return (
    <label className="w-full flex justify-end items-center gap-x-2 md:items-baseline md:px-0 py-5">
      {/* <span className="text-black md:text-base text-xs ">Global Search: </span> */}
      {/* <button type="button" className="text-white bg-yellow-600 px-4 py-2 rounded-md">Add items</button> */}
      {/* <input
        type="text"
        className="rounded-md  p-2 w-96 border border-[#B9B9B9] shadow-sm outline-none"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      /> */}
    </label>
  );
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-700">{render("Header")}: </span>
      <select
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : "unknown";

  return <span className="text-white text-sm">{status}</span>;
}

export function AvatarCell({ value, column, row }) {
  return (
    <div className="flex items-center">
      <div className="ml-4">
        <div className="text-sm font-medium text-white">{value}</div>
        {/* <div className="text-sm text-gray-500">
          {row.original[column.emailAccessor]}
        </div> */}
      </div>
    </div>
  );
}

function Table({
  columns,
  data,
  refs,
  pagination,
  onPageChange,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  itemsPerPage,
  enableRowSelect = false,
  handleSelectAll
}) {
  const tableHooks = [useFilters, useGlobalFilter, useSortBy, usePagination];
  if (enableRowSelect) tableHooks.push(useRowSelect);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    ...tableHooks,
    ...(enableRowSelect
      ? [
        (hooks) => {
          hooks.visibleColumns.push((columns) => [
            {
              id: "selection",
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <div className="checkbox-wrapper-13 mt-0.5" onClick={handleSelectAll}>
                  <input id="c1-13" type="checkbox" {...getToggleAllRowsSelectedProps()} />
                </div>
              ),
              Cell: ({ row }) => (
                <div className="checkbox-wrapper-13 ml-1.5">
                  <input id="c1-13" type="checkbox" {...row.getToggleRowSelectedProps()} />
                </div>
              ),
            },
            ...columns,
          ]);
        },
      ]
      : [])
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state: tableState,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = tableInstance;

  const defaultExpandedRows = data.map((element, index) => {
    return { index: true };
  });

  return (
    <>
      <div className="sm:flex sm:gap-x-2">
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={tableState.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((column) =>
            column.Filter ? (
              <div className="mt-2 sm:mt-0" key={column.id}>
                {column.render("Filter")}
              </div>
            ) : null
          )
        )}
      </div>
      {/* table */}
      <div className="flex flex-col h-auto">
        <div className="-my-2 overflow-x-auto">
          <div className="align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden sm:rounded-lg">
              <table
                {...getTableProps()}
                className="min-w-full rounded-xl border border-[#B9B9B9] divide-y divide-[#B9B9B9] text-sm"
                ref={refs}
              >
                <thead className="bg-transparent border-b-[1px] border-[#B9B9B9] rounded-xl pb-1 !bg-gray-200">
                  {headerGroups.map((headerGroup, index) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                      {headerGroup.headers.map((column, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="group pl-2 py-3 text-md font-medium text-black text-left tracking-wider"
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                        >
                          <div className="flex items-center justify-center">
                            {column.render("Header")}
                            {/* Add a sort direction indicator */}
                            <span>
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <SortDownIcon className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <SortUpIcon className="w-4 h-4 text-gray-400" />
                                )
                              ) : (
                                <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-[#B9B9B9] "
                >
                  {rows.map((row, i) => {
                    // new
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={i}>
                        {row.cells.map((cell, index) => {
                          return (
                            <td
                              key={index}
                              {...cell.getCellProps()}
                              className="pl-2 py-3 whitespace-nowrap text-white text-left"
                              role="cell"
                            >
                              {
                                cell?.column?.Cell?.name ===
                                  "defaultRenderer" ? (
                                  <div className="text-sm text-black ">
                                    {cell?.render("Cell")}
                                  </div>
                                ) : (
                                  <div className="text-sm text-black ">
                                    {cell?.render("Cell")}
                                  </div>
                                )
                                // (cell.render("Cell"))
                              }
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="py-3 flex items-center justify-between d_none">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            onClick={() => {
              if (pagination?.currentPage > 1) onPageChange(pagination.currentPage - 1);
            }}
            disabled={pagination?.currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (pagination?.currentPage < pagination?.totalPages)
                onPageChange(pagination.currentPage + 1);
            }}
            disabled={pagination?.currentPage === pagination?.totalPages}
          >
            Next
          </Button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2 items-baseline">
            
            <span className="text-sm text-black">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{pagination?.totalPages}</span>
            </span>
            <label>
              <span className="sr-only">Items Per Page</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black p-2"
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  console.log("Changing page size to:", newSize);  //
                  setPageSize(newSize);
                  // setCurrentPage(1); // Reset page when changing size
                }}
              >
                {[5, 10, 15].map((size) => (
                  <option key={size} className="text-black" value={size}>
                    Show {size}
                  </option>
                ))}
              </select>

            </label>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              {/* First Page Button */}
              <PageButton
                className="rounded-l-md"
                onClick={() => onPageChange(1)}
                disabled={pagination?.currentPage === 1}
              >
                <span className="sr-only">First</span>
                <MdOutlineKeyboardDoubleArrowLeft
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>

              {/* Previous Page Button */}
              <PageButton
                onClick={() => onPageChange(pagination?.currentPage - 1)}
                disabled={pagination?.currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <MdKeyboardArrowLeft
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>

              {/* Next Page Button */}
              <PageButton
                onClick={() => onPageChange(pagination?.currentPage + 1)}
                disabled={pagination?.currentPage === pagination?.totalPages}
              >
                <span className="sr-only">Next</span>
                <MdOutlineKeyboardArrowRight
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>

              {/* Last Page Button */}
              <PageButton
                className="rounded-r-md"
                onClick={() => onPageChange(pagination?.totalPages)}
                disabled={pagination?.currentPage === pagination?.totalPages}
              >
                <span className="sr-only">Last</span>
                <MdOutlineKeyboardDoubleArrowRight
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>
            </nav>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-between items-center p-4 border-t bg-gray-100">
        <button
          className={`px-4 py-2 rounded ${
            pagination?.currentPage === 1 ? "opacity-50 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
          onClick={() => onPageChange(pagination?.currentPage - 1)}
          disabled={pagination?.currentPage === 1}
        >
          Previous
        </button>

        <span className="text-sm">
          Page <strong>{pagination?.currentPage}</strong> of {pagination?.totalPages}
        </span>

        <button
          className={`px-4 py-2 rounded ${
            pagination?.currentPage === pagination?.totalPages
              ? "opacity-50 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
          onClick={() => onPageChange(pagination?.currentPage + 1)}
          disabled={pagination?.currentPage === pagination?.totalPages}
        >
          Next
        </button>
      </div> */}
    </>
  );
}

export default Table;
