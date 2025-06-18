import React, { useState } from 'react'
import Link from 'next/link'
import { BsPinterest } from 'react-icons/bs'

import { useRouter } from "next/router";
import { Api } from '@/utils/service';

const Footer = (props) => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const Subscriber = () => {
        console.log(email)
        props.loader(true);
        Api("post", "add-subscriber", { email }, router).then(
            (res) => {
                console.log("res================>", res);
                props.loader(false);
                props.toaster({ type: "success", message: "subscribed successfully" });
                setEmail('')
            },

            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };
    return (
        <div className='min-w-screen md:py-8 md:mt-8 px-10'>
            <div className='max-w-full flex flex-col gap-4  mx-auto text-black p-4 md:p-0'>
                <div className='w-full grid md:grid-cols-4  gap-3 md:gap-6'>
                    <div className=' flex flex-col items-center'>
                        <Link href={'/'}>
                            <img className='w-[10rem] mt-[-0.5rem]' src="/Done.png" alt="" />
                        </Link>
                        <p className='text-xl font-bold my-4'>Follow</p>
                        <div className='flex gap-3'>
                            <Link href={'https://www.facebook.com/2DigitInnovations/'} target='_blank'>
                                <img src="fb.png" alt="" />
                            </Link>
                            <Link href={'https://www.instagram.com/2digitinnovations/'} target='_blank'>
                                <img src="insta.png" alt="" />
                            </Link>
                            <Link href={'https://www.linkedin.com/company/2digitinnovations/?viewAsMember=true'} target='_blank'>
                                <img src="linkedin.png" alt="" />
                            </Link>
                            <Link href={'https://dribbble.com/2digitinnovations'} target='_blank'>
                                <div className='flex items-center justify-center p-[11px] border-2 border-[#98979f] rounded-full'>
                                    <img src="dribble.png" alt="" className='w-4' />
                                </div>
                            </Link>
                            <Link href={'https://www.behance.net/2digitinnovations'} target='_blank'>
                                <div className='flex items-center justify-center p-[11px] border-2 border-[#98979f] rounded-full'>
                                    <img src="behance.png" alt="" className='w-4' />
                                </div>
                            </Link>
                            <Link href={'https://in.pinterest.com/2digitinnovations'} target='_blank'>
                                <div className='flex items-center justify-center p-[11px] border-2 border-[#98979f] rounded-full'>
                                    <BsPinterest className='w-4' />
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className='flex flex-col items-center gap-1 md:gap-4 '>
                        <p className='text-xl font-bold mb-1 md:mb-4'>Services</p>
                        <Link href={'/web-portfolio'}>
                            <p>Web Portfolio</p>
                        </Link>
                        <Link href={'/app-portfolio'}>
                            <p>App Portfolio</p>
                        </Link>
                        <p>Custome Service</p>
                        <p>UI & UX Designing</p>
                        <p>SEO Optimization</p>
                    </div>
                    <div className='flex flex-col items-center gap-1 md:gap-4 text-center md:text-left'>
                        <p className='text-xl font-bold mb-1 md:mb-4'>Contact</p>
                        <p>Indirapuram, Ghaziabad, Uttar Pradesh, India, Pincode : 201014</p>
                        <Link href={'mailto:info@2digitinnovations.com'}>
                            <p className='text-[#6C55F9]'>info@2digitinnovations.com</p>
                        </Link>

                        <Link href={'tel:7814042409'}>
                            <p className='text-[#6C55F9]'>+91 7814042409</p>
                        </Link>

                    </div>
                    <div className='flex flex-col items-center gap-1 md:gap-4 '>
                        <p className='text-xl font-bold mb-1 md:mb-4'>Quick Links</p>
                        <p>Our Apps.</p>
                        <p >Find us on Clutch.</p>
                        <p >+91 7814042409</p>
                        <div className='w-full flex  border-b border-black items-center justify-between'>
                            <img src="/msg.png" alt="" />
                            <input className='w-[70%] p-2 outline-none' placeholder='Your Email' type="email" value={email} onChange={(text) => { setEmail(text.target.value) }} />
                            <button onClick={Subscriber}>Send</button>
                        </div>
                    </div>
                </div>
                <div className='w-full flex flex-col md:flex-row justify-between items-center md:py-4 gap-4'>
                    <span className='text-sm'>Copy@ {moment().format('YYYY')} <span className='text-[#6C55F9]'> <Link href={'/'}>2digitinnovations</Link></span> All Rights reserved</span>
                    <div className=' flex flex-col md:flex-row md:justify-center gap-1 items-center md:gap-4 text-sm'>
                        <Link href={'/privacy'}>
                            <p> Privacy & Policy</p>
                        </Link>
                        <Link href={'/faqs'}>
                            <p>FAQs</p>
                        </Link>
                        <Link href={'/contact'}>
                            <p>Contact</p>
                        </Link>
                        <Link href={'/terms'}>
                            <p>Terms & Condition</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer