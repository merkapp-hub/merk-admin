import React, { useContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import moment from 'moment';
import { userContext } from './_app';
import Faq from '@/components/Faq';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function ContentManagement(props) {
    const [terms, setTerms] = useState({
        termsAndConditions: ''
    })
    const [returnPolicy, setReturnPolicy] = useState({
        returnPolicy: ''
    })
    const [privacyPolicy, setPrivacyPolicy] = useState({
        privacy: ''
    })
    const [user, setUser] = useContext(userContext)

    const [tab, setTab] = useState('CONTENT')
    const router = useRouter();

    useEffect(() => {
        getContent()
        getPrivacyPolicy()
        getReturnPolicy()
    }, [])

    const getPrivacyPolicy = () => {
        props.loader(true);
        Api("get", "content", router).then(
            (res) => {
                props.loader(false);
                console.log(res.data);
                
                if (res?.status) {
                    setPrivacyPolicy({ privacy: res?.data[0]?.privacy, id: res?.data[0]?._id })
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }



            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    }

    const privacyPolicyUpdate = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't to update privacy policy!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "content", { privacy: privacyPolicy.privacy, id: privacyPolicy._id }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: res?.data?.message });
                        } else {
                            props.toaster({ type: "error", message: res?.data?.message });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.data?.message });
                        props.toaster({ type: "error", message: err?.message });
                    }
                );
            }
        });
    }

    const getContent = () => {
        props.loader(true);
        Api("get", "content", router).then(
            (res) => {
                props.loader(false);

                if (res?.status) {
                    setTerms({ termsAndConditions: res?.data[0]?.termsAndConditions, id: res?.data[0]?._id })
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const termsSubmit = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't to update terms and condition!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "content", { termsAndConditions: terms.termsAndConditions, id: terms.id }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: res?.data?.message });
                        } else {
                            props.toaster({ type: "error", message: res?.data?.message });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.data?.message });
                        props.toaster({ type: "error", message: err?.message });
                    }
                );
            }
        });
    }

    const getReturnPolicy = () => {
        props.loader(true);
        Api("get", "content", router).then(
            (res) => {
                props.loader(false);
                // console.log("res=>---",res?.[0]?.returnPolicy);

                if (res?.status) {
                    setReturnPolicy({ returnPolicy: res?.data[0]?.returnPolicy, id: res?.[0]?._id })
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const ReturnSubmit = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't to update Return Policy !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "content", { returnPolicy: returnPolicy.returnPolicy, id: returnPolicy.id }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: res?.data?.message });
                        } else {
                            props.toaster({ type: "error", message: res?.data?.message });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.data?.message });
                        props.toaster({ type: "error", message: err?.message });
                    }
                );
            }
        });
    }

    return (
        <div className="w-full mx-auto p-5">
            <div className='md:p-6 p-3 border-2 border-custom-darkpurple rounded-2xl flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 '>
                <div className='w-full text-center md:text-left'>
                    <p className='text-md md:text-lg font-medium text-custom-blue'>{`${moment(new Date()).format('DD-MMM-YYYY')} , ${moment(new Date()).format('dddd')}`}</p>
                    <h2 className='text-2xl md:text-3xl font-medium text-custom-darkpurple'>Hello <span className='text-custom-darkpurple'>{user?.fullName}</span></h2>
                </div>
                <div className='flex flex-col md:flex-row md:gap-4 gap-2 text-center'>
                    <div className={`py-2 px-6 rounded-md w-40 cursor-pointer ${tab === 'Faq' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('Faq')}>
                        <p>FAQ</p>
                    </div>
                    <div className={`py-2 px-6 rounded-md w-60 cursor-pointer ${tab === 'CONTENT' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('CONTENT')}>
                        <p>Content Management</p>
                    </div>
                </div>
            </div>

            {/* Content Management Tab */}
            {tab === 'CONTENT' && (
                <div className="max-h-[75vh] overflow-y-auto p-2 pb-20">
                    {/* Terms and Conditions Section */}
                    <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                        <div className='md:mb-0 mb-3'>
                            <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Terms and Condition</p>
                        </div>
                    </div>

                    <section className='pb-4 relative'>
                        <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                            <div className='w-full text-sm md:text-md rounded-2xl space-y-4 border-t-[8px] border-custom-darkpurple'>
                                <JoditEditor
                                    className="editor max-h-[80vh] h-[70vh] overflow-y-auto"
                                    rows={8}
                                    value={terms?.termsAndConditions}
                                    onChange={newContent => setTerms({ ...terms, termsAndConditions: newContent })}
                                />
                            </div>
                            <div className="flex gap-10 items-center justify-center md:justify-start">
                                <button className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" onClick={termsSubmit}>Update</button>
                            </div>
                        </div>
                    </section>

                  
                    <div>
                        <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] border-custom-darkpurple mb-4">
                            <div className='md:mb-0 mb-3'>
                                <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Privacy Policy</p>
                            </div>
                        </div>

                        <section className='pb-4 relative'>
                            <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                                <div className='w-full text-sm md:text-md rounded-2xl space-y-4 border-t-[8px] border-custom-darkpurple'>
                                    <JoditEditor
                                        className="editor max-h-[80vh] h-[70vh] overflow-y-auto"
                                        rows={8}
                                        value={privacyPolicy?.privacy}
                                        onChange={newContent => setPrivacyPolicy({ ...privacyPolicy, privacy: newContent })}
                                    />
                                </div>
                                <div className="flex gap-10 items-center justify-center md:justify-start">
                                    <button className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" onClick={privacyPolicyUpdate}>Update</button>
                                </div>
                            </div>
                        </section>
                    </div>

                  
                    <div>
                        <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] border-custom-darkpurple mb-4">
                            <div className='md:mb-0 mb-3'>
                                <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Return Policy</p>
                            </div>
                        </div>

                        <section className='pb-4 relative'>
                            <div className='w-full bg-white border-[3px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                                <div className='w-full text-sm md:text-md rounded-2xl space-y-4 border-t-[8px] border-custom-darkpurple'>
                                   
                                    <JoditEditor
                                        className="editor max-h-[80vh] h-[70vh] overflow-y-auto"
                                        rows={8}
                                        value={returnPolicy?.returnPolicy}
                                        onChange={newContent => 
                                        { 
                                            console.log("Updated Content:", newContent);
                                            setReturnPolicy({ ...returnPolicy, returnPolicy: newContent })}
                                        }
                                    />
                                </div>

                               
                                <div className="flex gap-10 items-center justify-center md:justify-start">
                                    <button className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" onClick={ReturnSubmit}>Update</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        {
        tab === 'Faq' &&
                <div>
                <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                    <div className='md:mb-0 mb-3 '>
                    <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">
                        FAQ
                    </p>
                    </div>
                </div>
                <div className=''>
                    <Faq props={props} />
                    </div>
                </div>
            }


        </div>
    )
}

export default ContentManagement;