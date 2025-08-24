import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeTab from './components/HomeTab';
import SearchTab from './components/SearchTab';
import TrendingTab from './components/TrendingTab';
import NearbyTab from './components/NearbyTab';
import CategoriesTab from './components/CategoriesTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'search':
        return <SearchTab />;
      case 'trending':
        return <TrendingTab />;
      case 'nearby':
        return <NearbyTab />;
      case 'categories':
        return <CategoriesTab />;
      default:
        return <HomeTab />;
    }
  };

  const handleSetLocation = () => {
    // This would typically open a location picker modal
    // For now, we'll just show an alert
    alert('Location setting feature would open here. Please allow location access in your browser.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <Header onSetLocation={handleSetLocation} />
      
      <div className="flex relative z-10">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
