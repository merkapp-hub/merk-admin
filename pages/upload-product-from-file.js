import React, { useState, useEffect, useMemo, useContext } from "react";
import * as XLSX from "xlsx";
import Table from "@/components/table";
import { userContext } from "./_app";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import currencySign from "@/utils/currencySign";

function UploadProductFromFile(props) {
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const router = useRouter();

  const [uploadedData, setUploadedData] = useState([]);
  const [data, setData] = useState([]);
  const [user] = useContext(userContext);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  useEffect(() => {
    getProduct();
  }, []);

  const getProduct = async () => {
    props.loader(true);
    Api("get", "getProduct", router).then(
      (res) => {
        props.loader(false);
        setData(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handleSubmit = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let parsedData = XLSX.utils.sheet_to_json(sheet);
  
        // Clean keys
        parsedData = parsedData.map((row) => {
          const cleanedRow = {};
          Object.keys(row).forEach((key) => {
            const cleanedKey = key.trim();
            cleanedRow[cleanedKey] = row[key];
          });
          return cleanedRow;
        });
  
        // Transform & filter
        parsedData = parsedData
          .map((row) => {
            const matchedCategory = data.find(
              (item) => item.categoryName === row.Category
            );
  
            if (!matchedCategory) return null; // Skip this row
  
            return {
              userid: user._id,
              name: row.Item_name || "",
              image: row.Photo || "",
              long_description: row.Item_Description || "",
              short_description: row.Short_Description || "",
              pieces: row.Quantity || 0,
              sold_pieces: 0,
              expirydate:
                new Date((row.Expiry_Date - 25569) * 86400 * 1000)
                  .toISOString()
                  .split("T")[0] || "",
              manufacturername: row.Manufactername,
              varients: [{ image: [row.Photo] }],
              manufactureradd: row.ManufacterAddress,
              origin: row.origin,
              categoryName: row.Category,
              category: { _id: matchedCategory?.category?._id },
              price_slot: [
                {
                  unit: row.unit,
                  value: row.unit_value,
                  our_price: row.Selling_Price,
                  other_price: row.Other_price,
                },
              ],
              slug: row.Item_name.toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, ""),
            };
          })
          .filter(Boolean); // Removes null entries
  
        setUploadedData(parsedData);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(parsedData.length / prev.itemsPerPage),
        }));
  
        console.log(parsedData);
      };
      reader.readAsBinaryString(file);
    } else {
      console.error("No file selected");
    }
  };
  

  const uploadData = async () => {
    props.loader(true);
    Api("post", "uploadAllproduct", uploadedData, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);
        if (res.status) {
          props.toaster({
            type: "success",
            message: "Item updated successfully",
          });
          setUploadedData([]);
          setFile(null);
          router.push("/inventory");
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ value }) => (
          <div className="p-4 flex items-center justify-center">
            <img
              src={value}
              alt="Product"
              className="h-[76px] w-[76px] rounded-[10px]"
            />
          </div>
        ),
      },
      {
        Header: "Product Name",
        accessor: "name",
        Cell: ({ value }) => (
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-black text-base font-normal">{value}</p>
          </div>
        ),
      },
      {
        Header: "Category",
        accessor: "categoryName",
        Cell: ({ value }) => (
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-black text-base font-normal">{value}</p>
          </div>
        ),
      },
      {
        Header: "Price",
        accessor: "price_slot[0].our_price",
        Cell: ({ value }) => (
          <div className="p-4 flex flex-col items-center justify-center">
            <p className="text-black text-base font-normal">
              {currencySign(value)}
            </p>
          </div>
        ),
      },
    ],
    []
  );

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;

  // Slice the data to pass only what's needed for the current page
  const paginatedData = uploadedData.slice(startIndex, endIndex);

  return (
    <div className="w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5 overflow-auto">
      <form className="w-full  relative">
        <div className="relative w-full">
          <div className="border rounded-md p-2 w-full bg-custom-light flex justify-start items-center text-custom-blue font-normal">
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload File:
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="ml-2"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 text-white bg-custom-darkpurple rounded-md py-2 px-4"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={uploadData}
          className="absolute right-2 mt-4 text-white bg-custom-darkpurple rounded-md py-2 px-4"
        >
          Upload Data
        </button>
      </form>
      <div className="mb-20">
        <Table
          columns={columns}
          data={paginatedData} // Pass sliced data
          currentPage={pagination.currentPage}
          setCurrentPage={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          pagination={pagination}
          setPagination={setPagination}
          pageSize={pagination.itemsPerPage}
          setPageSize={(pageSize) =>
            setPagination((prev) => ({
              ...prev,
              itemsPerPage: pageSize,
              totalPages: Math.ceil(uploadedData.length / pageSize),
              currentPage: 1, // reset to page 1 on page size change
            }))
          }
          totalPages={pagination.totalPages}
          setTotalPages={(totalPages) =>
            setPagination((prev) => ({ ...prev, totalPages }))
          }
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          itemsPerPage={pagination.itemsPerPage}
          setItemsPerPage={(itemsPerPage) =>
            setPagination((prev) => ({
              ...prev,
              itemsPerPage,
              totalPages: Math.ceil(uploadedData.length / itemsPerPage),
              currentPage: 1, // optional reset
            }))
          }
        />
      </div>
    </div>
  );
}

export default UploadProductFromFile;
