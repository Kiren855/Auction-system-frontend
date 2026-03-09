import { createContext, useContext, useMemo, useState } from 'react';

const CreateAuctionContext = createContext(null);

export function CreateAuctionProvider({ children }) {
  const [mode, setMode] = useState('existing'); // existing | new
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');

  const [productData, setProductData] = useState({
    itemName: '',
    categoryId: '',
    categoryName: '',
    brand: '',
    condition: '',
    attributes: {},
    images: [], // File[]
  });

  const [auctionData, setAuctionData] = useState({
    title: '',
    startPrice: '',
    stepPrice: '',
    startAt: '', // datetime-local string
    durationMinutes: '', // string/number
  });

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selectedProductId,
      setSelectedProductId,
      selectedProductName,
      setSelectedProductName,
      productData,
      setProductData,
      auctionData,
      setAuctionData,
    }),
    [mode, selectedProductId, productData, auctionData],
  );

  return (
    <CreateAuctionContext.Provider value={value}>
      {children}
    </CreateAuctionContext.Provider>
  );
}

export function useCreateAuction() {
  const ctx = useContext(CreateAuctionContext);
  if (!ctx)
    throw new Error(
      'useCreateAuction must be used within CreateAuctionProvider',
    );
  return ctx;
}
