import React, { useState, useEffect, useRef } from 'react';
import { Api, ApiFormData } from '@/services/service';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md';
import { FaImage } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Gallery(props) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [bulkImages, setBulkImages] = useState([]);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [formData, setFormData] = useState({
    type: 'new_arrival',
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    image: '',
    link: '',
    order: 0
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    props.loader(true);
    try {
      const res = await Api('get', 'gallery', '', router);
      props.loader(false);
      if (res.status && res.data) {
        setGalleryItems(Array.isArray(res.data) ? res.data : []);
      } else {
        setGalleryItems([]);
      }
    } catch (err) {
      props.loader(false);
      setGalleryItems([]);
      toast.error(err?.message || 'Error fetching gallery');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    props.loader(true);
    try {
      const res = await ApiFormData('post', 'auth/user/fileupload', formData, router);
      props.loader(false);
      if (res.status) {
        setFormData(prev => ({ ...prev, image: res.data.file }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      props.loader(false);
      toast.error(err?.message || 'Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error('Image is required');
      return;
    }

    // Close modal first
    setShowModal(false);

    // Show confirmation
    const result = await Swal.fire({
      title: editMode ? 'Update Gallery Item?' : 'Create Gallery Item?',
      text: editMode ? 'Are you sure you want to update this item?' : 'Are you sure you want to create this item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E58F14',
      cancelButtonColor: '#6B7280',
      confirmButtonText: editMode ? 'Yes, Update' : 'Yes, Create',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      // Reopen modal if cancelled
      setShowModal(true);
      return;
    }

    props.loader(true);
    try {
      const endpoint = editMode ? `gallery/${currentItem._id}` : 'gallery';
      const method = editMode ? 'put' : 'post';
      
      const res = await Api(method, endpoint, formData, router);
      props.loader(false);

      if (res.status) {
        await Swal.fire({
          title: 'Success!',
          text: editMode ? 'Gallery updated successfully' : 'Gallery created successfully',
          icon: 'success',
          confirmButtonColor: '#E58F14'
        });
        resetForm();
        fetchGallery();
      } else {
        await Swal.fire({
          title: 'Error!',
          text: res.message || 'Operation failed',
          icon: 'error',
          confirmButtonColor: '#E58F14'
        });
        // Reopen modal on error
        setShowModal(true);
      }
    } catch (err) {
      props.loader(false);
      await Swal.fire({
        title: 'Error!',
        text: err?.message || 'Operation failed',
        icon: 'error',
        confirmButtonColor: '#E58F14'
      });
      // Reopen modal on error
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Gallery Item?',
      text: 'Are you sure you want to delete this item? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E58F14',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    props.loader(true);
    try {
      const res = await Api('delete', `gallery/${id}`, '', router);
      props.loader(false);

      if (res.status) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Gallery item deleted successfully',
          icon: 'success',
          confirmButtonColor: '#E58F14'
        });
        fetchGallery();
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.message || 'Delete failed',
          icon: 'error',
          confirmButtonColor: '#E58F14'
        });
      }
    } catch (err) {
      props.loader(false);
      Swal.fire({
        title: 'Error!',
        text: err?.message || 'Delete failed',
        icon: 'error',
        confirmButtonColor: '#E58F14'
      });
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || '',
      buttonText: item.buttonText || 'Shop Now',
      image: item.image,
      link: item.link || '',
      order: item.order || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'new_arrival',
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      image: '',
      link: '',
      order: 0
    });
    setEditMode(false);
    setCurrentItem(null);
  };

  const handleBulkImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error('You can only upload up to 10 images at once');
      return;
    }

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      type: formData.type,
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      link: '',
      order: bulkImages.length + index
    }));

    setBulkImages([...bulkImages, ...newImages]);
  };

  const updateBulkImage = (index, field, value) => {
    const updated = [...bulkImages];
    updated[index][field] = value;
    setBulkImages(updated);
  };

  const removeBulkImage = (index) => {
    const updated = bulkImages.filter((_, i) => i !== index);
    setBulkImages(updated);
  };

  const handleBulkUpload = async () => {
    // Close modal first
    setShowBulkModal(false);

    const result = await Swal.fire({
      title: 'Upload Images?',
      text: `Are you sure you want to upload ${bulkImages.length} images?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E58F14',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Upload',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      // Reopen modal if cancelled
      setShowBulkModal(true);
      return;
    }

    setUploadingBulk(true);
    props.loader(true);

    try {
      // Upload images one by one
      for (let i = 0; i < bulkImages.length; i++) {
        const item = bulkImages[i];
        
        // Upload image file
        const formData = new FormData();
        formData.append('file', item.file);
        
        const uploadRes = await ApiFormData('post', 'auth/user/fileupload', formData, router);
        
        if (!uploadRes.status) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }

        // Create gallery item
        const galleryData = {
          type: item.type || 'new_arrival',
          title: item.title,
          subtitle: item.subtitle,
          buttonText: item.buttonText,
          image: uploadRes.data.file,
          link: item.link,
          order: item.order
        };

        const createRes = await Api('post', 'gallery', galleryData, router);
        
        if (!createRes.status) {
          throw new Error(`Failed to create gallery item ${i + 1}`);
        }
      }

      // Stop loader before showing success message
      setUploadingBulk(false);
      props.loader(false);

      await Swal.fire({
        title: 'Success!',
        text: `Successfully uploaded ${bulkImages.length} images`,
        icon: 'success',
        confirmButtonColor: '#E58F14'
      });
      
      setBulkImages([]);
      fetchGallery();
    } catch (err) {
      // Stop loader before showing error message
      setUploadingBulk(false);
      props.loader(false);

      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Error uploading images',
        icon: 'error',
        confirmButtonColor: '#E58F14'
      });
      
      // Reopen modal on error
      setShowBulkModal(true);
    }
  };

  const newArrivalItems = Array.isArray(galleryItems) ? galleryItems.filter(item => item.type === 'new_arrival') : [];
  const bannerItems = Array.isArray(galleryItems) ? galleryItems.filter(item => item.type === 'banner') : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-custom-blue  text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <MdAdd className="text-xl" />
              Bulk Upload
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-custom-blue text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <MdAdd className="text-xl" />
              Add Single Item
            </button>
          </div>
        </div>

        {/* New Arrival Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">New Arrival Images (4 Images)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivalItems.length === 0 ? (
              <div className="col-span-4 text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FaImage className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">No new arrival images yet</p>
              </div>
            ) : (
              newArrivalItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    {item.link && (
                      <p className="text-sm text-gray-500 mb-3 truncate">Link: {item.link}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <MdEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <MdDelete />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Banner Image (Above Explore Our Products)</h2>
          <div className="grid grid-cols-1 gap-6">
            {bannerItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FaImage className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">No banner image yet</p>
              </div>
            ) : (
              bannerItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                    )}
                    <p className="text-xs text-blue-600 mb-2">Button: {item.buttonText || 'Shop Now'}</p>
                    {item.link && (
                      <p className="text-xs text-gray-500 mb-3 truncate">Link: {item.link}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <MdEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <MdDelete />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editMode ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="new_arrival">New Arrival</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Optional - e.g., "PlayStation 5", "Women's Collections")
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter title (optional)"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle (e.g., "Black and White version of the PS5 coming out on sale")
                    </label>
                    <textarea
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subtitle/description"
                      rows="2"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Shop Now"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-custom-blue hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        Choose Image
                      </button>
                      {formData.image && (
                        <div className="flex-1">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter link URL"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-custom-blue  text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {editMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Bulk Upload Images</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new_arrival">New Arrival</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  ref={bulkFileInputRef}
                  onChange={handleBulkImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bulkFileInputRef.current?.click()}
                  className="w-full bg-gray-200 hover:bg-gray-300 px-6 py-4 rounded-lg transition-colors border-2 border-dashed border-gray-400"
                >
                  <FaImage className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to select multiple images</p>
                  <p className="text-sm text-gray-500 mt-1">You can select up to 10 images at once</p>
                </button>
              </div>

              {bulkImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Selected Images ({bulkImages.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {bulkImages.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <img
                          src={item.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Title (optional)"
                          value={item.title}
                          onChange={(e) => updateBulkImage(index, 'title', e.target.value)}
                          className="w-full px-2 text-gray-700 py-1 text-sm border rounded mb-1"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle"
                          value={item.subtitle}
                          onChange={(e) => updateBulkImage(index, 'subtitle', e.target.value)}
                          className="w-full px-2 py-1 text-gray-700 text-sm border rounded mb-1"
                        />
                        <input
                          type="text"
                          placeholder="Button Text"
                          value={item.buttonText}
                          onChange={(e) => updateBulkImage(index, 'buttonText', e.target.value)}
                          className="w-full px-2 text-gray-700 py-1 text-sm border rounded mb-1"
                        />
                        <input
                          type="text"
                          placeholder="Link"
                          value={item.link}
                          onChange={(e) => updateBulkImage(index, 'link', e.target.value)}
                          className="w-full text-gray-700 px-2 py-1 text-sm border rounded mb-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeBulkImage(index)}
                          className="w-full bg-custom-blue text-white px-2 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={bulkImages.length === 0 || uploadingBulk}
                  className="flex-1 bg-custom-blue  disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {uploadingBulk ? 'Uploading...' : `Upload ${bulkImages.length} Images`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkImages([]);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
