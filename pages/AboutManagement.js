import React, { useContext, useEffect, useState } from 'react';
import { Api, ApiFormData } from '@/services/service';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import moment from 'moment';
import { userContext } from './_app';

function AboutManagement(props) {
    const [user, setUser] = useContext(userContext);
    const [tab, setTab] = useState('HERO');
    const router = useRouter();

    // Hero Section State
    const [heroData, setHeroData] = useState({
        heroTitle: '',
        heroDescription1: '',
        heroDescription2: '',
        heroImage: ''
    });

    // Statistics State
    const [statistics, setStatistics] = useState([
        { title: '', value: '', icon: 'chart' },
        { title: '', value: '', icon: 'sale' },
        { title: '', value: '', icon: 'users' },
        { title: '', value: '', icon: 'gross' }
    ]);

    // Team Members State
    const [teamMembers, setTeamMembers] = useState([
        { name: '', position: '', image: '' },
        { name: '', position: '', image: '' },
        { name: '', position: '', image: '' }
    ]);

    // Services State
    const [services, setServices] = useState([
        { title: '', description: '', icon: 'delivery' },
        { title: '', description: '', icon: 'support' },
        { title: '', description: '', icon: 'guarantee' }
    ]);

    useEffect(() => {
        getAboutData();
    }, []);

    const getAboutData = () => {
        props.loader(true);
        Api("get", "about", router).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    const data = res?.data;
                    setHeroData({
                        heroTitle: data?.heroTitle || '',
                        heroDescription1: data?.heroDescription1 || '',
                        heroDescription2: data?.heroDescription2 || '',
                        heroImage: data?.heroImage || ''
                    });
                    
                    if (data?.statistics && data.statistics.length > 0) {
                        setStatistics(data.statistics);
                    }
                    
                    if (data?.teamMembers && data.teamMembers.length > 0) {
                        setTeamMembers(data.teamMembers);
                    }
                    
                    if (data?.services && data.services.length > 0) {
                        setServices(data.services);
                    }
                } else {
                    props.toaster({ type: "error", message: res?.message || "Failed to fetch data" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message || "Error fetching data" });
            }
        );
    };

    const updateHeroSection = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to update the hero section!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "about/hero", heroData, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: "Hero section updated successfully" });
                            getAboutData();
                        } else {
                            props.toaster({ type: "error", message: res?.message || "Update failed" });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.message || "Error updating" });
                    }
                );
            }
        });
    };

    const uploadHeroImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('heroImage', file);

        props.loader(true);
        ApiFormData("post", "about/upload-hero-image", formData, router).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    props.toaster({ type: "success", message: "Hero image uploaded successfully" });
                    setHeroData({ ...heroData, heroImage: res?.data?.imageUrl });
                    getAboutData();
                } else {
                    props.toaster({ type: "error", message: res?.message || "Upload failed" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message || "Error uploading image" });
            }
        );
    };

    const uploadTeamImage = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('teamImage', file);
        formData.append('memberIndex', index);

        props.loader(true);
        ApiFormData("post", "about/upload-team-image", formData, router).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    props.toaster({ type: "success", message: "Team member image uploaded successfully" });
                    const newTeam = [...teamMembers];
                    newTeam[index].image = res?.data?.imageUrl;
                    setTeamMembers(newTeam);
                    getAboutData();
                } else {
                    props.toaster({ type: "error", message: res?.message || "Upload failed" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message || "Error uploading image" });
            }
        );
    };

    const updateStatistics = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to update statistics!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "about/statistics", { statistics }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: "Statistics updated successfully" });
                            getAboutData();
                        } else {
                            props.toaster({ type: "error", message: res?.message || "Update failed" });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.message || "Error updating" });
                    }
                );
            }
        });
    };

    const updateTeamMembers = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to update team members!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "about/team", { teamMembers }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: "Team members updated successfully" });
                            getAboutData();
                        } else {
                            props.toaster({ type: "error", message: res?.message || "Update failed" });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.message || "Error updating" });
                    }
                );
            }
        });
    };

    const updateServices = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to update services!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then((result) => {
            if (result.isConfirmed) {
                props.loader(true);
                Api("post", "about/services", { services }, router).then(
                    (res) => {
                        props.loader(false);
                        if (res?.status) {
                            props.toaster({ type: "success", message: "Services updated successfully" });
                            getAboutData();
                        } else {
                            props.toaster({ type: "error", message: res?.message || "Update failed" });
                        }
                    },
                    (err) => {
                        props.loader(false);
                        props.toaster({ type: "error", message: err?.message || "Error updating" });
                    }
                );
            }
        });
    };

    const handleStatChange = (index, field, value) => {
        const newStats = [...statistics];
        newStats[index][field] = value;
        setStatistics(newStats);
    };

    const handleTeamChange = (index, field, value) => {
        const newTeam = [...teamMembers];
        newTeam[index][field] = value;
        setTeamMembers(newTeam);
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        newServices[index][field] = value;
        setServices(newServices);
    };

    return (
        <div className="w-full mx-auto p-5">
            <div className='md:p-6 p-3 border-2 border-custom-darkpurple rounded-2xl flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0'>
                <div className='w-full text-center md:text-left'>
                    <p className='text-md md:text-lg font-medium text-custom-blue'>
                        {`${moment(new Date()).format('DD-MMM-YYYY')} , ${moment(new Date()).format('dddd')}`}
                    </p>
                    <h2 className='text-2xl md:text-3xl font-medium text-custom-darkpurple'>
                        Hello <span className='text-custom-darkpurple'>{user?.fullName}</span>
                    </h2>
                </div>
                <div className='flex flex-wrap justify-center md:flex-row gap-2 text-center'>
                    <div 
                        className={`py-2 px-4 rounded-md cursor-pointer ${tab === 'HERO' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('HERO')}
                    >
                        <p>Hero Section</p>
                    </div>
                    <div 
                        className={`py-2 px-4 rounded-md cursor-pointer ${tab === 'STATS' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('STATS')}
                    >
                        <p>Statistics</p>
                    </div>
                    <div 
                        className={`py-2 px-4 rounded-md cursor-pointer ${tab === 'TEAM' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('TEAM')}
                    >
                        <p>Team Members</p>
                    </div>
                    <div 
                        className={`py-2 px-4 rounded-md cursor-pointer ${tab === 'SERVICES' ? 'bg-custom-darkpurple text-white' : 'bg-white border-2 text-custom-darkpurple border-custom-darkpurple'}`}
                        onClick={() => setTab('SERVICES')}
                    >
                        <p>Services</p>
                    </div>
                </div>
            </div>

            {/* Hero Section Tab */}
            {tab === 'HERO' && (
                <div className="max-h-[75vh] overflow-y-auto p-2 pb-20">
                    <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                        <div className='md:mb-0 mb-3'>
                            <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Hero Section</p>
                        </div>
                    </div>

                    <section className='pb-4 relative'>
                        <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Hero Title</label>
                                    <input
                                        type="text"
                                        className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                        value={heroData.heroTitle}
                                        onChange={(e) => setHeroData({ ...heroData, heroTitle: e.target.value })}
                                        placeholder="Enter hero title"
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Description 1</label>
                                    <textarea
                                        className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                        rows={3}
                                        value={heroData.heroDescription1}
                                        onChange={(e) => setHeroData({ ...heroData, heroDescription1: e.target.value })}
                                        placeholder="Enter first description"
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Description 2</label>
                                    <textarea
                                        className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                        rows={3}
                                        value={heroData.heroDescription2}
                                        onChange={(e) => setHeroData({ ...heroData, heroDescription2: e.target.value })}
                                        placeholder="Enter second description"
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Hero Image</label>
                                    <div className='space-y-3'>
                                        {heroData.heroImage && (
                                            <div className='border-2 border-gray-200 rounded-lg p-3'>
                                                <img 
                                                    src={heroData.heroImage} 
                                                    alt="Hero" 
                                                    className='w-full h-48 object-cover rounded-lg'
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                            onChange={uploadHeroImage}
                                        />
                                        <p className='text-sm text-gray-500'>Upload a new hero image</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-10 items-center justify-center md:justify-start">
                                <button 
                                    className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" 
                                    onClick={updateHeroSection}
                                >
                                    Update Hero Section
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Statistics Tab */}
            {tab === 'STATS' && (
                <div className="max-h-[75vh] overflow-y-auto p-2 pb-20">
                    <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                        <div className='md:mb-0 mb-3'>
                            <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Statistics</p>
                        </div>
                    </div>

                    <section className='pb-4 relative'>
                        <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                            {statistics.map((stat, index) => (
                                <div key={index} className='border-2 border-gray-200 rounded-lg p-4 space-y-3'>
                                    <h3 className='font-semibold text-lg text-custom-darkpurple'>Statistic {index + 1}</h3>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
                                            <input
                                                type="text"
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                value={stat.title}
                                                onChange={(e) => handleStatChange(index, 'title', e.target.value)}
                                                placeholder="e.g., Sellers Active"
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Value</label>
                                            <input
                                                type="text"
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                value={stat.value}
                                                onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                                                placeholder="e.g., 10.5k"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-10 items-center justify-center md:justify-start">
                                <button 
                                    className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" 
                                    onClick={updateStatistics}
                                >
                                    Update Statistics
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Team Members Tab */}
            {tab === 'TEAM' && (
                <div className="max-h-[75vh] overflow-y-auto p-2 pb-20">
                    <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                        <div className='md:mb-0 mb-3'>
                            <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Team Members</p>
                        </div>
                    </div>

                    <section className='pb-4 relative'>
                        <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                            {teamMembers.map((member, index) => (
                                <div key={index} className='border-2 border-gray-200 rounded-lg p-4 space-y-3'>
                                    <h3 className='font-semibold text-lg text-custom-darkpurple'>Team Member {index + 1}</h3>
                                    <div className='space-y-3'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                                            <input
                                                type="text"
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                value={member.name}
                                                onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                                                placeholder="e.g., Tom Cruise"
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Position</label>
                                            <input
                                                type="text"
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                value={member.position}
                                                onChange={(e) => handleTeamChange(index, 'position', e.target.value)}
                                                placeholder="e.g., Founder & Chairman"
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Member Image</label>
                                            <div className='space-y-3'>
                                                {member.image && (
                                                    <div className='border-2 border-gray-200 rounded-lg p-3'>
                                                        <img 
                                                            src={member.image} 
                                                            alt={member.name} 
                                                            className='w-full h-48 object-cover rounded-lg'
                                                        />
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                    onChange={(e) => uploadTeamImage(e, index)}
                                                />
                                                <p className='text-sm text-gray-500'>Upload team member image</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-10 items-center justify-center md:justify-start">
                                <button 
                                    className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" 
                                    onClick={updateTeamMembers}
                                >
                                    Update Team Members
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Services Tab */}
            {tab === 'SERVICES' && (
                <div className="max-h-[75vh] overflow-y-auto p-2 pb-20">
                    <div className="md:grid grid-cols-2 bg-[#E9E9E9] md:px-5 p-4 rounded-xl border-t-[6px] mt-5 border-custom-darkpurple mb-4">
                        <div className='md:mb-0 mb-3'>
                            <p className="text-custom-darkpurple font-bold md:text-3xl text-lg">Services</p>
                        </div>
                    </div>

                    <section className='pb-4 relative'>
                        <div className='w-full bg-white border-[2px] border-custom-darkpurple rounded-lg p-3 md:p-5 flex flex-col space-y-4'>
                            {services.map((service, index) => (
                                <div key={index} className='border-2 border-gray-200 rounded-lg p-4 space-y-3'>
                                    <h3 className='font-semibold text-lg text-custom-darkpurple'>Service {index + 1}</h3>
                                    <div className='space-y-3'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
                                            <input
                                                type="text"
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                value={service.title}
                                                onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                                                placeholder="e.g., Free and Fast Delivery"
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                                            <textarea
                                                className='w-full border-2 border-gray-300 rounded-lg p-3 text-gray-700'
                                                rows={2}
                                                value={service.description}
                                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                placeholder="e.g., Free delivery for all orders over $140"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-10 items-center justify-center md:justify-start">
                                <button 
                                    className="text-lg text-white font-semibold bg-custom-darkpurple rounded-lg md:py-2 py-1 px-2 md:px-8" 
                                    onClick={updateServices}
                                >
                                    Update Services
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AboutManagement;
