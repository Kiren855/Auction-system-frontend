import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi';
import {
  Package,
  ImagePlus,
  Gavel,
  Calendar,
  DollarSign,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Search,
  Layers,
  ChevronRight,
  Loader2,
  PlusCircle,
  Database,
  Camera,
} from 'lucide-react';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState(null); // 'EXISTING' or 'NEW'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { condition: 'NEW' },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          auctionApi.getAllCategories(),
          auctionApi.getAllProducts(),
        ]);
        setCategories(catRes.data?.result || catRes.result || []);
        setProductList(prodRes.data?.result || prodRes.result || []);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10)
      return alert('Maximum 10 images allowed');
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImages((prev) => [
          ...prev,
          { file, preview: reader.result, id: Math.random() },
        ]);
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (method === 'EXISTING' && selectedProduct) {
        formData.append('itemId', selectedProduct.id);
      } else {
        formData.append('title', data.title);
        formData.append('categoryId', data.categoryId);
        formData.append('brand', data.brand);
        formData.append('condition', data.condition);
        images.forEach((img) => formData.append('images', img.file));
      }

      formData.append('startPrice', data.startPrice);
      formData.append('stepPrice', data.stepPrice);
      formData.append('startAt', data.startAt);
      formData.append('endAt', data.endAt);

      await auctionApi.createAuction(formData);
      navigate('/seller/auctions');
    } catch (err) {
      alert('Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center mb-12 gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep === step
                  ? 'bg-slate-900 text-white scale-110 shadow-lg'
                  : currentStep > step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > step ? <CheckCircle2 size={20} /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-1 ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-200'} mx-2 rounded`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* --- STEP 1: METHOD SELECTION --- */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">
                Start New Auction
              </h2>
              <p className="text-slate-500">
                Choose an existing product or create a new one from scratch.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => {
                  setMethod('EXISTING');
                  setCurrentStep(2);
                }}
                className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all cursor-pointer text-center space-y-4 shadow-sm"
              >
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Database size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Existing Product
                </h3>
                <p className="text-sm text-slate-500">
                  Select an item from your previous listings.
                </p>
              </div>
              <div
                onClick={() => {
                  setMethod('NEW');
                  setCurrentStep(2);
                }}
                className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer text-center space-y-4 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-100 text-slate-900 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <PlusCircle size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  New Product
                </h3>
                <p className="text-sm text-slate-500">
                  Create a brand new item for auction.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: PRODUCT DEFINITION --- */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-black text-slate-900">
              Product Details
            </h2>

            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm space-y-6">
              {method === 'EXISTING' ? (
                <div className="space-y-6">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-2xl outline-none"
                      placeholder="Search by product title..."
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {productList
                      .filter((p) =>
                        p.title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedProduct?.id === p.id ? 'border-amber-500 bg-amber-50' : 'border-slate-50 hover:bg-slate-50'}`}
                        >
                          <span className="font-bold text-slate-700">
                            {p.title}
                          </span>
                          {selectedProduct?.id === p.id && (
                            <CheckCircle2
                              className="text-amber-600"
                              size={18}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Product Title
                      </label>
                      <input
                        {...register('title')}
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none"
                        placeholder="e.g., MacBook Pro M3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Category
                      </label>
                      <select
                        {...register('categoryId')}
                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none"
                      >
                        <option value="">Select a Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Camera size={14} /> Product Images ({images.length}/10)
                    </label>
                    <div
                      onClick={() =>
                        images.length < 10 && fileInputRef.current.click()
                      }
                      className="border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50 hover:border-slate-900 cursor-pointer text-center transition-all"
                    >
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      <p className="text-sm font-bold text-slate-400">
                        Upload at least one image to showcase your item
                      </p>
                    </div>
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm"
                        >
                          <img
                            src={img.preview}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setImages(images.filter((i) => i.id !== img.id))
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={
                  method === 'EXISTING'
                    ? !selectedProduct
                    : !watch('title') || images.length === 0
                }
                className="flex-2 py-4 bg-slate-900 text-white font-bold rounded-2xl disabled:opacity-50 transition-all"
              >
                Setup Auction Terms
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: AUCTION TERMS --- */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-black text-slate-900">
              Auction Terms
            </h2>
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Starting Price ($)
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...register('startPrice', { required: true })}
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Bid Step ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stepPrice', { required: true })}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('startAt', { required: true })}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('endAt', { required: true })}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-4 bg-amber-500 text-slate-900 font-black rounded-2xl shadow-xl hover:bg-amber-400 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    PUBLISH AUCTION <Gavel size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateAuction;
