import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Headphones, Gift, Heart, X, Sparkles } from 'lucide-react';

// ==========================================
// PLAYLIST CONFIGURATION & DATA STATE
// ==========================================
interface Track {
  title: string;
  performer: string;
  composer: string;
  url: string;
  quote1: string;
  quote2: string;
}

const PLAYLIST: Track[] = [
  {
    title: "〈再一次新程〉",
    performer: "若陽演唱版（和音版）",
    composer: "太陽盛德導師",
    url: "https://file.richestlife.com/wp-content/uploads/2026/05/%E3%80%88%E5%86%8D%E4%B8%80%E6%96%B0%E7%A8%8B%E3%80%89%E8%8B%A5%E9%99%BD%E6%BC%94%E5%94%B1%E7%89%88%EF%BC%88%E5%92%8C%E9%9F%B3%E7%89%88%EF%BC%89.mp3",
    quote1: "迎接生命，",
    quote2: "再一次踏上嶄新的程途。"
  },
  {
    title: "〈愛的飛翔〉",
    performer: "依蓮演唱版（和音版）",
    composer: "太陽盛德導師",
    url: "https://file.richestlife.com/wp-content/uploads/2026/05/%E3%80%88%E6%84%9B%E7%9A%84%E9%A3%9B%E7%BF%94%E3%80%89%E4%BE%9D%E8%93%AE%E6%BC%94%E5%94%B1%E7%89%88%EF%BC%88%E5%92%8C%E9%9F%B3%E7%89%88%EF%BC%89.mp3",
    quote1: "張開雙臂，",
    quote2: "乘著愛之翼，翱翔於天地。"
  }
];

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [blessingText, setBlessingText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [explodingHearts, setExplodingHearts] = useState<{ id: number; tx: number; ty: number; rot: number; isFlower: boolean }[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeTrack = PLAYLIST[currentTrackIndex];

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio(activeTrack.url);
    audioRef.current = audio;

    // Load initial metadata
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // Auto-advance
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // Audio Playback Controller
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.log("Autoplay or play issue:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  // Canvas Petals Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let petalsArray: Petal[] = [];
    const numberOfPetals = 20;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Petal {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      opacity = 0;
      rotation = 0;
      spinSpeed = 0;
      colorBase = '';

      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = 6 + Math.random() * 10;
        this.speedY = 0.5 + Math.random() * 1.2;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.opacity = 0.4 + Math.random() * 0.5;
        this.rotation = Math.random() * 360;
        this.spinSpeed = (Math.random() - 0.5) * 1.2;
        const roseColors = [
          'rgba(255, 192, 203, ',  // Pink
          'rgba(255, 182, 193, ',  // LightPink
          'rgba(255, 218, 224, ',  // Soft Rose
          'rgba(244, 114, 182, ',  // Deep Pink
        ];
        this.colorBase = roseColors[Math.floor(Math.random() * roseColors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 30) * 0.2;
        this.rotation += this.spinSpeed;

        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        ctx.fillStyle = this.colorBase + this.opacity + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (this.opacity * 0.3) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    const initPetals = () => {
      petalsArray = [];
      for (let i = 0; i < numberOfPetals; i++) {
        petalsArray.push(new Petal());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsArray.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initPetals();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return;
    const percent = parseFloat(e.target.value);
    const seekTime = (percent / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleContinueListen = () => {
    if (currentTrackIndex !== 1) {
      setCurrentTrackIndex(1);
      setIsPlaying(true);
      showToast("切換至《愛的飛翔》持續聆聽...");
    } else {
      togglePlay();
    }
  };

  const handleOpenGift = () => {
    setIsGiftOpen(true);
  };

  const handleSendBlessing = () => {
    if (blessingText.trim()) {
      setBlessingText("");
      setIsGiftOpen(false);
      triggerExplosion();
      setTimeout(() => {
        showToast("感謝您的美好祝福！願愛與光與您同行！✨");
      }, 300);
    } else {
      showToast("請輸入您想要傳遞的心願與祝福唷 💗");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const triggerExplosion = () => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 180;
      arr.push({
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 30,
        rot: (Math.random() - 0.5) * 360,
        isFlower: i % 2 === 0
      });
    }
    setExplodingHearts(arr);
    setTimeout(() => {
      setExplodingHearts([]);
    }, 1100);
  };

  return (
    <div id="react-app-root" className="min-h-screen text-[#5c4a45] font-sans relative flex flex-col justify-between selection:bg-pink-100 overflow-x-hidden">
      
      {/* Falling Petals Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Shared Ambient Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95 transition-opacity duration-1000"
        style={{
          backgroundImage: `url('src/assets/images/background_roses_1782825219184.jpg'), linear-gradient(135deg, #fffcfb 0%, #fff2ec 40%, #ffebdf 80%, #f7d6c8 100%)`,
          zIndex: 1
        }}
      />

      {/* Decorative ambient spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-orange-200/20 blur-3xl pointer-events-none" style={{ zIndex: 2 }} />
      <div className="absolute bottom-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-pink-100/30 blur-3xl pointer-events-none" style={{ zIndex: 2 }} />

      {/* Main Container */}
      <main className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col justify-between px-6 py-8 relative" style={{ zIndex: 10 }}>
        
        {/* LOGO HEADER */}
        <header id="react-header" className="w-full flex justify-center mb-6 animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 95C74.8528 95 95 74.8528 95 50C95 25.1472 74.8528 5 50 5C25.1472 5 5 25.1472 5 50C5 74.8528 25.1472 95 50 95Z" fill="#2eb060" fillOpacity="0.15"/>
                <path d="M50 88C70.9868 88 88 70.9868 88 50C88 29.0132 70.9868 12 50 12C29.0132 12 12 29.0132 12 50C12 70.9868 29.0132 88 50 88Z" fill="white"/>
                <path d="M22 65C30 75 45 78 55 76C68 73.5 76 60 76 46C76 28 60 16 44 20C30 23.5 24 38 29 49C33.5 59 47.5 61 54 54C59 48.5 56 39 48 38C43 37.5 39 41.5 40 46C40.5 48.5 43.5 49.5 45 48.5C46.5 47.5 47 45 46.5 44" stroke="#2eb060" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M68 34C73 34 78 30 80 25C81 22.5 82 20 83 17" stroke="#e1251b" stroke-width="5" stroke-linecap="round"/>
                <path d="M60 26C64 24 67 20 68 16C69 13.5 69 11 69 8" stroke="#e1251b" stroke-width="5" stroke-linecap="round"/>
                <path d="M74 44C80 43 85 39 88 34C89.5 31.5 91 29 92 26" stroke="#e1251b" stroke-width="5" stroke-linecap="round"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-[0.2em] text-[#e1251b] font-serif leading-tight">天圓音樂</span>
                <span className="text-[7.5px] font-semibold tracking-[0.28em] text-[#2eb060] font-sans -mt-0.5">SUN SOUNDS MUSIC</span>
              </div>
            </div>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-2"></div>
          </div>
        </header>

        {/* SONG DETAILS & DISC CONTROLS */}
        <section className="flex-1 flex flex-col justify-center items-center my-4 animate-fade-in">
          
          {/* Main titles */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-widest text-[#a27b38] mb-3">
              《一生所愛》
            </h1>
            <div className="flex flex-col items-center space-y-1">
              <span class="text-xs tracking-[0.25em] text-[#8a7269] uppercase font-sans">作詞 / 作曲</span>
              <span className="text-base font-serif font-semibold text-[#6d5147] tracking-wider">太陽盛德導師</span>
            </div>
          </div>

          {/* Rotating player disk */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border border-amber-300/40 p-1 animate-pulse">
              <div className="w-full h-full rounded-full border border-dashed border-amber-400/20"></div>
            </div>

            {/* Glassmorphic container */}
            <div className="w-[92%] h-[92%] rounded-full bg-white/30 backdrop-blur-xl border border-white/50 p-6 flex flex-col justify-between items-center relative overflow-hidden shadow-xl shadow-rose-200/10">
              
              <div className="flex-1 flex flex-col justify-center items-center mt-2 z-10">
                <div className={`w-36 h-36 rounded-full bg-gradient-to-br from-amber-100 via-white to-amber-200/80 p-3 shadow-inner flex items-center justify-center border-2 border-white/60 transition-transform duration-1000 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-400 p-2 flex items-center justify-center shadow-lg relative">
                    <div className="absolute inset-1 rounded-full border border-black/5"></div>
                    <div className="absolute inset-3 rounded-full border border-white/10"></div>
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center relative z-10 border border-amber-300">
                      <Sparkles className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-90'}`} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs font-semibold tracking-wider text-[#693325] bg-white/75 backdrop-blur-sm px-3 py-1 rounded-full border border-rose-100 shadow-sm inline-block">
                    {isPlaying ? `${activeTrack.title} 播放中` : '暫停播放'}
                  </p>
                </div>
              </div>

              {/* Main player controls inside circle */}
              <div className="w-full flex items-center justify-center space-x-6 z-10 mb-2">
                <button onClick={handlePrev} className="w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:text-amber-800 hover:bg-white/40 active:scale-95 transition-all focus:outline-none">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none border border-amber-200">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                <button onClick={handleNext} className="w-10 h-10 rounded-full flex items-center justify-center text-amber-600 hover:text-amber-800 hover:bg-white/40 active:scale-95 transition-all focus:outline-none">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>

            </div>
          </div>

          {/* Timeline progress indicator */}
          <div className="w-full px-4 mb-4 relative z-20">
            <div className="relative w-full h-1.5 bg-white/60 rounded-full border border-white/20 shadow-inner mb-2">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-roseGold-400 to-amber-400 rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleProgressChange}
                className="absolute -top-1.5 left-0 w-full h-4 opacity-100 cursor-pointer z-30"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono font-medium text-[#8a7269] tracking-wider">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Quotes text */}
          <div className="text-center py-4 px-2 select-none">
            <p className="font-serif text-lg md:text-xl text-[#654d44] tracking-widest leading-relaxed font-semibold transition-all duration-700">
              {activeTrack.quote1}
            </p>
            <p className="font-serif text-lg md:text-xl text-[#654d44] tracking-widest leading-relaxed mt-2 font-semibold transition-all duration-700">
              {activeTrack.quote2}
            </p>
          </div>

        </section>

        {/* BOTTOM PILLED BUTTONS */}
        <footer className="space-y-4 animate-fade-in">
          
          {/* Button 1: 繼續聆聽 */}
          <button 
            onClick={handleContinueListen}
            className={`w-full py-4 px-6 rounded-full backdrop-blur-md flex items-center justify-center space-x-3 text-amber-700 font-serif font-semibold text-lg tracking-widest hover:bg-white/60 hover:shadow-md active:scale-[0.98] transition-all duration-300 focus:outline-none border border-amber-300/40 shadow-sm relative group overflow-hidden ${
              currentTrackIndex === 1 ? 'bg-amber-50/80 ring-2 ring-amber-400' : 'bg-white/45'
            }`}
          >
            <Headphones className="w-5 h-5 text-amber-600" />
            <span>{currentTrackIndex === 1 ? "播放中：愛的飛翔" : "繼續聆聽"}</span>
          </button>

          {/* Button 2: 開啟小心意 */}
          <button 
            onClick={handleOpenGift}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white flex items-center justify-center space-x-3 font-serif font-semibold text-lg tracking-widest hover:shadow-lg hover:shadow-amber-600/10 active:scale-[0.98] transition-all duration-300 focus:outline-none border border-amber-300/40 relative group overflow-hidden"
          >
            <Gift className="w-5 h-5 text-white" />
            <span>開啟小心意</span>
          </button>

        </footer>

      </main>

      {/* MODAL GREETING CARD (小心意) */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-40 transition-all duration-500 ${
          isGiftOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsGiftOpen(false)}
      >
        <div 
          className={`w-full max-w-sm bg-gradient-to-b from-[#fdfbf7] to-[#f9f5eb] rounded-3xl p-6 md:p-8 border-2 border-amber-300 shadow-2xl relative transform transition-transform duration-500 ${
            isGiftOpen ? 'translate-y-0' : 'translate-y-8'
          } max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating rose icons */}
          <div className="absolute -top-3 -right-3 w-10 h-10 select-none animate-bounce text-xl">🌸</div>
          <div className="absolute -bottom-3 -left-3 w-10 h-10 select-none text-xl">🌹</div>

          {/* Close button */}
          <button 
            onClick={() => setIsGiftOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 hover:text-amber-800 flex items-center justify-center hover:bg-amber-100/50 active:scale-95 transition-all focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Gift header */}
          <div className="text-center mb-5 mt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-2">
              <Heart className="w-6 h-6 animate-pulse fill-current text-rose-500" />
            </div>
            <h3 class="text-xl font-serif font-bold text-amber-800 tracking-wider">一份光與愛的祝福</h3>
            <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2"></div>
          </div>

          {/* Content message */}
          <div className="font-serif text-[#5c4a45] text-base leading-relaxed tracking-widest text-center space-y-4 py-2 border-y border-amber-100/60 my-4">
            <p className="font-semibold text-amber-700">親愛的朋友，</p>
            <p>送你一份特別的心靈禮物。</p>
            <p>願你在此刻的純淨聆聽中，</p>
            <p>洗滌一身的疲憊，</p>
            <p className="text-rose-600 font-semibold">讓暖暖的愛與光，</p>
            <p>滋養並溫暖你的心靈。</p>
            <p>願你隨時充滿正能量，</p>
            <p>開啟人生更豐盛的新篇章。</p>
            <p className="text-right text-xs text-amber-600 font-semibold mt-6 italic">— 太陽盛德導師 祝福 —</p>
          </div>

          {/* User wishing interaction inside modal */}
          <div className="space-y-3">
            <label className="block text-xs font-serif font-semibold tracking-wider text-amber-700 text-center">寫下您的祝福或願望：</label>
            <textarea 
              rows={2}
              value={blessingText}
              onChange={(e) => setBlessingText(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-200 bg-white text-sm font-serif tracking-widest focus:ring-1 focus:ring-amber-400 focus:outline-none resize-none placeholder-gray-400" 
              placeholder="願世界充滿愛與和平..."
            />
            <button 
              onClick={handleSendBlessing}
              className="w-full py-2 px-4 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-serif font-semibold text-sm tracking-widest shadow transition-all duration-300"
            >
              送出心願，傳遞愛
            </button>
          </div>

        </div>
      </div>

      {/* DYNAMIC EXPLODING HEARTS */}
      {explodingHearts.map((eh) => (
        <div 
          key={eh.id}
          className="absolute pointer-events-none z-50 text-2xl transition-all duration-1000 ease-out"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${eh.tx}px), calc(-50% + ${eh.ty}px)) rotate(${eh.rot}deg)`,
            opacity: 0,
            transitionProperty: 'transform, opacity'
          }}
        >
          {eh.isFlower ? '🌸' : '💗'}
        </div>
      ))}

      {/* FEEDBACK TOASTS */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 bg-amber-800/90 backdrop-blur-md text-white font-serif px-6 py-3 rounded-full text-sm tracking-wider shadow-xl z-50 pointer-events-none transition-opacity duration-500 flex items-center space-x-2 border border-amber-400 ${
        toastMessage ? 'opacity-100' : 'opacity-0'
      }`}>
        <span>✨</span>
        <span>{toastMessage}</span>
        <span>✨</span>
      </div>

    </div>
  );
}
