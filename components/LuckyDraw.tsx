
import React, { useState, useEffect, useRef } from 'react';
import { Participant, Winner } from '../types';
import { generateWinnerAnnouncement } from '../services/geminiService';

interface Props {
  participants: Participant[];
  winners: Winner[];
  onAddWinner: (winner: Winner) => void;
  onClearWinners: () => void;
}

const LuckyDraw: React.FC<Props> = ({ participants, winners, onAddWinner, onClearWinners }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [currentPrize, setCurrentPrize] = useState('');
  const [announcement, setAnnouncement] = useState('');
  
  const timerRef = useRef<number | null>(null);

  const availableParticipants = allowRepeat 
    ? participants 
    : participants.filter(p => !winners.some(w => w.id === p.id));

  const startDraw = async () => {
    if (availableParticipants.length === 0) {
      alert("目前沒有可抽籤的參加者！");
      return;
    }

    setIsSpinning(true);
    setAnnouncement('');
    let speed = 50;
    let count = 0;
    const maxCount = 40 + Math.floor(Math.random() * 20);

    const spin = () => {
      setCurrentIndex(prev => (prev + 1) % availableParticipants.length);
      count++;
      
      if (count < maxCount) {
        // Slow down as we reach the end
        if (count > maxCount * 0.7) speed += 10;
        timerRef.current = window.setTimeout(spin, speed);
      } else {
        finishDraw();
      }
    };

    spin();
  };

  const finishDraw = async () => {
    setIsSpinning(false);
    const winningParticipant = availableParticipants[currentIndex];
    
    const newWinner: Winner = {
      ...winningParticipant,
      prize: currentPrize || 'Lucky Prize',
      timestamp: Date.now()
    };
    
    onAddWinner(newWinner);

    // AI generated announcement for flair
    const aiText = await generateWinnerAnnouncement(winningParticipant.name);
    setAnnouncement(aiText);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="p-6 md:p-10 h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">獎品抽籤</h2>
          <p className="text-gray-500">設置獎項並開始心跳加速的隨機抽取</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={allowRepeat}
                onChange={() => setAllowRepeat(!allowRepeat)}
              />
              <div className={`block w-10 h-6 rounded-full transition ${allowRepeat ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${allowRepeat ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">允許重複獲獎</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Draw Area */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center space-y-8 bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200">
          <div className="w-full max-w-md">
            <label className="block text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">當前獎項</label>
            <input 
              type="text" 
              value={currentPrize}
              onChange={(e) => setCurrentPrize(e.target.value)}
              placeholder="例如：iPad, 禮券 1000 元"
              className="w-full p-4 text-xl border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none text-center bg-white shadow-inner"
              disabled={isSpinning}
            />
          </div>

          <div className="relative w-full max-w-lg aspect-video flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl border-4 border-indigo-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
            
            {availableParticipants.length > 0 ? (
              <div className={`text-center transition-all ${isSpinning ? 'scale-110' : 'scale-100'}`}>
                <h3 className={`text-5xl md:text-7xl font-black text-indigo-700 tracking-tight transition-all ${isSpinning ? 'blur-[1px]' : ''}`}>
                  {availableParticipants[currentIndex]?.name || '---'}
                </h3>
              </div>
            ) : (
              <div className="text-gray-400 text-center p-8">
                <i className="fa-solid fa-circle-exclamation text-4xl mb-4"></i>
                <p>請先匯入參加者名單</p>
              </div>
            )}

            {announcement && !isSpinning && (
              <div className="mt-6 px-6 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold animate-bounce-subtle">
                <i className="fa-solid fa-star mr-2"></i> {announcement}
              </div>
            )}
          </div>

          <button 
            onClick={startDraw}
            disabled={isSpinning || participants.length === 0}
            className={`px-12 py-5 rounded-full text-2xl font-black shadow-xl transition-all active:scale-95 ${
              isSpinning || participants.length === 0
                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/50'
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center">
                <i className="fa-solid fa-spinner fa-spin mr-3"></i> 抽取中...
              </span>
            ) : "開始抽籤"}
          </button>
          
          <p className="text-gray-400 text-xs">
            {allowRepeat ? "所有參加者均有獲獎機會" : `尚有 ${availableParticipants.length} 位具資格參加者`}
          </p>
        </div>

        {/* History Area */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">
              <i className="fa-solid fa-clock-rotate-left mr-2 text-indigo-500"></i>得獎紀錄
            </h3>
            {winners.length > 0 && (
              <button onClick={onClearWinners} className="text-xs text-gray-400 hover:text-red-500">清除紀錄</button>
            )}
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {winners.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <p className="text-sm italic">尚無紀錄</p>
              </div>
            ) : (
              winners.map((winner, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex justify-between items-center animate-fadeIn">
                  <div>
                    <div className="font-bold text-gray-800">{winner.name}</div>
                    <div className="text-xs text-indigo-600 font-medium">{winner.prize}</div>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(winner.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
