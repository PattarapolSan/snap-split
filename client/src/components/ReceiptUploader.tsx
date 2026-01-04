import React, { useState, useRef } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useRoomStore } from '../store/roomStore';

interface ReceiptUploaderProps {
    roomCode: string;
    onItemsFound: (items: any[]) => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ roomCode, onItemsFound }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const store = useRoomStore();

    const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/jpeg', 0.8); // 80% quality
            };
            img.onerror = reject;
        });
    };

    const processImage = async (file: File) => {
        if (!file) return;
        setAnalyzing(true);
        try {
            // Resize image to ensure it is smaller than 5MB and faster to upload
            const processedFile = await resizeImage(file);

            const result = await api.analysisReceipt(roomCode, processedFile);

            if (result.items && result.items.length > 0) {
                let count = 0;
                for (const item of result.items) {
                    await api.addItem(roomCode, store.room!.id, item.name, item.price, item.quantity);
                    count++;
                }

                alert(`Successfully added ${count} items from receipt!`);
                onItemsFound(result.items);
            } else {
                alert('No items found in receipt. Please try again or enter manually.');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze receipt. Image might be too large or unclear.');
        } finally {
            setAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <button
                disabled={analyzing}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    w-full py-4 px-6 rounded-2xl font-bold shadow-md border transition-all flex items-center justify-center gap-3 active:scale-[0.98]
                    ${analyzing
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700'
                    }
                `}
            >
                {analyzing ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-6 h-6" />
                        Upload Receipt
                    </>
                )}
            </button>
        </div>
    );
};

export default ReceiptUploader;
