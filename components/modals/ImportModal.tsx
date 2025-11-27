
import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ICONS } from '../../constants';
import type { Sku } from '../../types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (skus: Omit<Sku, 'id'>[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        setIsParsing(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) throw new Error('File is empty');

                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                if (lines.length < 2) throw new Error('CSV must have a header and at least one data row');

                const headers = lines[0].split(',').map(h => h.trim());
                
                // Basic validation
                const requiredFields = ['name', 'skuId', 'price'];
                const missingFields = requiredFields.filter(f => !headers.includes(f));
                if (missingFields.length > 0) {
                    throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
                }

                const data = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const row: any = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index]?.trim();
                    });
                    return row;
                });

                setPreviewData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to parse CSV');
                setPreviewData([]);
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        if (previewData.length === 0) return;

        // Transform CSV data to Sku objects
        // In a real app, you would handle ID conflicts, validation, etc. here
        const newSkus: Omit<Sku, 'id'>[] = previewData.map(row => ({
            name: row.name || 'Unknown',
            skuId: row.skuId || `TMP-${Math.random().toString(36).substr(2, 5)}`,
            price: row.price ? parseInt(row.price) : 0,
            barcode: row.barcode,
            categoryIds: [], // Advanced: Parse categories from CSV if needed
            attributeSetIds: [],
            attributeValues: {},
            imageUrl: row.imageUrl
        }));

        onImport(newSkus);
        handleClose();
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="SKUインポート (CSV)">
            <div className="space-y-6">
                {!file ? (
                    <div 
                        className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept=".csv" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                        />
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                            {ICONS.upload}
                        </div>
                        <h4 className="font-bold text-zinc-800 dark:text-white mb-1">CSVファイルをアップロード</h4>
                        <p className="text-sm text-zinc-500">ドラッグ＆ドロップ または クリックして選択</p>
                        <p className="text-xs text-zinc-400 mt-4">必須カラム: name, skuId, price</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l4 4a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-800 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">変更</button>
                        </div>

                        {error ? (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                <strong>エラー:</strong> {error}
                            </div>
                        ) : (
                            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                    <span className="text-xs font-bold text-zinc-500 uppercase">プレビュー (最初の5件)</span>
                                    <span className="text-xs text-zinc-500">全 {previewData.length} 件</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                {previewData.length > 0 && Object.keys(previewData[0]).map(header => (
                                                    <th key={header} className="px-4 py-2 font-medium text-zinc-500">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {previewData.slice(0, 5).map((row, i) => (
                                                <tr key={i} className="bg-white dark:bg-zinc-900">
                                                    {Object.values(row).map((val: any, j) => (
                                                        <td key={j} className="px-4 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={handleClose}>キャンセル</Button>
                    <Button onClick={handleConfirmImport} disabled={!file || !!error || isParsing}>
                        インポート実行
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
