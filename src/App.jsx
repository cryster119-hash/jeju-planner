import React, { useState, useEffect } from 'react';
import { 
  Map, ListTodo, Plus, Trash2, CheckCircle2, Circle, MapPin, 
  Map as MapIcon, X, Bed, Star, Hotel, Banknote, Search, 
  Flower2, Calendar, Share2, Check, User, Heart, CloudLightning,
  MapPinned, Route, Globe, Car
} from 'lucide-react';

// Firebase 패키지 임포트
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Firebase Config - 환경변수로 관리
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 기본 데이터 세팅 (식사, 복귀, 이동시간 추가) ---
const OPTIMAL_SCHEDULES = {
  1: [
    { id: 101, time: '14:00', text: '제주공항 도착 및 렌터카 인수', query: '제주국제공항', driveTime: '40분' },
    { id: 102, time: '15:30', text: '구좌읍 송당리 (커피 및 소품샵)', query: '제주 송당리', driveTime: '15분' },
    { id: 103, time: '17:30', text: '동부 숙소 체크인 및 짐 풀기', query: '제주 에코랜드 호텔', driveTime: '15분' },
    { id: 104, time: '18:30', text: '저녁식사 (조천/함덕 인근 맛집)', query: '제주 조천읍 맛집', driveTime: '15분' },
    { id: 105, time: '20:00', text: '숙소 복귀 및 휴식', query: '제주 에코랜드 호텔' }
  ],
  2: [
    { id: 201, time: '09:30', text: '거문오름 탐방 (사전예약 필수)', query: '제주 거문오름', driveTime: '15분' },
    { id: 204, time: '12:00', text: '점심식사 (선흘리 인근 밥집)', query: '제주 선흘리 맛집', driveTime: '15분' },
    { id: 202, time: '13:30', text: '아부오름 (분화구 피크닉)', query: '제주 아부오름', driveTime: '25분' },
    { id: 203, time: '16:00', text: '혼인지 (6월 최고의 수국 명소)', query: '제주 혼인지', driveTime: '30분' },
    { id: 205, time: '18:00', text: '저녁식사 (성산 해산물/흑돼지)', query: '제주 성산 맛집', driveTime: '35분' },
    { id: 206, time: '20:00', text: '숙소 복귀', query: '제주 에코랜드 호텔' }
  ],
  3: [
    { id: 301, time: '10:00', text: '동부 숙소 체크아웃 및 이동', query: '제주 에코랜드 호텔', driveTime: '45분' },
    { id: 302, time: '11:00', text: '서귀포 치유의 숲 (편백 힐링)', query: '제주 서귀포 치유의 숲', driveTime: '20분' },
    { id: 305, time: '13:00', text: '점심식사 (서귀포 시내권)', query: '제주 서귀포 신시가지 맛집', driveTime: '30분' },
    { id: 303, time: '14:30', text: '대평리 마을 (박수기정 뷰 커피)', query: '제주 대평포구', driveTime: '15분' },
    { id: 304, time: '16:30', text: '서부 숙소 체크인 (신화월드)', query: '제주 신화월드 서머셋', driveTime: '10분' },
    { id: 306, time: '18:00', text: '저녁식사 (안덕/모슬포 인근)', query: '제주 안덕면 맛집', driveTime: '10분' },
    { id: 307, time: '19:30', text: '숙소 복귀 및 호캉스', query: '제주 신화월드 서머셋' }
  ],
  4: [
    { id: 401, time: '09:00', text: '가파도 선착장 이동', query: '제주 가파도 선착장', driveTime: '배 15분' },
    { id: 404, time: '10:00', text: '가파도 자전거 투어 & 섬 점심', query: '제주 가파도', driveTime: '배 15분' },
    { id: 402, time: '14:00', text: '안성리 수국길 (조용한 마을)', query: '제주 안성리 수국길', driveTime: '20분' },
    { id: 405, time: '16:00', text: '수월봉 엉알해안 (바닷바람 산책)', query: '제주 수월봉', driveTime: '15분' },
    { id: 403, time: '17:30', text: '신창풍차해안 (서쪽 일몰)', query: '제주 신창풍차해안도로', driveTime: '25분' },
    { id: 406, time: '18:30', text: '저녁식사 (한림 인근 분위기 좋은 곳)', query: '제주 한림 맛집', driveTime: '30분' },
    { id: 407, time: '20:30', text: '숙소 복귀', query: '제주 신화월드 서머셋' }
  ],
  5: [
    { id: 501, time: '10:00', text: '서부 숙소 체크아웃', query: '제주 신화월드 서머셋', driveTime: '15분' },
    { id: 502, time: '10:30', text: '사계해안 (지질트레일 구경)', query: '제주 사계해안', driveTime: '15분' },
    { id: 504, time: '12:00', text: '점심식사 (산방산 인근)', query: '제주 산방산 맛집', driveTime: '50분' },
    { id: 503, time: '14:00', text: '렌터카 반납 & 제주공항 이동', query: '제주국제공항' }
  ]
};

// 제주도 전체지도 (아기자기한 SVG 대용 CSS 맵) 좌표 세팅
const MAP_LOCATIONS = [
  { name: '제주공항', x: '50%', y: '15%', day: 1 },
  { name: '송당리', x: '75%', y: '35%', day: 1 },
  { name: '에코랜드(숙소)', x: '65%', y: '40%', day: 1 },
  { name: '거문오름', x: '70%', y: '30%', day: 2 },
  { name: '아부오름', x: '78%', y: '45%', day: 2 },
  { name: '혼인지', x: '90%', y: '55%', day: 2 },
  { name: '치유의숲', x: '45%', y: '65%', day: 3 },
  { name: '대평리', x: '35%', y: '80%', day: 3 },
  { name: '신화월드(숙소)', x: '25%', y: '65%', day: 3 },
  { name: '가파도', x: '15%', y: '90%', day: 4 },
  { name: '안성리', x: '22%', y: '75%', day: 4 },
  { name: '수월봉', x: '8%', y: '60%', day: 4 },
  { name: '신창풍차해안', x: '12%', y: '45%', day: 4 },
  { name: '사계해안', x: '28%', y: '85%', day: 5 },
];

const OPTIMAL_ACCOMMODATIONS = [
  {
    id: 1, type: 'Base 1 (동부)', stayDate: '6.3 ~ 6.5 (2박)', name: '에코랜드 호텔', rating: 4, region: '제주시 조천읍 (중산간)',
    desc: '첫 2박을 위한 최고의 선택. 공항에서 가깝고 동부 일정을 소화하기 완벽한 위치입니다.',
    priceRange: '1박 약 15~22만원대', query: '제주 에코랜드 호텔', searchKeyword: '제주 에코랜드 호텔 예약', color: 'teal'
  },
  {
    id: 2, type: 'Base 2 (서부)', stayDate: '6.5 ~ 6.7 (2박)', name: '제주 신화월드 서머셋', rating: 5, region: '서귀포시 안덕면',
    desc: '남은 2박은 서쪽으로 이동합니다. 남서부 일정을 돌기 좋은 5성급 프리미엄 콘도입니다.',
    priceRange: '1박 약 30~45만원대 (넓은 평수)', query: '제주 신화월드 서머셋', searchKeyword: '제주 신화월드 서머셋 예약', color: 'blue'
  }
];

const INITIAL_CHECKLISTS = {
  husband: [
    { id: 'h1', category: '공통 필수', text: '신분증 & 운전면허증 (렌터카 필수)', checked: false },
    { id: 'h_basic_1', category: '의류/신발', text: '여벌 속옷 & 양말 (넉넉하게)', checked: false },
    { id: 'h3', category: '의류/신발', text: '여름 반팔 & 통풍 잘되는 바지', checked: false },
    { id: 'h6', category: '전자기기', text: '보조배터리 & 넉넉한 멀티 충전기', checked: false },
    { id: 'h_wash_1', category: '세면/미용', text: '개인 칫솔 & 치약 (호텔 미제공 대비)', checked: false },
  ],
  wife: [
    { id: 'w1', category: '공통 필수', text: '신분증', checked: false },
    { id: 'w_basic_1', category: '의류/신발', text: '여벌 속옷 & 양말 / 스타킹', checked: false },
    { id: 'w2', category: '의류/신발', text: '원피스 등 예쁜 옷 (수국 사진용!)', checked: false },
    { id: 'w6', category: '미용/뷰티', text: '강력 선크림 (제주 햇빛이 강해요)', checked: false },
    { id: 'w_wash_1', category: '세면/미용', text: '개인 칫솔 & 치약 (호텔 미제공 대비)', checked: false },
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fullmap'); // 앱을 켜자마자 전체 지도를 띄웁니다!
  const [mapModal, setMapModal] = useState({ isOpen: false, title: '', query: '' });
  
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const [shareId, setShareId] = useState(urlParams.get('shareId'));
  const [toastMsg, setToastMsg] = useState('');
  
  const [activeDay, setActiveDay] = useState(1);
  const [schedules, setSchedules] = useState(OPTIMAL_SCHEDULES);
  const [newSchedule, setNewSchedule] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const [activePerson, setActivePerson] = useState('husband');
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [newItem, setNewItem] = useState('');

  // 1. Firebase 익명 로그인
  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (error) { console.error("Firebase Auth Error", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 실시간 데이터 동기화 리스너
  useEffect(() => {
    if (!user || !shareId) return;
    const docRef = doc(db, 'planners', shareId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.schedules) setSchedules(data.schedules);
        if (data.checklists) setChecklists(data.checklists);
      }
    });
    return () => unsubscribe();
  }, [user, shareId]);

  // 3. 파이어베이스 데이터 저장
  const syncToFirestore = async (newSchedules, newChecklists) => {
    if (!shareId || !user) return;
    const docRef = doc(db, 'planners', shareId);
    try { await setDoc(docRef, { schedules: newSchedules, checklists: newChecklists }, { merge: true }); } 
    catch(e) { console.error("Sync error:", e); }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- 공유하기 (텍스트 요약 버전) ---
  const handleShare = async () => {
    if (!user) {
      showToast("데이터베이스 연결 대기 중입니다."); return;
    }
    let currentShareId = shareId;
    let newUrl = window.location.href;

    if (!currentShareId) {
      currentShareId = Math.random().toString(36).substring(2, 10);
      const docRef = doc(db, 'planners', currentShareId);
      try {
        await setDoc(docRef, { schedules, checklists, createdAt: new Date().toISOString() });
        newUrl = window.location.origin + window.location.pathname + '?shareId=' + currentShareId;
        window.history.pushState({path: newUrl}, '', newUrl);
        setShareId(currentShareId);
      } catch(e) {
        showToast("공유 링크 생성에 실패했습니다."); return;
      }
    }

    let textToShare = `🍊 우리의 네 번째 제주 여행\n📅 6.3 - 6.7 (4박 5일)\n\n`;
    textToShare += `🗺️ [실시간 연동 플래너 링크]\n${newUrl}\n(서로 일정을 추가하면 바로 공유돼!)\n\n`;
    textToShare += `🏨 [우리의 숙소]\n`;
    OPTIMAL_ACCOMMODATIONS.forEach(acc => { textToShare += `▪️ ${acc.stayDate} : ${acc.name}\n`; });
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        showToast("공유 링크와 요약이 복사되었습니다! 카톡에 붙여넣기 하세요.");
      }).catch(() => fallbackCopy(textToShare));
    } else {
      fallbackCopy(textToShare);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); showToast("복사 완료! 카톡에 붙여넣으세요."); } 
    catch (err) { showToast("링크 복사 실패."); }
    document.body.removeChild(textArea);
  };

  const openMap = (title, query) => setMapModal({ isOpen: true, title, query: query || `제주 ${title}` });
  const closeMap = () => setMapModal({ isOpen: false, title: '', query: '' });
  const searchRealtimePrice = (keyword) => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`, '_blank');
  
  // ★ 구체적인 A -> B 길찾기 경로 띄우기 ★
  const openGoogleDirections = (from, to) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
    window.open(url, '_blank');
  };

  const getDateLabel = (dayIndex) => `6.${3 + dayIndex - 1}`;
  
  // 일자별 테마 색상 헬퍼
  const getDayColor = (day) => {
    const colors = ['bg-pink-500', 'bg-teal-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-orange-500'];
    return colors[(day - 1) % 5];
  };

  // --- 데이터 수정 함수 ---
  const addSchedule = (e) => {
    e.preventDefault();
    if (!newSchedule.trim()) return;
    const newSchedules = {
      ...schedules,
      [activeDay]: [...schedules[activeDay], { id: Date.now(), time: newTime || '-', text: newSchedule.trim(), query: newSchedule.trim(), driveTime: '직접이동' }].sort((a, b) => a.time.localeCompare(b.time))
    };
    setSchedules(newSchedules);
    syncToFirestore(newSchedules, checklists);
    setNewSchedule(''); setNewTime('');
  };

  const deleteSchedule = (day, id) => {
    const newSchedules = { ...schedules, [day]: schedules[day].filter(item => item.id !== id) };
    setSchedules(newSchedules);
    syncToFirestore(newSchedules, checklists);
  };

  const toggleCheck = (person, id) => {
    const newChecklists = { ...checklists, [person]: checklists[person].map(item => item.id === id ? { ...item, checked: !item.checked } : item) };
    setChecklists(newChecklists);
    syncToFirestore(schedules, newChecklists);
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const newChecklists = { ...checklists, [activePerson]: [...checklists[activePerson], { id: Date.now().toString(), category: '추가 항목', text: newItem.trim(), checked: false }] };
    setChecklists(newChecklists);
    syncToFirestore(schedules, newChecklists);
    setNewItem('');
  };

  const deleteChecklistItem = (person, id) => {
    const newChecklists = { ...checklists, [person]: checklists[person].filter(item => item.id !== id) };
    setChecklists(newChecklists);
    syncToFirestore(schedules, newChecklists);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex justify-center items-center py-4 sm:py-8 relative">
      
      {toastMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center animate-in fade-in slide-in-from-top-4 duration-300 w-11/12 max-w-sm justify-center">
          <Check className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" />
          <span className="font-medium text-[13px] break-keep">{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-[#f7f8fc] flex flex-col h-[90vh] max-h-[850px] relative sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-gray-300">
        <header className="bg-white pt-10 pb-4 px-6 rounded-b-[2rem] shadow-sm z-10 relative">
          <button onClick={handleShare} className={`absolute top-8 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${shareId ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`} title="실시간 공유 링크 복사">
            {shareId ? <Share2 className="w-4 h-4 text-indigo-500" /> : <Share2 className="w-4 h-4 text-gray-600" />}
          </button>

          <div className="flex justify-between items-end mb-1 mt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-pink-500 font-bold text-[10px] tracking-wider flex items-center"><Calendar className="w-3 h-3 mr-1" /> 6.3 - 6.7 (4박 5일)</p>
                {shareId && <span className="flex items-center text-[9px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full animate-pulse"><CloudLightning className="w-3 h-3 mr-0.5" /> 실시간 연동 중</span>}
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">나의 네 번째 제주</h1>
            </div>
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">
              <Flower2 className="w-5 h-5 text-pink-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scroll-smooth">
          
          {/* ★ 1. 전체 지도 탭 (제주도 모양 아기자기한 맵) ★ */}
          {activeTab === 'fullmap' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                <h2 className="text-[15px] font-bold text-blue-800 mb-1 flex items-center">
                  <Globe className="w-4 h-4 mr-1.5" /> 제주도 전체 여정 지도
                </h2>
                <p className="text-xs text-blue-700 break-keep leading-relaxed">
                  4박 5일간 방문할 목적지들입니다. 한곳에 치우치지 않고 동부에서 서부로 완벽하게 이어지는 동선을 확인하세요!
                </p>
              </div>

              {/* 제주도 형상을 CSS로 구현 */}
              <div className="relative w-full aspect-[4/3] bg-teal-50 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-4 border-teal-200 mt-8 mb-8 shadow-inner overflow-visible">
                {/* 한라산 형태 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-teal-100/70 rounded-full blur-md"></div>
                <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-extrabold text-teal-600/50">한라산</div>

                {/* 목적지 마커들 */}
                {MAP_LOCATIONS.map((loc, i) => (
                  <div key={i} className="absolute flex flex-col items-center group cursor-pointer" style={{ left: loc.x, top: loc.y, transform: 'translate(-50%, -50%)' }}>
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center ${getDayColor(loc.day)} transform transition-transform group-hover:scale-125 z-10`}>
                      <span className="text-[8px] font-bold text-white leading-none">{loc.day}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm mt-1 whitespace-nowrap absolute top-full opacity-80 group-hover:opacity-100 group-hover:z-20 transition-opacity">
                      {loc.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* 일자별 컬러 범례 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 mb-3 text-center border-b pb-2">일자별 핀(Pin) 색상 안내</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  {[1,2,3,4,5].map(d => (
                    <div key={d} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-full shadow-sm border border-white ${getDayColor(d)}`}></div>
                      <span className="text-xs text-gray-700 font-medium whitespace-nowrap">Day {d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ★ 2. 동선지도 탭 (목적지 간 길찾기 연동) ★ */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5].map(day => (
                  <button key={day} onClick={() => setActiveDay(day)} className={`flex flex-col items-center min-w-[70px] px-3 py-2.5 rounded-2xl font-medium transition-colors ${activeDay === day ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    <span className="text-[10px] mb-0.5 opacity-80">{getDateLabel(day)}</span><span className="text-sm">Day {day}</span>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 relative overflow-hidden">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center relative z-10">
                  <MapPinned className="w-5 h-5 mr-2 text-teal-500" /> {getDateLabel(activeDay)} 상세 동선
                </h2>

                <div className="relative z-10 pb-4">
                  {schedules[activeDay].length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium">일정을 추가해주세요!</div>
                  ) : (
                    <div className="relative">
                      {/* 타임라인 메인 줄 (연결선이 끊기지 않게 배경으로 둠) */}
                      {schedules[activeDay].length > 1 && (
                        <div className="absolute left-[27px] top-6 bottom-10 w-1.5 bg-gray-100 rounded-full z-0"></div>
                      )}
                      
                      <ul className="space-y-0">
                        {schedules[activeDay].map((item, index) => {
                          const nextItem = schedules[activeDay][index + 1];
                          const colorClass = getDayColor(activeDay); // 해당 일차의 테마색 적용
                          
                          return (
                            <React.Fragment key={item.id}>
                              {/* 실제 목적지 카드 */}
                              <li className="flex items-center gap-4 relative z-10 pt-2">
                                <div className={`w-14 h-14 rounded-full border-4 border-white shadow-md flex items-center justify-center flex-shrink-0 z-10 ${colorClass}`}>
                                  <span className="text-white font-extrabold text-lg">{index + 1}</span>
                                </div>
                                <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45"></div>
                                  <p className="text-[11px] font-extrabold text-teal-600 mb-1">{item.time}</p>
                                  <p className="text-sm font-bold text-gray-800 break-keep leading-snug">{item.text}</p>
                                </div>
                              </li>

                              {/* 다음 장소로의 이동 (소요시간 + 길찾기 버튼) */}
                              {nextItem && (
                                <li className="flex items-center gap-4 relative z-10 py-3">
                                  <div className="w-14 flex justify-center opacity-0"></div> {/* 빈 공간 맞춰주기 */}
                                  <button 
                                    onClick={() => openGoogleDirections(item.query, nextItem.query)} 
                                    className="flex-1 bg-white border border-blue-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:bg-blue-50 transition-colors group active:scale-95"
                                  >
                                    <div className="flex items-center">
                                      <Car className="w-4 h-4 text-blue-400 mr-2" />
                                      <span className="text-xs font-extrabold text-gray-700">
                                        차량 {item.driveTime || '이동'} 소요
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg shadow-sm flex items-center">
                                      경로안내 <Route className="w-3 h-3 ml-1"/>
                                    </span>
                                  </button>
                                </li>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. 일정 수정 탭 */}
          {activeTab === 'schedule' && (
            <div>
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5].map(day => (
                  <button key={day} onClick={() => setActiveDay(day)} className={`flex flex-col items-center min-w-[70px] px-3 py-2.5 rounded-2xl font-medium transition-colors ${activeDay === day ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    <span className="text-[10px] mb-0.5 opacity-80">{getDateLabel(day)}</span><span className="text-sm">Day {day}</span>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 relative">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center"><ListTodo className="w-5 h-5 mr-2 text-gray-900" /> {getDateLabel(activeDay)} 일정 수정</h2>
                <div className="absolute left-[38px] top-[70px] bottom-[100px] w-px bg-gray-200 z-0"></div>
                <ul className="space-y-4 mb-6 min-h-[180px] relative z-10">
                  {schedules[activeDay].length === 0 ? (
                    <li className="text-gray-400 text-center py-10 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">일정이 없습니다.</li>
                  ) : (
                    schedules[activeDay].map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <div className="w-12 text-right pt-1"><span className="text-xs font-bold text-gray-400">{item.time}</span></div>
                        <div className="relative flex-1 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="absolute -left-[14px] top-3 w-2.5 h-2.5 rounded-full bg-gray-900 ring-4 ring-white"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-800 font-medium break-keep pr-2 leading-relaxed">{item.text}</span>
                            <button onClick={() => deleteSchedule(activeDay, item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                <form onSubmit={addSchedule} className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-20 bg-white border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-gray-500"/>
                  <input type="text" value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)} placeholder="일정 추가..." className="flex-1 bg-white border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-gray-500"/>
                  <button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex-shrink-0"><Plus className="w-4 h-4" /></button>
                </form>
              </div>
            </div>
          )}

          {/* 4. 숙소 탭 */}
          {activeTab === 'accommodations' && (
            <div className="space-y-6 pb-4">
              {OPTIMAL_ACCOMMODATIONS.map((acc) => (
                <div key={acc.id} className={`bg-white p-5 rounded-2xl shadow-sm border-2 ${acc.color === 'teal' ? 'border-teal-100' : 'border-blue-100'} flex flex-col`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white shadow-sm ${acc.color === 'teal' ? 'bg-teal-500' : 'bg-blue-500'}`}>{acc.type}</span>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md flex items-center"><Calendar className="w-3 h-3 mr-1" /> {acc.stayDate}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{acc.name}</h3>
                  <p className="text-[11px] text-gray-400 mb-3 font-medium"><MapPin className="w-3 h-3 inline mr-0.5"/>{acc.region}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 break-keep">{acc.desc}</p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 flex items-center">
                    <Banknote className={`w-5 h-5 mr-2 flex-shrink-0 ${acc.color === 'teal' ? 'text-teal-600' : 'text-blue-600'}`} />
                    <div><p className="text-[10px] text-gray-500 font-medium mb-0.5">평균 예상 가격</p><p className="text-sm font-bold text-gray-800">{acc.priceRange}</p></div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => searchRealtimePrice(acc.searchKeyword)} className="flex-1 flex items-center justify-center text-sm text-white bg-gray-900 hover:bg-gray-800 px-3 py-2.5 rounded-xl transition-colors font-medium shadow-sm"><Search className="w-4 h-4 mr-1.5" /> 요금 확인</button>
                    <button onClick={() => openMap(acc.name, acc.query)} className="flex-[0.8] flex items-center justify-center text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2.5 rounded-xl transition-colors font-medium"><MapIcon className="w-4 h-4 mr-1.5" /> 위치 보기</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. 준비물 탭 */}
          {activeTab === 'checklist' && (
            <div>
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <button onClick={() => setActivePerson('husband')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activePerson === 'husband' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><User className="w-4 h-4 mr-2" /> 남편 짐</button>
                <button onClick={() => setActivePerson('wife')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${activePerson === 'wife' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Heart className="w-4 h-4 mr-2" /> 아내 짐</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 min-h-[400px]">
                <div className="space-y-6 mb-6">
                  {Object.keys(checklists[activePerson].reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item); return acc;
                  }, {})).map(category => (
                    <div key={category}>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 border-b pb-1">{category}</h3>
                      <ul className="space-y-2">
                        {checklists[activePerson].filter(i => i.category === category).map(item => (
                          <li key={item.id} className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${item.checked ? 'bg-gray-50' : 'hover:bg-gray-50'}`} onClick={() => toggleCheck(activePerson, item.id)}>
                            <div className="flex items-center gap-3 flex-1">
                              {item.checked ? <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${activePerson === 'husband' ? 'text-indigo-500' : 'text-pink-500'}`} /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                              <span className={`text-sm break-keep ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{item.text}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteChecklistItem(activePerson, item.id); }} className="text-gray-300 hover:text-red-500 p-2 ml-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <form onSubmit={addChecklistItem} className="flex gap-2 pt-4 border-t border-gray-100">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="준비물 추가..." className={`flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 rounded-xl px-4 py-2 outline-none transition-all text-sm ${activePerson === 'husband' ? 'focus:border-indigo-500 focus:ring-indigo-200' : 'focus:border-pink-500 focus:ring-pink-200'}`}/>
                  <button type="submit" className={`text-white p-2 rounded-xl transition-colors shadow-sm flex-shrink-0 ${activePerson === 'husband' ? 'bg-indigo-500' : 'bg-pink-500'}`}><Plus className="w-5 h-5" /></button>
                </form>
              </div>
            </div>
          )}
        </main>

        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-4 flex justify-between items-center pb-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <button onClick={() => setActiveTab('fullmap')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'fullmap' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <Globe className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'fullmap' ? 'fill-blue-50' : ''}`} /><span className="text-[9px] sm:text-[10px] font-bold">전체지도</span>
          </button>
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'overview' ? 'text-teal-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <MapPinned className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'overview' ? 'fill-teal-50' : ''}`} /><span className="text-[9px] sm:text-[10px] font-bold">동선지도</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'schedule' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
            <ListTodo className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'schedule' ? 'fill-gray-100' : ''}`} /><span className="text-[9px] sm:text-[10px] font-bold">일정수정</span>
          </button>
          <button onClick={() => setActiveTab('accommodations')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'accommodations' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Bed className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'accommodations' ? 'fill-teal-50' : ''}`} /><span className="text-[9px] sm:text-[10px] font-bold">추천숙소</span>
          </button>
          <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === 'checklist' ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'checklist' ? 'fill-indigo-50' : ''}`} /><span className="text-[9px] sm:text-[10px] font-bold">준비물</span>
          </button>
        </nav>

        {mapModal.isOpen && renderMapModal()}
      </div>
    </div>
  );
}