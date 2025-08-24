import React from 'react';
import { Home, Search, TrendingUp, MapPin, Grid3X3, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, description: 'Discover personalized news' },
    { id: 'search', label: 'Search', icon: Search, description: 'Find specific articles' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, description: 'Hot topics & viral news' },
    { id: 'nearby', label: 'Nearby', icon: MapPin, description: 'Local & regional news' },
    { id: 'categories', label: 'Categories', icon: Grid3X3, description: 'Browse by topic' },
  ];

  return (
    <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-xl shadow-blue-900/5 min-h-screen">
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">News Dashboard</h2>
        </div>

        <nav>
          <ul className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                        : 'hover:bg-white/60 text-gray-700 hover:text-gray-900'
                    } rounded-xl transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    {/* Active background glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl"></div>
                    )}
                    
                    <div className="relative flex items-center space-x-4 px-4 py-4">
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className={`font-semibold text-sm ${
                          isActive ? 'text-white' : 'text-gray-800'
                        }`}>
                          {tab.label}
                        </span>
                        <p className={`text-xs ${
                          isActive ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {tab.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/30">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">AI Powered</span>
            </div>
            <p className="text-xs text-blue-700">
              Intelligent news discovery with contextual understanding
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
