import React, { useState } from 'react';
import { X, DollarSign, AlertTriangle } from 'lucide-react';
import { Auction } from '../types';

interface BidModalProps {
  auction: Auction;
  onClose: () => void;
  onBid: (auctionId: string, amount: number) => void;
}

const BidModal: React.FC<BidModalProps> = ({ auction, onClose, onBid }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (amount <= auction.currentBid) {
      alert('La puja debe ser superior a la actual');
      return;
    }
    
    if (showConfirm) {
      onBid(auction.id, amount);
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {showConfirm ? 'Confirmar Puja' : 'Realizar Puja'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <img
            src={auction.product.images[0]}
            alt={auction.product.name}
            className="w-full h-32 object-cover rounded-lg mb-4"
          />
          <h4 className="font-semibold text-gray-900">{auction.product.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{auction.product.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Puja actual:</span>
            <span className="text-lg font-bold text-amber-600">
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(auction.currentBid)}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Puja mínima:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(auction.currentBid + 1)}
            </span>
          </div>
        </div>

        {!showConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importe de la puja
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={auction.currentBid + 1}
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder={`Mínimo ${formatCurrency(auction.currentBid + 1)}`}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!bidAmount || parseFloat(bidAmount) <= auction.currentBid}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Confirmar puja</span>
              </div>
              <p className="text-green-700 mt-2">
                ¿Estás seguro de que quieres pujar {formatCurrency(parseFloat(bidAmount))} por este artículo?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                Confirmar Puja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidModal;