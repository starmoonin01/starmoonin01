
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Participant, Winner, Group } from './types';
import ParticipantManager from './components/ParticipantManager';
import LuckyDraw from './components/LuckyDraw';
import TeamGrouping from './components/TeamGrouping';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIST);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hr_participants');
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved participants");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('hr_participants', JSON.stringify(participants));
  }, [participants]);

  const handleUpdateParticipants = (newList: Participant[]) => {
    setParticipants(newList);
  };

  const handleAddWinner = (winner: Winner) => {
    setWinners(prev => [winner, ...prev]);
  };

  const clearWinners = () => setWinners([]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-white p-2 rounded-lg shadow-inner">
              <i className="fa-solid fa-users-gear text-indigo-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HR Success Suite</h1>
              <p className="text-indigo-100 text-sm">Empowering workplace culture</p>
            </div>
          </div>
          
          <nav className="flex bg-white/10 rounded-full p-1 backdrop-blur-sm border border-white/20">
            <button 
              onClick={() => setActiveTab(AppTab.LIST)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.LIST ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-list-ul mr-2"></i>名單管理
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.DRAW)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.DRAW ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-trophy mr-2"></i>獎品抽籤
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.GROUPING)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === AppTab.GROUPING ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-people-group mr-2"></i>自動分組
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] border border-gray-100">
          {activeTab === AppTab.LIST && (
            <ParticipantManager 
              participants={participants} 
              onUpdate={handleUpdateParticipants} 
            />
          )}
          {activeTab === AppTab.DRAW && (
            <LuckyDraw 
              participants={participants} 
              winners={winners}
              onAddWinner={handleAddWinner}
              onClearWinners={clearWinners}
            />
          )}
          {activeTab === AppTab.GROUPING && (
            <TeamGrouping 
              participants={participants} 
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HR Success Suite. Built for modern workplaces.
        </div>
      </footer>
    </div>
  );
};

export default App;
