import React, { useState, useContext, useEffect, useMemo } from 'react';
import isAuth from '@/components/isAuth';
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import { userContext } from './_app';
import Table from '@/components/table';
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

function SaleProduct(props) {
    const router = useRouter();
    const [productsList, setProductsList] = useState([]);
    const [user, setUser] = useContext(userContext);
    const [popupData, setPopupData] = useState({});
    const [viewPopup, setviewPopup] = useState(false)
    const [saleData, setSaleData] = useState([])
    const [countdown, setCountdown] = useState([]);

    useEffect(() => {
        if (user?._id) {
            getSale()
        }
    }, [user])



    const endSale = async () => {
        props.loader(true);

        Api("delete", `deleteSale?SellerId=${user._id}`, router).then(
            (res) => {
                props.loader(false);
                if (res.status) {
                    props.toaster({ type: "success", message: "Sale ended successfully" });
                    getSale()
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const deleteProduct = async (_id) => {

        Swal.fire({
            text: "You want to Remove this product from sale ? ",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            confirmButtonColor: "#d33",
            customClass: {
                actions: 'swal2-actions-no-hover',
                popup: 'rounded-[5px] shadow-[#d33]'
            },
            buttonsStyling: true,
            reverseButtons: true,
            width: '320px'
        }).then(function (result) {
            if (result.isConfirmed) {
                const data = {
                    _id,
                    SellerId:user._id
                };

                Api("post", "deleteFlashSaleProduct", data, router).then(
                    (res) => {
                        props.loader(false);
                        if (res.status) {
                            props.toaster({ type: "success", message: "Product Remove from Sale successfully" });
                          getSale()
                        }
                    },
                    (err) => {
                        props.loader(false);
                        console.log(err);
                        props.toaster({ type: "error", message: err?.message });
                    }
                );
            } else if (result.isDenied) {
            }
        });
    };


    const getSale = async () => {
        props.loader(true);

        Api("get", `getFlashSale?SellerId=${user._id}`, router).then(
            (res) => {
                props.loader(false);
                if (res.status) {
                    setSaleData(res.data)
                    console.log(res.data)
                    console.log(res.data[0]?.products)
                    setProductsList(res.data[0]?.products
);
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const image = ({ row }) => {

        return (
            <div className="p-4 flex items-center justify-center">
                {
                    row.original && row.original.varients && row.original.varients.length > 0 && <img className='h-[76px] w-[76px] rounded-[10px]'
                        src={row.original.varients[0].image[0]}
                    />}
            </div>
        );
    };

    const productName = ({ value }) => {
        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <p className="text-black text-base font-normal">{value.slice(0,28)+("...")}</p>
            </div>
        );
    };

    const category = ({ value }) => {
        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <p className="text-black text-base font-normal">{value}</p>
            </div>
        );
    };

    const actionHandler = ({ value, row }) => {
        return (
            <div className=" flex items-center justify-center  ">
                <div className="py-[10px] border rounded-[10px] mr-[10px] border-custom-offWhite w-[30%] items-center flex justify-center cursor-pointer"
                    onClick={() => {
                        // setviewPopup(row.original)
                        deleteProduct(row.original._id)
                    }}
                >
                    <MdDelete className='text-2xl' />
                </div>

            </div>
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: "Image",
                accessor: "username",
                Cell: image,
            },
            {
                Header: "Product Name",
                accessor: "name",
                Cell: productName,
            },
            {
                Header: "Category",
                accessor: "categoryName",
                Cell: category,
            },
            {
                Header: "ACTION",
                Cell: actionHandler,
            },
        ],
        []
    );

    useEffect(() => {
        const calculateCountdown = () => {
            
            const nowIndia = new Date().getTime();
            
            const newCountdown = saleData.map(sale => {
                const startDate = new Date(sale.startDateTime).getTime();
                const endDate = new Date(sale.endDateTime).getTime();
                
                if (nowIndia < startDate) {
                    return { ...sale, timeLeft: null, status: 'Sale will start soon' };
                } else if (nowIndia >= startDate && nowIndia < endDate) {
                    const distance = endDate - nowIndia;
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    return {
                        ...sale,
                        timeLeft: { days, hours, minutes, seconds },
                        status: 'Sale is live'
                    };
                } else {
                    return { ...sale, timeLeft: null, status: 'Sale has ended' };
                }
            });
            
            setCountdown(newCountdown);
        };
        
        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, [saleData]);

    return (
        <div className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
            <div className='md:pt-[0px] pt-[0px] h-full'>
                <div className='flex justify-between'>
                    <p className="text-black font-bold md:text-[32px] text-2xl">Flash Sale</p>
                    <div className='flex '>
                        <div className="p-2  rounded-lg">

                            {countdown.map((sale, index) => (
                                <div key={index} className="p-4 bg-white rounded-lg shadow-lg">
                                    <h3 className="text-xl text-black font-semibold">Status</h3>
                                    {sale.timeLeft ? (
                                        <div className="flex space-x-4 mt-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.days}</span>
                                                <span className="text-sm text-gray-500">Days</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.hours}</span>
                                                <span className="text-sm text-gray-500">Hours</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.minutes}</span>
                                                <span className="text-sm text-gray-500">Minutes</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.seconds}</span>
                                                <span className="text-sm text-gray-500">Seconds</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-red-600">{sale.status}</p>
                                    )}
                                </div>
                            ))}

                        </div>


                    </div>
                </div>
                <div className="bg-white h-full pt-2 md:pb-48 pb-28  px-5  rounded-[12px] overflow-scroll md:mt-5 mt-5">

                    <div className="">
                        <div className='flex md:flex-row flex-col md:justify-end md:items-end gap-3'>

                            <button className='text-white bg-[#26004d] px-5 py-2.5 rounded'
                                onClick={() => router.push("/AddSale")}
                            >
                                Add Sale
                            </button>
                            <button className='text-white bg-[#26004d] px-5 py-2.5 rounded'
                                onClick={endSale}
                            >
                                End Sale
                            </button>

                        </div>
                        {productsList?.length > 0 ? (
                            <Table columns={columns} data={productsList} />
                        ) : (
                            <div className='text-black text-[20px] text-center mt-52'>No Sale is Live</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default isAuth(SaleProduct);