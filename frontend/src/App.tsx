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
    <div className="min-h-screen bg-gray-50">
      <Header onSetLocation={handleSetLocation} />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 bg-gray-50 min-h-screen">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default App;
