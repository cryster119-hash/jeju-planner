import React, { useState, useEffect } from 'react';
import { 
  Map, ListTodo, Plus, Trash2, CheckCircle2, Circle, MapPin, 
  Map as MapIcon, X, Bed, Star, Hotel, Banknote, Search, 
  Flower2, Calendar, Share2, Check, User, Heart, CloudLightning,
  MapPinned, Route
} from 'lucide-react';

// Firebase 패키지 임포트
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ★★★ 이 부분을 본인의 기존 Firebase Config 정보로 교체하세요! ★★★
const firebaseConfig = {
  apiKey: "AIzaSyAkzmoK1dQrxfXFiPVnhhfUvRITM3nM3g4",
  authDomain: "readybaby-bd5bb.firebaseapp.com",
  projectId: "readybaby-bd5bb",
  storageBucket: "readybaby-bd5bb.firebasestorage.app",
  messagingSenderId: "630742601183",
  appId: "1:630742601183:web:559618f9647db8beac086a",
  measurementId: "G-11K09F8QFY"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 기본 데이터 세팅 ---
const OPTIMAL_SCHEDULES = {
  1: [
    { id: 101, time: '14:00', text: '제주공항 도착 및 렌터카 인수', query: '제주국제공항' },
    { id: 102, time: '15:30', text: '구좌읍 송당리 마을 (커피/소품샵 산책)', query: '제주 구좌읍 송당리' },
    { id: 103, time: '17:30', text: '동부 숙소 체크인 및 휴식', query: '에코랜드 호텔' }
  ],
  2: [
    { id: 201, time: '09:30', text: '거문오름 탐방 (사전예약 필수)', query: '제주 거문오름' },
    { id: 202, time: '13:00', text: '아부오름 (분화구 피크닉)', query: '제주 아부오름' },
    { id: 203, time: '16:00', text: '혼인지 (제주 최고의 6월 수국 명소)', query: '제주 혼인지' }
  ],
  3: [
    { id: 301, time: '10:00', text: '동부 숙소 체크아웃 및 서귀포로 이동', query: '서귀포 치유의 숲' },
    { id: 302, time: '11:00', text: '서귀포 치유의 숲 (편백나무 숲 힐링)', query: '제주 서귀포 치유의 숲' },
    { id: 303, time: '14:00', text: '대평리 마을 (박수기정 뷰 보며 커피)', query: '제주 대평포구' },
    { id: 304, time: '16:30', text: '서부 숙소 체크인 및 호캉스', query: '제주 신화월드 서머셋' }
  ],
  4: [
    { id: 401, time: '09:00', text: '모슬포항 -> 가파도 입도 (자전거 투어)', query: '제주 가파도 선착장' },
    { id: 402, time: '14:00', text: '안성리 수국길 (조용한 마을 수국)', query: '제주 안성리 수국길' },
    { id: 403, time: '17:30', text: '신창풍차해안도로 (일몰 드라이브)', query: '제주 신창풍차해안도로' }
  ],
  5: [
    { id: 501, time: '11:00', text: '서부 숙소 체크아웃', query: '제주 신화월드 서머셋' },
    { id: 502, time: '12:00', text: '사계해안 (이국적인 지질트레일 산책)', query: '제주 사계해안' },
    { id: 503, time: '15:00', text: '렌터카 반납 및 제주공항 이동', query: '제주국제공항' }
  ]
};

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
  const [activeTab, setActiveTab] = useState('overview'); // 기본 탭을 동선지도로!
  const [mapModal, setMapModal] = useState({ isOpen: false, title: '', query: '' });
  
  // 파이어베이스 인증 및 공유 상태
  const [user, setUser] = useState(null);
  
  // 브라우저 URL 파라미터에서 shareId 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const [shareId, setShareId] = useState(urlParams.get('shareId'));
  const [toastMsg, setToastMsg] = useState('');
  
  // 데이터 상태
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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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

  // 3. 파이어베이스에 데이터 저장 함수
  const syncToFirestore = async (newSchedules, newChecklists) => {
    if (!shareId || !user) return;
    const docRef = doc(db, 'planners', shareId);
    try {
      await setDoc(docRef, { schedules: newSchedules, checklists: newChecklists }, { merge: true });
    } catch(e) { console.error("Sync error:", e); }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- 공유하기 ---
  const handleShare = async () => {
    if (!user) {
      showToast("데이터베이스 연결 대기 중입니다. 잠시 후 다시 시도해주세요.");
      return;
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
        showToast("공유 링크 생성에 실패했습니다.");
        console.error(e);
        return;
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(newUrl).then(() => {
        showToast("실시간 공유 링크 복사 완료! 아내에게 붙여넣기 하세요.");
      }).catch(() => fallbackCopy(newUrl));
    } else {
      fallbackCopy(newUrl);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); showToast("실시간 공유 링크 복사 완료!"); } 
    catch (err) { showToast("링크 복사 실패."); }
    document.body.removeChild(textArea);
  };

  const openMap = (title, query) => setMapModal({ isOpen: true, title, query: query || `제주 ${title}` });
  const closeMap = () => setMapModal({ isOpen: false, title: '', query: '' });
  const searchRealtimePrice = (keyword) => window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`, '_blank');
  const getDateLabel = (dayIndex) => `6.${3 + dayIndex - 1}`;

  // ★ 구글 지도로 전체 경로 열기 기능 ★
  const openGoogleDirections = (daySchedules) => {
    if (!daySchedules || daySchedules.length === 0) return;
    
    // 장소가 1개일 경우 그냥 검색 결과로
    if (daySchedules.length === 1) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(daySchedules[0].query)}`, '_blank');
      return;
    }

    // 장소가 2개 이상일 경우 출발지, 도착지, 경유지 설정
    const origin = daySchedules[0].query;
    const destination = daySchedules[daySchedules.length - 1].query;
    const waypoints = daySchedules.slice(1, -1).map(s => encodeURIComponent(s.query)).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    
    window.open(url, '_blank');
  };

  // --- 데이터 수정 함수들 ---
  const addSchedule = (e) => {
    e.preventDefault();
    if (!newSchedule.trim()) return;
    const newSchedules = {
      ...schedules,
      [activeDay]: [...schedules[activeDay], { id: Date.now(), time: newTime || '-', text: newSchedule.trim(), query: newSchedule.trim() }].sort((a, b) => a.time.localeCompare(b.time))
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
    const newChecklists = {
      ...checklists,
      [person]: checklists[person].map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    };
    setChecklists(newChecklists);
    syncToFirestore(schedules, newChecklists);
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const newChecklists = {
      ...checklists,
      [activePerson]: [...checklists[activePerson], { id: Date.now().toString(), category: '추가 항목', text: newItem.trim(), checked: false }]
    };
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
          
          {/* ★ NEW: 아기자기한 동선지도 (여정 지도) 탭 ★ */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 bg-teal-50 border border-teal-100 rounded-2xl p-4">
                <h2 className="text-[15px] font-bold text-teal-800 mb-1 flex items-center">
                  <Route className="w-4 h-4 mr-1.5" /> 아기자기한 여정 지도
                </h2>
                <p className="text-xs text-teal-700 break-keep leading-relaxed">
                  오늘 하루 우리가 이동할 경로입니다. 딱딱한 구글지도 대신 귀여운 보드게임 형태로 일정을 한눈에 확인하세요!
                </p>
              </div>

              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5].map(day => (
                  <button key={day} onClick={() => setActiveDay(day)} className={`flex flex-col items-center min-w-[70px] px-3 py-2.5 rounded-2xl font-medium transition-colors ${activeDay === day ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    <span className="text-[10px] mb-0.5 opacity-80">{getDateLabel(day)}</span><span className="text-sm">Day {day}</span>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4 relative overflow-hidden">
                {/* 배경 꾸미기 요소 */}
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                <div className="absolute bottom-10 left-[-20px] w-32 h-32 bg-teal-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                
                <h2 className="text-lg font-bold text-gray-800 mb-8 flex items-center relative z-10">
                  <MapPinned className="w-5 h-5 mr-2 text-teal-500" /> {getDateLabel(activeDay)} 동선 요약
                </h2>

                <div className="relative z-10 min-h-[200px] mb-8">
                  {schedules[activeDay].length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium">오늘은 일정이 텅 비어있네요!</div>
                  ) : (
                    <div className="relative">
                      {/* 타임라인 메인 줄 */}
                      <div className="absolute left-[27px] top-4 bottom-4 w-1.5 bg-teal-100 rounded-full"></div>
                      
                      <ul className="space-y-8">
                        {schedules[activeDay].map((item, index) => {
                          const colors = ['bg-pink-400', 'bg-teal-400', 'bg-yellow-400', 'bg-indigo-400', 'bg-orange-400'];
                          const colorClass = colors[index % colors.length];
                          
                          return (
                            <li key={item.id} className="flex items-center gap-4 relative group">
                              {/* 동그라미 마커 */}
                              <div className={`w-14 h-14 rounded-full border-4 border-white shadow-md flex items-center justify-center flex-shrink-0 z-10 ${colorClass} transition-transform group-hover:scale-110`}>
                                <span className="text-white font-extrabold text-lg">{index + 1}</span>
                              </div>
                              
                              {/* 텍스트 박스 */}
                              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45"></div>
                                <p className="text-xs font-extrabold text-teal-500 mb-1">{item.time}</p>
                                <p className="text-sm font-bold text-gray-800 break-keep">{item.text}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 구글 길찾기 연동 버튼 */}
                <button 
                  onClick={() => openGoogleDirections(schedules[activeDay])}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-gray-800 shadow-xl transition-all active:scale-[0.98] relative z-10"
                >
                  <MapIcon className="w-5 h-5 mr-2" /> 구글 지도로 드라이브 경로 보기
                </button>
              </div>
            </div>
          )}

          {/* 일정 관리 탭 */}
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
                </div>
              ))}
            </div>
          )}

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

        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-4 flex justify-around items-center pb-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'overview' ? 'text-teal-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <MapPinned className={`w-6 h-6 ${activeTab === 'overview' ? 'fill-teal-50' : ''}`} /><span className="text-[10px] font-bold">동선지도</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'schedule' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
            <ListTodo className={`w-6 h-6 ${activeTab === 'schedule' ? 'fill-gray-100' : ''}`} /><span className="text-[10px] font-bold">일정수정</span>
          </button>
          <button onClick={() => setActiveTab('accommodations')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'accommodations' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Bed className={`w-6 h-6 ${activeTab === 'accommodations' ? 'fill-teal-50' : ''}`} /><span className="text-[10px] font-bold">추천숙소</span>
          </button>
          <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'checklist' ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <CheckCircle2 className={`w-6 h-6 ${activeTab === 'checklist' ? 'fill-indigo-50' : ''}`} /><span className="text-[10px] font-bold">준비물</span>
          </button>
        </nav>

        {mapModal.isOpen && renderMapModal()}
      </div>
    </div>
  );
}