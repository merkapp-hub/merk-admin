import React, { useMemo, useState, useEffect } from 'react'
import Table, { indexID } from '@/components/table'
import isAuth from '@/components/isAuth';
import { Api } from '@/services/service';
import { useRouter } from 'next/router'
import moment from 'moment';
import { Drawer, Typography, IconButton, Button } from '@mui/material';
import { IoAddSharp, IoCloseCircleOutline, IoList, IoRemoveSharp } from "react-icons/io5";

function Store(props) {
    const router = useRouter()
    const [userRquestList, setUserRquestList] = useState([]);
    const [viewPopup, setviewPopup] = useState(false)
    const [popupData, setPopupData] = useState({});
    const [openCart, setOpenCart] = useState(false)
    const [CartItem, setCartItem] = useState(0);
    const [cartData, setCartData] = useState({})

    const closeDrawer = async () => {
        setOpenCart(false);
        setCartData({})
    }

    useEffect(() => {
        getOrderBySeller()
    }, [])

    const getOrderBySeller = async () => {
        props.loader(true);
        Api("get", "getOrderBySeller ", "", router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                setUserRquestList(res.data);
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    function name({ value }) {
        return (
            < div>
                <p className='text-gray-800 text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    function email({ value }) {
        return (
            < div>
                <p className='text-gray-800 text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    function date({ value }) {
        return (
            < div>
                <p className='text-gray-800 text-base font-normal text-center'>{moment(value).format('DD MMM YYYY')}</p>
            </div>
        )
    }

    function mobile({ value }) {
        return (
            < div>
                <p className='text-gray-800 text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    const info = ({ value, row }) => {
        //console.log(row.original._id)
        return (
            <div className="flex items-center justify-center">
                <button className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]" onClick={() => {
                    setOpenCart(true)
                    setCartData(row.original)
                }}>See</button>
            </div>
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: "ID",
                // accessor: "_id",
                Cell: indexID,
            },
            {
                Header: "NAME",
                accessor: 'user.username',
                Cell: name
            },
            {
                Header: "E-mail",
                accessor: 'user.email',
                Cell: email
            },
            {
                Header: "DATE",
                accessor: 'user.createdAt',
                Cell: date
            },
            {
                Header: "Mobile",
                accessor: 'user.number',
                Cell: mobile
            },
            {
                Header: "Info",
                // accessor: "view",
                Cell: info,
            },
        ],
        []
    );

    return (
        <section className=" w-full h-full bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5">
            <p className="text-gray-800 pl-2 font-bold  md:text-[32px] text-2xl md:pb-0 pb-3">Store</p>

            <section className='px-5 pt-5 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-scroll md:mt-9 mt-5'>
                {/* shadow-2xl  */}
                <div className='bg-white border border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5'>
                    <div className='md:grid md:grid-cols-10 grid-cols-1 w-full h-full '>
                        <div className='cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5'>
                            <img className='w-[20px] h-[23px]' src='/filterImg.png' />
                        </div>
                        <div className='flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5 md:pt-0 pt-5 md:pb-0 pb-3'>
                            <p className='text-gray-800 text-sm	font-bold'>Filter By</p>
                        </div>
                        <div className='col-span-8 flex justify-start items-center '>
                        <p className='text-gray-800 font-semibold text-sm pl-3'>Date</p>
                            <input className='px-5 border text-gray-800 ml-3' type='date' placeholder='Date' />
                        </div>
                    </div>
                </div>

                <Drawer className='' open={openCart} onClose={closeDrawer} anchor={'right'}>
                    <div className='w-[310px] relative'>
                        <div className='w-full p-5'>
                            <div className='!z-50 top-0 w-full border-b border-[#00000050]'>
                                <div className='flex justify-between items-center pb-5 w-full'>
                                    <p className='text-black text-base font-normal'>Items • {CartItem}</p>
                                    <IoCloseCircleOutline className='text-black w-5 h-5' onClick={closeDrawer} />
                                </div>
                            </div>

                            {cartData?.productDetail?.map((item, i) => (
                                <div className="w-full" key={i}>
                                    <div className='grid grid-cols-4 w-full gap-2 py-5'>

                                        <div className='flex justify-center items-center'>
                                            <img className='w-[50px] h-[50px] object-contain' src={item?.image[0]} />
                                        </div>
                                        <div className='col-span-2 w-full'>
                                            <p className='text-black text-xs font-normal'>{item?.product?.name}</p>
                                            <div className="flex justify-start items-center gap-1">
                                                <p className='text-[#1A1A1A70] text-xs font-normal mr-2'>Colour:</p>
                                                <p className='md:w-[10px] w-[10px] md:h-[10px] h-[10px] rounded-full flex justify-center items-center border border-black' style={{ background: item?.color }}></p>
                                            </div>
                                            <div className="flex justify-start items-center gap-1">
                                                <p className='text-[#1A1A1A70] text-xs font-normal mr-2'>Quantaty:</p>
                                                <p className='text-black text-base font-normal'>{item?.qty}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col justify-start items-end'>
                                            <p className='text-black text-xs font-normal pt-5'>₹{item?.total || item?.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}


                            <div className='mt-5 !z-50 fixed bottom-0  flex flex-col justify-start'>
                                <button className='bg-black !w-[270px] h-[50px] rounded-[60px] text-white text-lg font-bold flex justify-center items-center mb-5' >₹{cartData?.total}</button>
                            </div>

                        </div>

                    </div>
                </Drawer>

                <div className=''>
                    <Table columns={columns} data={userRquestList} />
                </div>
            </section>
        </section>
    )
}

export default isAuth(Store)
