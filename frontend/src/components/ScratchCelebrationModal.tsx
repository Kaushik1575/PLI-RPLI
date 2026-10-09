import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ScratchCelebrationModalProps {
  isOpen: boolean;
  clientName: string;
  onClose: () => void;
}

const SCRATCH_THRESHOLD = 0.50; // 50% scratched triggers reveal

export const ScratchCelebrationModal: React.FC<ScratchCelebrationModalProps> = ({
  isOpen,
  clientName,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const revealed = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRevealed(false);
      setScratchPercent(0);
      revealed.current = false;
      setTimeout(() => setShowCard(true), 80);
    } else {
      setShowCard(false);
    }
  }, [isOpen]);

  // Draw the scratch overlay once canvas mounts
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with gold gradient scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f5c842');
    gradient.addColorStop(0.3, '#fde68a');
    gradient.addColorStop(0.6, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative dots
    ctx.fillStyle = 'rgba(180, 83, 9, 0.15)';
    for (let x = 15; x < canvas.width; x += 30) {
      for (let y = 15; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Scratch instruction text
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎁 SCRATCH HERE 🎁', canvas.width / 2, canvas.height / 2 - 14);
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(120, 53, 15, 0.85)';
    ctx.fillText('Swipe to uncover the Birthday Surprise!', canvas.width / 2, canvas.height / 2 + 16);
    ctx.fillText('✨ India Post Postal Life Insurance ✨', canvas.width / 2, canvas.height / 2 + 36);
  }, [isOpen, showCard]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || revealed.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    // Calculate percentage scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 16) {
      if (imageData.data[i] === 0) transparentPixels++;
    }
    const pct = transparentPixels / (imageData.data.length / 16);
    setScratchPercent(pct);

    if (pct > SCRATCH_THRESHOLD && !revealed.current) {
      revealed.current = true;
      setIsRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      launchCelebration();
    }
  }, [isScratching]);

  const launchCelebration = () => {
    // 1. Massive central boom explosion
    confetti({
      particleCount: 180,
      spread: 110,
      startVelocity: 50,
      origin: { y: 0.55 },
      colors: ['#f5c842', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8'],
    });

    // 2. Confetti shower from left and right
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: ['#f5c842', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe'],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: ['#f5c842', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    setTimeout(frame, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && isRevealed) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm mx-auto"
        style={{
          transform: showCard ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)',
          opacity: showCard ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        }}
      >
        {/* Tricolor Ribbon Bar */}
        <div className="w-full h-1.5 flex rounded-full overflow-hidden mb-3 shadow-md">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Revealed Content Card */}
        <div
          className="relative overflow-hidden rounded-3xl select-none"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
            minHeight: '410px',
          }}
        >
          {/* Card Body */}
          <div className="flex flex-col items-center justify-center px-6 py-9 text-center" style={{ minHeight: '410px' }}>
            <div
              style={{
                fontSize: '64px',
                lineHeight: 1,
                marginBottom: '14px',
                transform: isRevealed ? 'scale(1)' : 'scale(0.4)',
                opacity: isRevealed ? 1 : 0,
                transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s, opacity 0.4s ease 0.1s',
                filter: 'drop-shadow(0 4px 16px rgba(245,200,66,0.6))',
              }}
            >
              🎂
            </div>

            <div
              style={{
                transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
                opacity: isRevealed ? 1 : 0,
                transition: 'transform 0.5s ease 0.2s, opacity 0.4s ease 0.2s',
              }}
            >
              <p style={{ fontSize: '12px', letterSpacing: '2.5px', color: '#f5c842', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                🌟 OFFICIAL BIRTHDAY GREETING 🌟
              </p>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, margin: '0 0 4px' }}>
                Happy Birthday,
              </h2>
              <h2
                style={{
                  fontSize: '30px',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  margin: '0 0 16px',
                  background: 'linear-gradient(90deg, #f5c842, #fd79a8, #a29bfe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {clientName}! 🎉
              </h2>
            </div>

            <div
              style={{
                transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
                opacity: isRevealed ? 1 : 0,
                transition: 'transform 0.5s ease 0.35s, opacity 0.4s ease 0.35s',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13.5px', lineHeight: 1.65, maxWidth: '290px', margin: '0 auto 20px' }}>
                Wishing you joyful celebrations, sound health, and peace of mind! May your year ahead be blessed with success and happiness.
              </p>
              <p style={{ color: '#f5c842', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                — Amulya Kumar Das & Sasmita Das 💛
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '3px' }}>
                India Post Postal Life Insurance (PLI / RPLI)
              </p>
            </div>

            {/* Close button */}
            <div
              style={{
                marginTop: '22px',
                transform: isRevealed ? 'translateY(0)' : 'translateY(16px)',
                opacity: isRevealed ? 1 : 0,
                transition: 'transform 0.5s ease 0.5s, opacity 0.4s ease 0.5s',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #f5c842, #f59e0b)',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '12px 34px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(245,200,66,0.4)',
                }}
              >
                ✓ Done & Close
              </button>
            </div>
          </div>

          {/* Canvas Scratch Surface */}
          {!isRevealed && (
            <canvas
              ref={canvasRef}
              width={400}
              height={410}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                cursor: isScratching ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onMouseDown={() => setIsScratching(true)}
              onMouseUp={() => setIsScratching(false)}
              onMouseLeave={() => setIsScratching(false)}
              onMouseMove={scratch}
              onTouchStart={(e) => { e.preventDefault(); setIsScratching(true); }}
              onTouchEnd={() => setIsScratching(false)}
              onTouchMove={(e) => { e.preventDefault(); scratch(e); }}
            />
          )}
        </div>

        {/* Progress & Skip */}
        {!isRevealed && (
          <div style={{ marginTop: '14px', padding: '0 4px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #f5c842, #fd79a8)',
                  width: `${Math.round(scratchPercent * 100)}%`,
                  transition: 'width 0.1s ease',
                }}
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textAlign: 'center', marginTop: '6px' }}>
              {Math.round(scratchPercent * 100)}% scratched • Swipe to reveal!
            </p>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                onClick={() => {
                  revealed.current = true;
                  setIsRevealed(true);
                  if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  }
                  launchCelebration();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Skip & Open Surprise 🎁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchCelebrationModal;
