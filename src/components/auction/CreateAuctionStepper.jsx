export default function CreateAuctionStepper({ step }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
          ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}
        `}
        >
          1
        </div>
        <span className="text-sm">Sản phẩm</span>
      </div>

      <div className="flex-1 h-px bg-gray-300"></div>

      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
          ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}
        `}
        >
          2
        </div>
        <span className="text-sm">Thông tin đấu giá</span>
      </div>
    </div>
  );
}
