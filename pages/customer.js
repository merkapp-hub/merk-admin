import React, { useMemo, useState, useEffect } from 'react'
import Table, { indexID } from '@/components/table'
import { Api } from '@/services/service';
import { useRouter } from 'next/router'
import moment from 'moment';
import { RxCrossCircled } from 'react-icons/rx'
import isAuth from '@/components/isAuth';

function customer(props) {
    const router = useRouter()
    const [customerData, setCustomerData] = useState([]);
    const [viewPopup, setviewPopup] = useState(false)
    const [popupData, setPopupData] = useState({});

    useEffect(() => {
        getuserlist()
    }, [])

    const getuserlist = async () => {
        props.loader(true);
        Api("get", "getuserlist/USER", "", router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                setCustomerData(res.data);
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
                <p className='text-custom-black text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    function email({ value }) {
        return (
            < div>
                <p className='text-custom-black text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    function date({ value }) {
        return (
            < div>
                <p className='text-custom-black text-base font-normal text-center'>{moment(value).format('DD MMM YYYY')}</p>
            </div>
        )
    }

    function mobile({ value }) {
        return (
            < div>
                <p className='text-custom-black text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    const info = ({ value, row }) => {
        //console.log(row.original._id)
        return (
            <div className="flex items-center justify-center">
                <button className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]" onClick={() => {
                    setviewPopup(true)
                    setPopupData(row.original)
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
                accessor: 'username',
                Cell: name
            },
            {
                Header: "E-mail",
                accessor: 'email',
                Cell: email
            },
            {
                Header: "DATE",
                accessor: 'createdAt',
                Cell: date
            },
            {
                Header: "Mobile",
                accessor: 'number',
                Cell: mobile
            },
            {
                Header: "See Details",
                // accessor: "view",
                Cell: info,
            },
        ],
        []
    );

    return (
        <section className=" w-full h-full bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5">
            <p className="text-white font-bold  md:text-[32px] text-2xl md:pb-0 pb-3">Customers</p>

            <section className='px-5 pt-5 pb-5 bg-white h-full rounded-[12px] overflow-scroll md:mt-9 mt-5'>
                {/* shadow-2xl  */}
                <div className='bg-white border border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5'>
                    <div className='md:grid md:grid-cols-10 grid-cols-1 w-full h-full '>
                        <div className='cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5'>
                            <img className='w-[20px] h-[23px]' src='/filterImg.png' />
                        </div>
                        <div className='flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:px-0 px-5 md:pt-0 pt-5 md:pb-0 pb-3'>
                            <p className='text-custom-black text-sm	font-bold'>Filter By</p>
                        </div>
                        <div className='col-span-8 flex justify-start items-center '>
                            <input className='px-5' type='date' placeholder='Date' />
                        </div>
                    </div>
                </div>

                {viewPopup && (
                    <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
                        <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
                            <div
                                className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
                                onClick={() => setviewPopup(!viewPopup)}
                            >
                                <RxCrossCircled className="h-full w-full font-semibold " />
                            </div>

                            <div className='px-5 py-10'>
                                <div className='grid grid-cols-3 w-full gap-5'>
                                    <img src="/image-3.png" className='h-[76px] w-[76px]' />
                                    <div className='col-span-2 w-full flex flex-col justify-start items-start'>
                                        <p className="text-base font-bold text-custom-black">
                                            {popupData.username}
                                        </p>
                                        <p className="text-base font-semibold text-custom-newBlack pt-2">
                                            {popupData?.email}
                                        </p>
                                        <p className="text-sm font-semibold text-custom-black pt-2">
                                            {popupData.number}
                                        </p>

                                        <div className='flex justify-between items-center w-full pt-5'>
                                            <p className="text-sm font-normal text-custom-black">
                                                Total Order
                                            </p>
                                            <p className="text-sm font-normal text-custom-black">
                                                80
                                            </p>
                                        </div>

                                        <div className='flex justify-between items-center w-full pt-2'>
                                            <p className="text-sm font-normal text-custom-black">
                                                Total earning
                                            </p>
                                            <p className="text-sm font-normal text-custom-black">
                                                150
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-row justify-start items-start pt-10 gap-5'>
                                    <button className='text-white text-lg font-bold w-full h-[50px] rounded-[12px] bg-custom-lightBlue'>Verify</button>
                                    <button className='text-white text-lg font-bold w-full h-[50px] rounded-[12px] bg-custom-lightRed'>Suspend</button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                <div className=''>
                    <Table columns={columns} data={customerData} />
                </div>
            </section>
        </section>
    )
}

export default isAuth(customer)
