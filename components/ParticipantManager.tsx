
import React, { useState, useMemo } from 'react';
import { Participant } from '../types';

interface Props {
  participants: Participant[];
  onUpdate: (newList: Participant[]) => void;
}

const MOCK_NAMES = [
  "王小明", "李美玲", "張家豪", "陳怡君", "林俊傑", 
  "周杰倫", "蔡英文", "柯文哲", "郭台銘", "徐若瑄",
  "黃子佼", "吳宗憲", "陶晶瑩", "蕭敬騰", "鄧紫棋",
  "蔡依林", "羅志祥", "楊丞琳", "潘瑋柏", "林志玲"
];

const ParticipantManager: React.FC<Props> = ({ participants, onUpdate }) => {
  const [inputText, setInputText] = useState('');

  // Calculate duplicates for UI marking
  const nameFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    participants.forEach(p => {
      freq[p.name] = (freq[p.name] || 0) + 1;
    });
    return freq;
  }, [participants]);

  const hasDuplicates = useMemo(() => {
    return Object.values(nameFrequency).some(count => count > 1);
  }, [nameFrequency]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processTextData(text);
    };
    reader.readAsText(file);
    // Reset file input so same file can be uploaded again
    e.target.value = '';
  };

  const processTextData = (text: string) => {
    const lines = text.split(/[\n,]+/).map(line => line.trim()).filter(line => line !== '');
    const newParticipants: Participant[] = lines.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    onUpdate([...participants, ...newParticipants]);
    setInputText('');
  };

  const handlePasteSubmit = () => {
    if (!inputText.trim()) return;
    processTextData(inputText);
  };

  const addMockData = () => {
    const mockParticipants: Participant[] = MOCK_NAMES.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    onUpdate([...participants, ...mockParticipants]);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueParticipants = participants.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    onUpdate(uniqueParticipants);
  };

  const removeItem = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id));
  };

  const clearAll = () => {
    if (confirm("確定要清除所有名單嗎？")) {
      onUpdate([]);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">名單來源管理</h2>
          <p className="text-gray-500">上傳 CSV 檔案、貼上姓名列表或使用模擬數據</p>
        </div>
        <button 
          onClick={addMockData}
          className="bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-2 px-6 rounded-xl hover:bg-indigo-50 transition flex items-center shadow-sm"
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> 產生模擬名單
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-6">
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
            <label className="block text-indigo-700 font-semibold mb-3">
              <i className="fa-solid fa-file-csv mr-2"></i>上傳檔案 (.csv / .txt)
            </label>
            <input 
              type="file" 
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-gray-700 font-semibold">
              <i className="fa-solid fa-paste mr-2"></i>貼上姓名
            </label>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：&#10;王小明&#10;李大華, 陳美麗&#10;張家豪"
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <button 
              onClick={handlePasteSubmit}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg active:scale-[0.98]"
            >
              新增至名單
            </button>
          </div>
        </div>

        {/* List Preview */}
        <div className="flex flex-col border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">目前名單 ({participants.length} 人)</span>
            <div className="flex space-x-3">
              {hasDuplicates && (
                <button 
                  onClick={removeDuplicates}
                  className="text-amber-600 hover:text-amber-700 text-sm font-bold transition flex items-center"
                  title="移除所有重複姓名，僅保留第一個"
                >
                  <i className="fa-solid fa-filter-circle-xmark mr-1"></i> 移除重複
                </button>
              )}
              {participants.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition flex items-center"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> 清除全部
                </button>
              )}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto max-h-[400px]">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <i className="fa-solid fa-user-slash text-4xl mb-2"></i>
                <p>尚無名單數據</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {participants.map((p, idx) => {
                  const isDuplicate = nameFrequency[p.name] > 1;
                  return (
                    <li key={p.id} className={`p-3 px-6 flex justify-between items-center hover:bg-gray-50 transition group ${isDuplicate ? 'bg-amber-50/30' : ''}`}>
                      <div className="flex items-center">
                        <span className="text-gray-300 text-xs mr-3">{idx + 1}.</span>
                        <span className={`font-medium ${isDuplicate ? 'text-amber-700' : 'text-gray-700'}`}>
                          {p.name}
                        </span>
                        {isDuplicate && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-bold uppercase tracking-wider">
                            重複
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeItem(p.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManager;
