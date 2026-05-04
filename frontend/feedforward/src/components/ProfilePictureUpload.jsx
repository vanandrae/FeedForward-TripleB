import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePictureUpload = ({ currentImage, onImageUpload, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setError('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image (JPEG, PNG)');
    }
  };

  const getCroppedImg = () => {
    return new Promise((resolve) => {
      if (!completedCrop || !imgRef.current) {
        resolve(previewUrl);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      
      // Make image smaller (150x150)
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        150,
        150
      );
      
      // Compress as JPEG with 70% quality
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    });
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    
    setUploading(true);
    setError('');
    try {
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        console.log('Image data length:', croppedImage.length);
        await onImageUpload(croppedImage);
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile picture:', error);
      setError('Failed to save profile picture: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            ❌ {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-400 mt-1">Max size: 2MB. Recommended: Square image</p>
        </div>
        
        {previewUrl && (
          <div className="mb-4">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Crop preview"
                className="max-w-full max-h-64 object-contain"
              />
            </ReactCrop>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;