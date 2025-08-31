import React, { useState } from 'react';
import { X, Upload, Calendar, DollarSign, FileText, Image } from 'lucide-react';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';

interface CreateAuctionModalProps {
  onClose: () => void;
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ onClose }) => {
  const { createAuction } = useAuction();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [] as string[],
    documents: '',
    startDate: '',
    endDate: '',
    startingPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showConfirm) {
      // Create the auction
      const auction = {
        product: {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          images: formData.images.length > 0 ? formData.images : [
            'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          documents: formData.documents,
          startingPrice: parseFloat(formData.startingPrice),
        },
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        createdBy: user?.id || 'anonymous',
      };
      
      createAuction(auction);
      onClose();
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      // Clear form
      setFormData({
        name: '',
        description: '',
        images: [],
        documents: '',
        startDate: '',
        endDate: '',
        startingPrice: '',
      });
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSampleImage = () => {
    const sampleImages = [
      'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1030841/pexels-photo-1030841.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setFormData({
      ...formData,
      images: [...formData.images, randomImage],
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {showConfirm ? 'Confirmar Creación' : 'Crear Nueva Subasta'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {!showConfirm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Información del Producto</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Ej: Cuadro abstracto contemporáneo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                    placeholder="Describe el producto en detalle..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addSampleImage}
                      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Agregar imagen de muestra</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documentos (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="documents"
                      value={formData.documents}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="URL del documento PDF (opcional)"
                    />
                  </div>
                </div>
              </div>

              {/* Auction Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Detalles de la Subasta</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de inicio
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de fin
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de salida
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">
                  Confirmar creación de subasta
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Producto:</span>
                    <span className="font-medium text-green-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Fecha inicio:</span>
                    <span className="font-medium text-green-900">
                      {new Date(formData.startDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Fecha fin:</span>
                    <span className="font-medium text-green-900">
                      {new Date(formData.endDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Precio de salida:</span>
                    <span className="font-medium text-green-900">
                      {formatCurrency(parseFloat(formData.startingPrice))}
                    </span>
                  </div>
                </div>
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
                  Crear Subasta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionModal;