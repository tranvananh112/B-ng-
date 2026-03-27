import React, { useState, useEffect } from 'react';
import { ChevronLeft, Send, User, ExternalLink } from 'lucide-react';
import { fetchEventGraph } from '../services/sportApi';

interface MatchDetailProps {
  event: any;
  onBack: () => void;
}

export default function MatchDetail({ event, onBack }: MatchDetailProps) {
  const homeTeam = event.homeTeam?.name || 'Home Team';
  const awayTeam = event.awayTeam?.name || 'Away Team';
  const homeScore = event.homeScore?.current;
  const awayScore = event.awayScore?.current;
  const isLive = event.status?.type === 'inprogress';
  const statusDesc = event.status?.description || '';
  const hasScore = homeScore !== undefined && awayScore !== undefined;

  const homeLogo = `/api/sofascore/image/team/${event.homeTeam?.id}`;
  const awayLogo = `/api/sofascore/image/team/${event.awayTeam?.id}`;

  const [liveMinute, setLiveMinute] = useState(statusDesc || 'Trực tiếp');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [liveScoreUrl, setLiveScoreUrl] = useState<string | null>(null);

  useEffect(() => {
    if (event.id) {
      fetchEventGraph(event.id)
        .then(data => {
          if (data && data.graphPoints) {
            setGraphData(data.graphPoints);
          }
        })
        .catch(err => console.error("Failed to load graph", err));

      fetch(`/api/sportradar/live-score?event_id=${event.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.live_score_url) {
            const url = data.live_score_url.replace('http://', 'https://');
            setLiveScoreUrl(url);
          }
        })
        .catch(err => console.error("Failed to load live score url", err));
    }
  }, [event.id]);

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
        
        setLiveMinute(`HIỆP ${code === 6 ? 1 : 2}: ${displayStr}`);
      } else {
        setLiveMinute(desc === 'Started' ? "Đang diễn ra" : desc);
      }
    };

    updateMinute();
    const interval = setInterval(updateMinute, 10000);
    return () => clearInterval(interval);
  }, [isLive, event.time, event.status]);

  return (
    <div className="bg-[#111111] min-h-screen text-white font-sans">
      {/* Top Banner Ad */}
      <div className="w-full bg-[#0055a4] flex justify-center py-2 mb-4">
        <img src="https://via.placeholder.com/1200x60/0055a4/ffffff?text=8XBET+-+%C4%90%E1%BB%90I+T%C3%81C+CH%C3%8DNH+TH%E1%BB%A8C+CLB+CHELSEA+T%E1%BA%A0I+CH%C3%82U+%C3%81" alt="Ad" className="max-h-[60px] object-contain" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Match Header */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 border border-[#333] relative flex items-center justify-between">
          <button onClick={onBack} className="absolute left-4 top-4 text-gray-400 hover:text-white flex items-center">
            <ChevronLeft size={20} /> <span className="text-sm ml-1">Trở lại</span>
          </button>

          {/* Left Stats (Corners/Cards) */}
          <div className="flex space-x-4 mt-8 md:mt-0 ml-4 md:ml-24">
            <div className="flex items-center space-x-1 bg-[#222] px-3 py-1 rounded-md text-sm border border-[#333]">
              <span className="w-3 h-4 bg-yellow-400 rounded-sm inline-block"></span>
              <span className="w-3 h-4 bg-red-500 rounded-sm inline-block ml-1"></span>
              <span className="ml-2 font-mono">1 - 0</span>
            </div>
            <div className="flex items-center space-x-1 bg-[#222] px-3 py-1 rounded-md text-sm border border-[#333]">
              <span className="text-gray-400">⛳</span>
              <span className="ml-2 font-mono">4 - 5</span>
            </div>
          </div>

          {/* Center Match Info */}
          <div className="flex flex-col items-center justify-center flex-1">
            {isLive && (
              <div className="text-[#00a859] text-sm font-bold mb-2 flex items-center">
                <span className="w-2 h-2 bg-[#00a859] rounded-full mr-2 animate-pulse"></span>
                {liveMinute}
              </div>
            )}
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg md:text-xl text-right">{homeTeam}</span>
                <div className="w-14 h-14 bg-[#222] rounded-full p-1 flex items-center justify-center overflow-hidden">
                  <img src={homeLogo} alt={homeTeam} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-500">Logo</span>'; }} />
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-[#1e3a8a] text-white font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-l-full border-r border-[#111]">
                  {hasScore ? homeScore : '-'}
                </div>
                <div className="bg-[#5b21b6] text-white font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-r-full border-l border-[#111]">
                  {hasScore ? awayScore : '-'}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-[#222] rounded-full p-1 flex items-center justify-center overflow-hidden">
                  <img src={awayLogo} alt={awayTeam} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-500">Logo</span>'; }} />
                </div>
                <span className="font-bold text-lg md:text-xl text-left">{awayTeam}</span>
              </div>
            </div>
          </div>

          {/* Right Stats / Voting */}
          <div className="hidden md:flex flex-col items-center mr-8">
            <span className="text-xs text-gray-400 mb-2 uppercase font-bold">Theo bạn thì trận này tài hay xỉu?</span>
            <div className="flex space-x-2">
              <button className="bg-[#222] hover:bg-[#333] border border-[#444] px-4 py-1.5 rounded text-sm transition-colors">TÀI 50%</button>
              <button className="bg-[#222] hover:bg-[#333] border border-[#444] px-4 py-1.5 rounded text-sm transition-colors">XỈU 50%</button>
            </div>
          </div>
        </div>

        {/* Odds Table */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] mb-4 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="bg-[#222] text-gray-400 border-b border-[#333]">
                <th className="py-3 px-4 font-normal">Chọn nhà cái</th>
                <th colSpan={3} className="py-3 px-4 font-normal border-l border-[#333]">CHÂU Á</th>
                <th colSpan={3} className="py-3 px-4 font-normal border-l border-[#333]">CHÂU ÂU</th>
                <th colSpan={3} className="py-3 px-4 font-normal border-l border-[#333]">TÀI XỈU</th>
                <th colSpan={3} className="py-3 px-4 font-normal border-l border-[#333]">PHẠT GÓC</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-[#333] hover:bg-[#222] transition-colors">
                <td className="py-3 px-4 font-bold text-blue-400" rowSpan={2}>8XBET</td>
                <td className="py-2 px-2 border-l border-[#333] font-bold text-gray-400">HIỆP 1</td>
                <td className="py-2 px-2">0.94</td>
                <td className="py-2 px-2">-3</td>
                <td className="py-2 px-2">0.78</td>
                <td className="py-2 px-2 border-l border-[#333]">20</td>
                <td className="py-2 px-2">11</td>
                <td className="py-2 px-2">1.02</td>
                <td className="py-2 px-2 border-l border-[#333]">0.86</td>
                <td className="py-2 px-2">3.5/4</td>
                <td className="py-2 px-2">0.86</td>
                <td className="py-2 px-2 border-l border-[#333] font-bold text-gray-400">SỚM</td>
                <td className="py-2 px-2">1.08</td>
                <td className="py-2 px-2">9</td>
                <td className="py-2 px-2">1.11</td>
              </tr>
              <tr className="hover:bg-[#222] transition-colors">
                <td className="py-2 px-2 border-l border-[#333] font-bold text-gray-400">FT</td>
                <td className="py-2 px-2">0.78</td>
                <td className="py-2 px-2">-0.5/1</td>
                <td className="py-2 px-2">1.06</td>
                <td className="py-2 px-2 border-l border-[#333]">23</td>
                <td className="py-2 px-2">11.5</td>
                <td className="py-2 px-2">1.01</td>
                <td className="py-2 px-2 border-l border-[#333]">0.75</td>
                <td className="py-2 px-2">1.5/2</td>
                <td className="py-2 px-2">1.07</td>
                <td className="py-2 px-2 border-l border-[#333] font-bold text-gray-400">FT</td>
                <td className="py-2 px-2">0.81</td>
                <td className="py-2 px-2">7</td>
                <td className="py-2 px-2">1.01</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Middle Banner Ad */}
        <div className="w-full bg-[#facc15] text-black text-center py-1.5 font-bold text-sm mb-1">
          Anh Em Muốn Tham Gia Đặt Cược Thì Click Vào Quảng Cáo Của 8XBET Để Đăng Ký Đặt Cược Tất Cả Các Trận Đấu Trên
        </div>
        <div className="w-full bg-[#0055a4] flex justify-center py-2 mb-6">
          <img src="https://via.placeholder.com/1200x60/0055a4/ffffff?text=8XBET+-+%C4%90%E1%BB%90I+T%C3%81C+CH%C3%8DNH+TH%E1%BB%A8C+CLB+CHELSEA+T%E1%BA%A0I+CH%C3%82U+%C3%81" alt="Ad" className="max-h-[60px] object-contain" />
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          
          {/* Left Side: Pitch / Stream */}
          <div className="flex-1 bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[#333]">
              <button className="flex-1 py-3 text-center font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors">
                <span className="text-[#00a859] mr-2">((</span> TRỰC TIẾP <span className="text-[#00a859] ml-2">))</span>
              </button>
              <button className="flex-1 py-3 text-center font-bold bg-[#00a859] text-white border-b-2 border-[#00a859]">
                ⚽ MÔ PHỎNG
              </button>
              <button className="flex-1 py-3 text-center font-bold text-yellow-500 hover:bg-[#222] transition-colors flex items-center justify-center">
                <ExternalLink size={16} className="mr-2" /> CHIA SẺ
              </button>
            </div>
            
            {/* Pitch Area */}
            <div className="relative w-full aspect-video bg-[#111] flex flex-col items-center justify-center overflow-hidden">
              {liveScoreUrl ? (
                <button 
                  onClick={() => window.open(liveScoreUrl, '_blank')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all"
                >
                  Xem mô phỏng trực tiếp
                </button>
              ) : (
                <div className="relative w-full h-full bg-[#4ade80] flex flex-col items-center justify-center overflow-hidden">
                  {/* Fake Pitch Lines */}
                  <div className="absolute inset-4 border-2 border-white/50 rounded-sm"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-4 w-16 h-32 border-2 border-white/50 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-4 w-16 h-32 border-2 border-white/50 transform -translate-y-1/2"></div>
                  
                  <div className="z-10 text-white/80 font-bold text-4xl tracking-widest opacity-30">XOILACZ.CO</div>
                </div>
              )}
            </div>

            {/* Momentum Graph */}
            <div className="bg-[#111] p-4 border-t border-[#333]">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className="flex items-center"><span className="w-2 h-2 bg-[#00a859] rounded-full mr-2"></span>{homeTeam}</span>
                <span className="font-bold text-white">{liveMinute}</span>
                <span className="flex items-center">{awayTeam}<span className="w-2 h-2 bg-[#3b82f6] rounded-full ml-2"></span></span>
              </div>
              <div className="h-20 w-full flex items-end relative border-b border-gray-700">
                {graphData.length > 0 ? (
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00a859" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#00a859" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={`M0,50 L${graphData.map(d => `${(d.minute / Math.max(90, ...graphData.map(p => p.minute))) * 100},${50 - (d.value / 2)}`).join(' L')} L${(graphData[graphData.length-1].minute / Math.max(90, ...graphData.map(p => p.minute))) * 100},50 Z`} 
                      fill="url(#grad)" 
                    />
                    <path 
                      d={`M0,50 L${graphData.map(d => `${(d.minute / Math.max(90, ...graphData.map(p => p.minute))) * 100},${50 - (d.value / 2)}`).join(' L')}`} 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="0.5" 
                      opacity="0.5"
                    />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#555" strokeWidth="0.5" />
                  </svg>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Đang tải dữ liệu sức ép...
                  </div>
                )}
                {/* Timeline markers */}
                <div className="absolute bottom-0 left-[16.6%] w-px h-2 bg-gray-500"></div>
                <div className="absolute bottom-0 left-[33.3%] w-px h-2 bg-gray-500"></div>
                <div className="absolute bottom-0 left-[50%] w-px h-3 bg-gray-400"></div>
                <div className="absolute bottom-0 left-[66.6%] w-px h-2 bg-gray-500"></div>
                <div className="absolute bottom-0 left-[83.3%] w-px h-2 bg-gray-500"></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                <span>0'</span>
                <span>15'</span>
                <span>30'</span>
                <span>HT</span>
                <span>60'</span>
                <span>75'</span>
                <span>90'</span>
              </div>
            </div>
          </div>

          {/* Right Side: Chat */}
          <div className="w-full lg:w-[350px] flex flex-col gap-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-[#333] flex flex-col h-[500px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-2 border-b border-[#333]">
                <div className="flex space-x-2">
                  <button className="bg-[#0088cc] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    <Send size={12} className="mr-1" /> TELEGRAM
                  </button>
                  <button className="bg-[#3b5998] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    <span className="mr-1 font-serif font-bold">f</span> FACEBOOK
                  </button>
                </div>
                <button className="bg-[#333] text-gray-300 text-xs px-3 py-1.5 rounded hover:bg-[#444]">
                  TẮT CHAT
                </button>
              </div>
              
              {/* Chat Messages (Mock) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm hide-scrollbar">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold">E</div>
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Enjoy</span>
                    <span className="text-gray-300">Má cái trận Chile thì đéo big, đi big tài 2m5 mấy thằng mọi đen sai thật sự</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">N</div>
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Đánh tài thua chung</span>
                    <span className="text-gray-300">Đm 2 kèo đi ngay con cho jam</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-6 h-6 rounded-full" alt="avatar" />
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Doliad springer</span>
                    <span className="text-[#00a859] mr-1">fan chexanh</span>
                    <span className="text-gray-300">ngu</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" className="w-6 h-6 rounded-full" alt="avatar" />
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Nếu không rực rỡ thì sao?</span>
                    <span className="text-gray-300">10Ft kh 😂</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704f" className="w-6 h-6 rounded-full" alt="avatar" />
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Bè bè</span>
                    <span className="text-gray-300">chile thì nổ còn th jamca nổ nốt đi cay vcc\</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">T</div>
                  <div>
                    <span className="font-bold text-yellow-500 mr-2">Đá ngu như bò</span>
                    <span className="text-gray-300">Tao thua tài Jmaica hôm nay cay thật</span>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-[#333] flex items-center space-x-2 bg-[#222]">
                <button className="text-gray-400 hover:text-white"><User size={18} /></button>
                <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-[#111] border border-[#333] rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#00a859]" />
                <button className="text-[#00a859] hover:text-green-400"><Send size={18} /></button>
              </div>
            </div>

            {/* Right Ad Block */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4">
              <h3 className="text-[#00a859] font-bold mb-3 border-l-4 border-[#00a859] pl-2">NHÀ CÁI UY TÍN</h3>
              <div className="bg-[#222] rounded-lg p-3 flex items-center justify-between border border-[#333]">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 text-black font-bold w-6 h-6 flex items-center justify-center rounded">1</div>
                  <div className="bg-white px-2 py-1 rounded">
                    <span className="text-blue-600 font-bold italic">8XBET</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-300 mb-1">BH thể thao cược đầu hoàn 100%</div>
                  <button className="bg-[#0088cc] hover:bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded transition-colors">CƯỢC NGAY</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
