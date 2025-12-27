
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { generateTeamNames } from '../services/geminiService';

interface Props {
  participants: Participant[];
}

const TeamGrouping: React.FC<Props> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('Professional');

  // Using a standard function declaration for generic in .tsx to avoid ambiguity
  function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleGroup = async () => {
    if (participants.length === 0) {
      alert("請先匯入參加者！");
      return;
    }
    
    setIsGenerating(true);
    // Explicitly type the result to ensure Participant[] type is maintained
    const shuffled: Participant[] = shuffle(participants);
    const numGroups = Math.ceil(shuffled.length / groupSize);
    
    const aiNames = await generateTeamNames(numGroups, theme);
    
    const newGroups: Group[] = [];
    for (let i = 0; i < numGroups; i++) {
      newGroups.push({
        id: Math.random().toString(36).substr(2, 9),
        name: aiNames[i] || `Team ${i + 1}`,
        members: shuffled.slice(i * groupSize, (i + 1) * groupSize)
      });
    }

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;

    // Build CSV content
    // Adding BOM for Excel Chinese character compatibility
    let csvContent = "\ufeff組別,成員姓名\n";
    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `"${group.name}","${member.name}"\n`;
      });
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">自動分組</h2>
          <p className="text-gray-500">根據人數自動平衡隊伍，並生成創意隊名</p>
        </div>
        {groups.length > 0 && (
          <button 
            onClick={downloadCSV}
            className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 font-bold py-2 px-6 rounded-xl hover:bg-emerald-100 transition flex items-center shadow-sm"
          >
            <i className="fa-solid fa-file-export mr-2"></i> 下載分組紀錄 (CSV)
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wide">每組人數</label>
          <input 
            type="number" 
            min="1" 
            max={participants.length}
            value={groupSize}
            onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-gray-700 text-sm font-bold mb-2 uppercase tracking-wide">隊名主題 (AI)</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Professional">專業職場</option>
            <option value="Superheroes">超級英雄</option>
            <option value="Animals">叢林猛獸</option>
            <option value="Outer Space">宇宙探索</option>
            <option value="Food">美味珍饈</option>
          </select>
        </div>

        <button 
          onClick={handleGroup}
          disabled={isGenerating || participants.length === 0}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition shadow-lg flex items-center disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <i className="fa-solid fa-wand-sparkles fa-spin mr-2"></i> 分配中...
            </>
          ) : (
            <>
              <i className="fa-solid fa-bolt mr-2"></i> 開始分組
            </>
          )}
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, idx) => (
            <div key={group.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500 animate-fadeIn">
              <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                <h4 className="font-black text-indigo-700">{group.name}</h4>
                <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">
                  {group.members.length} 人
                </span>
              </div>
              <ul className="p-4 space-y-2">
                {group.members.map((member, mIdx) => (
                  <li key={mIdx} className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-xs text-gray-400 font-bold">
                      {mIdx + 1}
                    </div>
                    {member.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400">
          <i className="fa-solid fa-layer-group text-4xl mb-4"></i>
          <p>尚未進行分組</p>
        </div>
      )}
    </div>
  );
};

export default TeamGrouping;
