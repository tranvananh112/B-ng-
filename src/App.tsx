import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchLiveEvents, fetchScheduledEvents } from './services/sportApi';
import MatchDetail from './components/MatchDetail';

const SPORT_TABS = [
  { id: 'football', name: 'BÓNG ĐÁ', icon: '⚽' },
  { id: 'basketball', name: 'BÓNG RỔ', icon: '🏀' },
  { id: 'tennis', name: 'TENNIS', icon: '🎾' },
  { id: 'badminton', name: 'CẦU LÔNG', icon: '🏸' },
  { id: 'volleyball', name: 'BÓNG CHUYỀN', icon: '🏐' },
  { id: 'table-tennis', name: 'BÓNG BÀN', icon: '🏓' },
];

const FILTER_TABS = [
  { id: 'all', name: 'TẤT CẢ' },
  { id: 'live', name: 'LIVE', icon: '🔴' },
  { id: 'hot', name: 'HOT', icon: '🔥' },
  { id: 'vietnam', name: 'VIỆT NAM', icon: '🇻🇳' },
  { id: 'today', name: 'NAY', icon: '📅' },
  { id: 'tomorrow', name: 'MAI', icon: '📅' },
];

export default function App() {
  const [selectedSport, setSelectedSport] = useState<string>('football');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const tournaments = Array.from(new Set(events.map(e => e.tournament?.name).filter(Boolean)));

  useEffect(() => {
    setSelectedTournament('all');
    const loadEvents = async (isBackgroundRefresh = false) => {
      if (!isBackgroundRefresh) setLoading(true);
      try {
        const liveData = await fetchLiveEvents(selectedSport);
        let lEvents: any[] = [];
        if (liveData && liveData.events && Array.isArray(liveData.events)) {
          lEvents = liveData.events;
        } else if (Array.isArray(liveData)) {
          lEvents = liveData;
        }
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        const dateToday = today.toISOString().split('T')[0];
        const dateTomorrow = tomorrow.toISOString().split('T')[0];
        const dateDayAfter = dayAfter.toISOString().split('T')[0];
        
        let sEvents: any[] = [];
        try {
          const [scheduledDataToday, scheduledDataTomorrow, scheduledDataDayAfter] = await Promise.all([
            fetchScheduledEvents(selectedSport, dateToday),
            fetchScheduledEvents(selectedSport, dateTomorrow),
            fetchScheduledEvents(selectedSport, dateDayAfter)
          ]);
          
          const processEvents = (data: any) => {
            if (data && data.events && Array.isArray(data.events)) return data.events;
            if (Array.isArray(data)) return data;
            return [];
          };
          
          sEvents = [...processEvents(scheduledDataToday), ...processEvents(scheduledDataTomorrow), ...processEvents(scheduledDataDayAfter)];
        } catch (e) {
          console.error("Failed to fetch scheduled events", e);
        }
        
        const allEventsMap = new Map();
        [...sEvents, ...lEvents].forEach(e => {
          if (e.id) allEventsMap.set(e.id, e);
        });
        const allEvents = Array.from(allEventsMap.values());
        
        allEvents.sort((a, b) => {
          const aLive = a.status?.type === 'inprogress';
          const bLive = b.status?.type === 'inprogress';
          if (aLive && !bLive) return -1;
          if (!aLive && bLive) return 1;
          return (a.startTimestamp || 0) - (b.startTimestamp || 0);
        });

        setEvents(allEvents);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadEvents(true); // pass true to indicate background refresh
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedSport]);

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'live') return event.status?.type === 'inprogress';
    if (activeFilter === 'hot') {
      const str = JSON.stringify(event).toLowerCase();
      return str.includes('vietnam') || str.includes('việt nam') || str.includes('v-league');
    }
    if (activeFilter === 'vietnam') {
      const str = JSON.stringify(event).toLowerCase();
      return str.includes('vietnam') || str.includes('việt nam') || str.includes('v-league');
    }
    if (selectedTournament !== 'all' && event.tournament?.name !== selectedTournament) return false;
    return true;
  });

  const liveCount = events.filter(e => e.status?.type === 'inprogress').length;

  if (selectedEvent) {
    return <MatchDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-12">
      {/* Header */}
      <div className="flex justify-center py-6">
        <div className="bg-[#1a1a1a] rounded-full px-8 py-3 text-lg md:text-xl font-bold text-gray-300 shadow-lg border border-[#333]">
          XOILAC TV XEM TRỰC TIẾP BÓNG ĐÁ XOILACTV, XÔI LẠC 90PHUT #1 VN
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sports Navigation */}
        <div className="flex items-center bg-[#1a1a1a] rounded-xl p-2 mb-6 overflow-x-auto border border-[#222] hide-scrollbar">
          {SPORT_TABS.map(sport => {
            const isActive = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center whitespace-nowrap px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-[#0055a4] text-white shadow-[0_0_15px_rgba(0,85,164,0.5)]' 
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                <span className="mr-2 text-lg">{sport.icon}</span>
                {sport.name}
                {sport.id === 'football' && (
                  <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm">Live</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters Navigation */}
        <div className="flex items-center space-x-3 mb-8 overflow-x-auto hide-scrollbar">
          {FILTER_TABS.map(filter => {
            const isActive = activeFilter === filter.id;
            let count = 0;
            if (filter.id === 'all') count = events.length;
            if (filter.id === 'live') count = liveCount;
            if (filter.id === 'hot') count = events.filter(e => JSON.stringify(e).toLowerCase().includes('vietnam')).length;
            if (filter.id === 'vietnam') count = events.filter(e => {
              const str = JSON.stringify(e).toLowerCase();
              return str.includes('vietnam') || str.includes('việt nam') || str.includes('v-league');
            }).length;
            if (filter.id === 'today') count = events.length; // Simplified
            if (filter.id === 'tomorrow') count = 0; // Simplified

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center whitespace-nowrap px-4 py-2 rounded-md font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-[#00a859] text-white' 
                    : 'bg-[#1a1a1a] text-gray-300 border border-[#333] hover:bg-[#2a2a2a]'
                }`}
              >
                {filter.icon && <span className="mr-2">{filter.icon}</span>}
                {filter.name}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-[#007a41]' : 'bg-[#333]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          
          <div className="ml-auto">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="bg-[#1a1a1a] text-gray-300 border border-[#333] rounded-md px-4 py-2 text-sm font-bold focus:outline-none hover:bg-[#2a2a2a]"
            >
              <option value="all">Tất cả giải đấu</option>
              {tournaments.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Match Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-[#00a859] animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-xl border border-[#333]">
            Không có trận đấu nào.
          </div>
        ) : (
          (() => {
            const groupedEvents = filteredEvents.reduce((acc, event) => {
              const tournament = event.tournament?.name || 'Khác';
              if (!acc[tournament]) acc[tournament] = [];
              acc[tournament].push(event);
              return acc;
            }, {} as Record<string, any[]>);

            return Object.entries(groupedEvents).map(([tournament, events]: [string, any[]]) => (
              <div key={tournament} className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-[#00a859] pl-3">{tournament}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {events.map((event: any, idx: number) => (
                    <MatchCard key={event.id || idx} event={event} onClick={() => setSelectedEvent(event)} />
                  ))}
                </div>
              </div>
            ));
          })()
        )}
      </div>
    </div>
  );
}

function MatchCard({ event, onClick }: { event: any; key?: string | number; onClick?: () => void }) {
  const homeTeam = event.homeTeam?.name || 'Home';
  const awayTeam = event.awayTeam?.name || 'Away';
  const homeScore = event.homeScore?.current;
  const awayScore = event.awayScore?.current;
  const isLive = event.status?.type === 'inprogress';
  const statusDesc = event.status?.description || '';
  const hasScore = homeScore !== undefined && awayScore !== undefined;
  
  const homeLogo = `/api/sofascore/image/team/${event.homeTeam?.id}`;
  const awayLogo = `/api/sofascore/image/team/${event.awayTeam?.id}`;

  let timeDisplay = '';
  if (event.startTimestamp) {
    const date = new Date(event.startTimestamp * 1000);
    timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  }

  const [liveMinute, setLiveMinute] = useState(statusDesc || 'Trực tiếp');

  useEffect(() => {
    if (!isLive) return;

    const updateMinute = () => {
      const code = event.status?.code;
      const desc = event.status?.description || 'Trực tiếp';
      
      if (code === 31) {
        setLiveMinute('Nghỉ giữa hiệp');
        return;
      }
      
      const periodStart = event.time?.currentPeriodStartTimestamp;
      const initial = event.time?.initial || 0;
      
      if (periodStart) {
        const diff = Math.floor(Date.now() / 1000) - periodStart;
        const min = Math.floor(diff / 60) + Math.floor(initial / 60);
        
        let displayStr = `${min}'`;
        
        if (code === 6 && min > 45) {
          displayStr = `45+${min - 45}'`;
        } else if (code === 7 && min > 90) {
          displayStr = `90+${min - 90}'`;
        }
        
        setLiveMinute(displayStr);
      } else {
        setLiveMinute(desc === 'Started' ? "Đang diễn ra" : desc);
      }
    };

    updateMinute();
    const interval = setInterval(updateMinute, 10000);
    return () => clearInterval(interval);
  }, [isLive, event.time, event.status]);

  // Mock commentators
  const commentators = [
    { name: 'TẠ BIÊN GIỚI', avatar: 'https://i.pravatar.cc/150?u=1' },
    { name: 'RÔSI', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'DECO', avatar: 'https://i.pravatar.cc/150?u=3' },
  ];

  return (
    <div onClick={onClick} className="bg-[#111111] border border-[#333] hover:border-red-600 rounded-xl p-4 relative overflow-hidden group transition-colors flex flex-col cursor-pointer">
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div className="text-sm font-bold text-gray-200 truncate max-w-[60%]">
          {event.tournament?.name || 'Giải đấu'}
        </div>
        <div className="bg-[#1a3a28] text-[#4ade80] text-xs px-3 py-1 rounded-full border border-[#00a859]/30 font-mono">
          {timeDisplay}
        </div>
      </div>

      {/* Live Badge (Center Top) */}
      {isLive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#00a859] text-white text-xs font-bold px-6 py-1 rounded-b-lg z-20 shadow-[0_0_10px_rgba(0,168,89,0.5)]">
          {liveMinute}
        </div>
      )}

      {/* Teams and Score */}
      <div className="flex justify-center items-center space-x-4 mb-6 z-10">
        {/* Home Team */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          <div className="flex flex-col items-end">
            <span className="font-bold text-sm md:text-base text-right truncate text-white">{homeTeam}</span>
            {event.homeTeam?.country?.alpha2 && (
              <img src={`https://flagcdn.com/w20/${event.homeTeam.country.alpha2.toLowerCase()}.png`} alt={event.homeTeam.country.name} className="h-3 mt-1 rounded-sm opacity-80" />
            )}
          </div>
          <div className="w-12 h-12 bg-[#222] rounded-full p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img src={homeLogo} alt={homeTeam} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-500">Logo</span>'; }} />
          </div>
        </div>

        {/* Score / VS */}
        <div className="flex items-center justify-center min-w-[90px]">
          {hasScore ? (
            <div className="flex items-center">
              <div className="bg-[#1e3a8a] text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-l-full border-r border-[#111]">
                {homeScore}
              </div>
              <div className="bg-[#5b21b6] text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-r-full border-l border-[#111]">
                {awayScore}
              </div>
            </div>
          ) : (
            <div className="bg-[#1e3a8a] text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(30,58,138,0.5)]">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-3 flex-1 justify-start">
          <div className="w-12 h-12 bg-[#222] rounded-full p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img src={awayLogo} alt={awayTeam} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-500">Logo</span>'; }} />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm md:text-base text-left truncate text-white">{awayTeam}</span>
            {event.awayTeam?.country?.alpha2 && (
              <img src={`https://flagcdn.com/w20/${event.awayTeam.country.alpha2.toLowerCase()}.png`} alt={event.awayTeam.country.name} className="h-3 mt-1 rounded-sm opacity-80" />
            )}
          </div>
        </div>
      </div>

      {/* Sub Score (HT) */}
      <div className="flex justify-center mb-6 z-10">
        <div className="bg-[#222] text-gray-400 text-xs px-4 py-1.5 rounded-full flex items-center space-x-2 border border-[#333]">
          <span className="text-[#00a859] font-bold">HT</span>
          <span>{event.homeScore?.period1 ?? '-'} - {event.awayScore?.period1 ?? '-'}</span>
          <span className="text-gray-600">|</span>
          <span className="text-red-500">FT</span>
          <span>{event.homeScore?.normaltime ?? '-'} - {event.awayScore?.normaltime ?? '-'}</span>
        </div>
      </div>

      {/* Commentators */}
      <div className="flex items-center justify-between border-t border-[#222] pt-3 mt-auto z-10">
        <button className="text-gray-500 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
        <div className="flex space-x-4 overflow-hidden px-2">
          {commentators.map((c, i) => (
            <div key={i} className="flex items-center space-x-2">
              <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full" />
              <span className="text-[10px] md:text-xs text-gray-300 font-medium uppercase whitespace-nowrap">{c.name}</span>
            </div>
          ))}
        </div>
        <button className="text-gray-500 hover:text-white transition-colors"><ChevronRight size={18} /></button>
      </div>
      
      {/* Background glow effect for live matches */}
      {isLive && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#00a859]/5 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
}
