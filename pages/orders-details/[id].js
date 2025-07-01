import React, { useEffect, useState } from 'react'
import { IoIosAdd } from "react-icons/io";
import { IoIosRemove } from "react-icons/io";
import { useRouter } from "next/router";
import { Api } from '@/services/service';
import { produce } from 'immer';
import currencySign from '@/utils/currencySign';
// import SelectSearch from 'react-select-search';
// import 'react-select-search/style.css'

function OrdersDetails(props) {
    const router = useRouter();
    console.log(router)
    const [productsId, setProductsId] = useState({});
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState([]);
    const [cartData, setCartData] = useState([]);
    const [selecteSize, setSelecteSize] = useState({});
    const [selectedImageList, setSelectedImageList] = useState([]);
    const [fragranceList, setFragranceList] = useState([]);
    const [selectFragranceSearch, setSelectFragranceSearch] = useState([]);
    const [selectFragranceList, setSelectFragranceList] = useState([]);
    const [mainProductsData, setMainProductsData] = useState({});

    useEffect(() => {
        let cart = localStorage.getItem("addCartDetail");
        if (cart) {
            setCartData(JSON.parse(cart));
        }
        if (router?.query?.id) {
            getProductById()
        }
    }, [router?.query?.id])

    useEffect(() => {
        console.log(selectFragranceList)
    }, [selectFragranceList])

    const getProductById = async () => {
        props.loader(true);
        Api("get", `getProductRequest/${router?.query?.id}`, '', router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                setMainProductsData(res?.data)
                const d = res.data.productDetail.find(f => f._id === router?.query?.product_id)
                console.log(d)
                setProductsId(d);

                setSelectedImageList(d?.image)
                setSelectedImage(d.image[0])
                // setSelectedSize(res.data?.varients[0].size)
                // setSelecteSize(res.data?.varients[0].size[0])
                console.log(d?.fragrance)
                if (d?.fragrance?.length > 0) {
                    setSelectFragranceList(d?.fragrance)
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    console.log("main product data ::", mainProductsData);
    

    const imageOnError = (event) => {
        event.currentTarget.src = '/default-product-image.png';
        // event.currentTarget.className = "error";
    };

    return (
        <>
            {/* <section className=" w-full h-full bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5">
                <p className="text-white font-bold  md:text-[32px] text-2xl md:pb-0 pb-3">Orders Details</p>

                <section className='px-5 pt-5 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-scroll md:mt-9 mt-5'>

                    <div className="grid md:grid-cols-2 grid-cols-1 w-full md:gap-0 gap-5">
                        <div className='w-full'>
                            <div className='grid md:grid-cols-3 grid-cols-1 w-full md:gap-5 md:pb-10'>
                                <div className='w-full md:h-[300px] flex md:flex-col flex-row overflow-y-auto overflow-x-hidden md:order-1 order-2 md:pt-0 pt-5'>
                                    {selectedImageList?.map((item, i) => (<div key={i} className='slider  md:block flex md:gap-5 gap-2 w-full'>
                                        <img className={`md:!w-[85%] w-[93px] object-contain md:mb-5 bg-custom-offWhite rounded-[20px]  ${selectedImage === item ? 'border border-black' : ''}`} src={item || '/default-product-image.png'} onClick={() => {
                                            setSelectedImage(item)
                                            imageOnError()
                                        }} />
                                    </div>
                                    ))}
                                </div>
                                <div className="col-span-2  md:order-2 order-1  w-full bg-custom-offWhite flex flex-col justify-center items-center md:h-max">
                                    <img className=" w-full  object-contain" src={selectedImage || '/default-product-image.png'} onError={imageOnError} />
                                </div>
                            </div>
                            <p className='text-black font-normal text-base md:pt0 pt-5'>Would you like your parcel to be left in a safe place?</p>
                            <p className='text-black font-normal text-base'>{mainProductsData?.isSafeparcel}</p>

                            <p className='text-black font-normal text-base pt-5'>Signature required?</p>
                            <p className='text-black font-normal text-base'>{mainProductsData?.issign}</p>
                        </div>
                        <div className='flex flex-col justify-start items-start md:px-20 px-0 md:pt-5 md:pb-5'>
                            <p className='text-black md:text-3xl md:leading-[40px] text-base font-normal md:pt-0 pt-0'>{productsId?.product?.name}</p>
                            <p className='text-black text-xl font-normal md:pt-5 pt-3'>${selecteSize?.rate || productsId?.price}</p>
                            {productsId?.color && <div className='flex justify-start items-center pt-[6px] mt-2'>
                                <p className='text-black text-base font-normal'>Colour: <span className='font-bold'>{productsId?.color}</span></p>
                            </div>}
                            <div className='pt-5 w-full'>
                                <p className='text-black text-base font-normal'>Size: <span className='font-bold'>{productsId?.size}</span></p>
                            </div>

                            <div className='mt-5  flex justify-start items-center'>
                                <p className='text-black text-base font-normal text-center'>Qty: <span className='font-bold'>{productsId?.qty || 0}</span></p>
                            </div>

                            <p className='text-black text-base font-normal italic pt-5'>{productsId?.product?.short_description}</p>

                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-5 gap-5">
                        {selectFragranceList.map((item, i) => (
                            <div key={i} className="bg-custom-offWhite w-full rounded-[20px]  p-5 !gap-5 ">
                                <p className="text-lg	text-black font-normal">{item?.name}</p>
                                <p className="text-lg font-normal text-black">{item?.ingredients}</p>
                            </div>
                        ))}
                    </div>

                    <p className='text-black text-base font-normal pt-5' dangerouslySetInnerHTML={{ __html: productsId?.product?.long_description }}></p>
                </section>

            </section> */}

            <section className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
                <p className="text-custom-black font-bold  md:text-[32px] text-2xl">Orders Details</p>
                <section className='px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3'>
                    <div className="grid md:grid-cols-2 grid-cols-1 w-full md:gap-0 gap-5">
                        <div className='w-full'>
                            <div className='grid md:grid-cols-3 grid-cols-1 w-full md:gap-5 md:pb-10'>
                                <div className='w-full md:h-[300px] flex md:flex-col flex-row overflow-y-auto overflow-x-hidden md:order-1 order-2 md:pt-0 pt-5'>
                                    {selectedImageList?.map((item, i) => (<div key={i} className='slider  md:block flex md:gap-5 gap-2 w-full'>
                                        <img className={`md:!w-[85%] w-[93px] object-contain md:mb-5 bg-custom-offWhite rounded-[20px]  ${selectedImage === item ? 'border border-black' : ''}`} src={item || '/default-product-image.png'} onClick={() => {
                                            setSelectedImage(item)
                                            imageOnError()
                                        }} />
                                    </div>
                                    ))}
                                </div>
                                <div className="col-span-2  md:order-2 order-1  w-full bg-custom-offWhite flex flex-col justify-center items-center md:h-max">
                                    <img className=" w-full  object-contain" src={selectedImage || '/default-product-image.png'} onError={imageOnError} />
                                </div>
                            </div>
                            {/* <p className='text-black font-normal text-base md:pt0 pt-5'>Would you like your parcel to be left in a safe place?</p>
                            <p className='text-black font-normal text-base'>{mainProductsData?.isSafeparcel}</p>

                            <p className='text-black font-normal text-base pt-5'>Signature required?</p>
                            <p className='text-black font-normal text-base'>{mainProductsData?.issign}</p> */}
                        </div>
                        <div className='flex flex-col justify-start items-start md:px-20 px-0 md:pt-5 md:pb-5'>
                            <p className='text-black md:text-3xl md:leading-[40px] text-base font-normal md:pt-0 pt-0'>{productsId?.product?.name}</p>
                            <p className='text-black text-xl font-normal  pt-2'>{currencySign(selecteSize?.rate ?? productsId?.price ?? 0)}</p>
                            {productsId?.color && <div className='flex justify-start items-center pt-[6px] mt-2'>
                                <p className='text-black text-base font-normal'>Colour: <span className='font-bold'>{productsId?.color}</span></p>
                            </div>}
                            {/* <div className='pt-5 w-full'>
                                <p className='text-black text-base font-normal'>Size: <span className='font-bold'>{productsId?.size}</span></p>
                            </div> */}

                            <div className='mt-2 flex justify-start items-center'>
                                <p className='text-black text-base font-bold text-center'>Qty: <span className='font-bold'>{productsId?.qty || 0}</span></p>
                            </div>
                            {/* <div className='text-black text-base font-bold  mt-3 '>Self life : {" "} {" "}
                                <span className=' mt-2 font-normal text-custom-darkGray'>{productsId?.product?.selflife}</span>
                            </div> */}
                            <div className='text-black text-base font-bold  mt-3 '>Unit : {" "} {" "}
                                <span className='text-custom-darkGray px-1'>{productsId?.product?.price_slot[0]?.value}</span>
                                <span className=' mt-2 font-normal text-custom-darkGray'>{productsId?.product?.price_slot[0]?.unit}</span>
                            </div>
                            <p className='font-semibold text-black pt-2'>Description : {" "}
                                <span className='text-custom-darkGray'>{productsId?.product?.long_description}</span>
                            </p>
                            {/* <p className='text-black text-base font-normal italic pt-5'>{productsId?.product?.short_description}</p> */}

                            
                        </div>

                        
                    </div>
                    <div className='border grid grid-cols-2 mt-10 md:mt-0  py-4 md:mx-5 px-5 text-black bg-custom-lightGray md:w-[90%] w-full h-auto'>
                            <div>
                            <h1 className='text-black font-bold text-lg '>Order Details </h1>
                            <p className='text-black pt-2'>Name : {" "}<span className='font-normal text-custom-darkGray'>{mainProductsData?.shipping_address?.firstName}</span></p>
                            <p className='text-black pt-2'>phone Number : {" "}<span className='font-normal text-custom-darkGray'>{mainProductsData?.shipping_address?.phoneNumber}</span></p>
                             <p className='text-black pt-2'>Shipping Address : {" "}<span className='font-normal text-custom-darkGray'>{mainProductsData?.shipping_address?.address}</span></p>
                             <p className='text-black pt-2'>City : {" "}<span className='font-normal text-custom-darkGray'>{mainProductsData?.shipping_address?.city}</span></p>
                            <p className='text-black pt-2'>Country : {" "}<span className='font-normal text-custom-darkGray'>{mainProductsData?.shipping_address?.country?.label}</span></p>
                            </div>
                        
                             
                            <div className=''>
                            {/* <p className='font-normal'>City :</p>
                            <p className='font-normal'>Self life :</p> */}
                            <h1 className='text-black pb-3 font-bold text-lg '>Product Details </h1>
                            <p className=' py-2'>Manufacturer Name : {" "} <span className='font-normal text-custom-darkGray'>{productsId?.product?.manufacturername}</span></p>
                            <p className=''>Manufacturer Address : {" "} <span className='font-normal text-custom-darkGray'>{productsId?.product?.manufactureradd }</span></p>
                            <p className='pt-2'>Country : {" "} <span className='font-normal text-custom-darkGray'>{productsId?.product?.origin}</span></p>
                             </div>
                            
                        </div>
                    {/* <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-5 gap-5">
                        {selectFragranceList.map((item, i) => (
                            <div key={i} className="bg-custom-offWhite w-full rounded-[20px]  p-5 !gap-5 ">
                                <p className="text-lg	text-black font-normal">{item?.name}</p>
                                <p className="text-lg font-normal text-black">{item?.ingredients}</p>
                            </div>
                        ))}
                    </div> */}

                    {/* <p className='text-black text-base font-normal pt-5' dangerouslySetInnerHTML={{ __html: productsId?.product?.long_description }}></p> */}
                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.firstName}</p>
                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.address}</p>
                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.pinCode}</p>
                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.phoneNumber}</p>
                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.city}</p>
                  <p className='text-black text-base font-normal md:pt-5 pt-3'>{mainProductsData?.user?.country?.label || mainProductsData?.user?.country}</p>
                </section>
            </section>
        </>
    )
}

export default OrdersDetails
