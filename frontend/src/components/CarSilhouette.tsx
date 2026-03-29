interface CarSilhouetteProps {
  type: string;
  className?: string;
}

export default function CarSilhouette({ type, className = '' }: CarSilhouetteProps) {
  const t = type?.toLowerCase() || 'sedan';

  if (t === 'truck') {
    return (
      <svg viewBox="0 0 400 160" className={className} fill="none" opacity={0.35}>
        {/* Body */}
        <path d="M40,120 L40,85 L100,85 L100,55 L160,55 L175,35 L280,35 L295,55 L360,55 L360,120" fill="white" opacity={0.15} />
        {/* Cabin */}
        <path d="M100,85 L100,55 L160,55 L175,35 L280,35 L295,55 L295,85 Z" fill="white" opacity={0.1} />
        {/* Windshield */}
        <path d="M175,38 L165,55 L200,55 Z" fill="white" opacity={0.25} />
        {/* Rear window */}
        <path d="M240,38 L280,38 L290,55 L240,55 Z" fill="white" opacity={0.2} />
        {/* Side windows */}
        <path d="M205,40 L235,40 L235,55 L205,55 Z" fill="white" opacity={0.2} />
        {/* Headlight */}
        <rect x="42" y="88" width="18" height="8" rx="4" fill="white" opacity={0.35} />
        {/* Taillight */}
        <rect x="345" y="88" width="14" height="10" rx="3" fill="white" opacity={0.3} />
        {/* Bed lines */}
        <line x1="100" y1="60" x2="100" y2="120" stroke="white" opacity={0.1} strokeWidth="1.5" />
        {/* Door handle */}
        <rect x="220" y="62" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
        {/* Bumper line */}
        <line x1="40" y1="105" x2="360" y2="105" stroke="white" opacity={0.08} strokeWidth="1" />
        {/* Wheel wells */}
        <path d="M70,120 C70,100 90,85 110,85 C130,85 150,100 150,120" fill="black" opacity={0.2} />
        <path d="M260,120 C260,100 280,85 300,85 C320,85 340,100 340,120" fill="black" opacity={0.2} />
        {/* Wheels */}
        <circle cx="110" cy="122" r="22" fill="white" opacity={0.08} />
        <circle cx="110" cy="122" r="18" stroke="white" opacity={0.25} strokeWidth="2" fill="none" />
        <circle cx="110" cy="122" r="8" fill="white" opacity={0.15} />
        <circle cx="300" cy="122" r="22" fill="white" opacity={0.08} />
        <circle cx="300" cy="122" r="18" stroke="white" opacity={0.25} strokeWidth="2" fill="none" />
        <circle cx="300" cy="122" r="8" fill="white" opacity={0.15} />
        {/* Wheel spokes */}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <line key={`fl${angle}`} x1="110" y1="122" x2={110 + 14 * Math.cos(angle * Math.PI / 180)} y2={122 + 14 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <line key={`rl${angle}`} x1="300" y1="122" x2={300 + 14 * Math.cos(angle * Math.PI / 180)} y2={122 + 14 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        {/* Ground shadow */}
        <ellipse cx="200" cy="145" rx="170" ry="6" fill="black" opacity={0.1} />
      </svg>
    );
  }

  if (t === 'suv') {
    return (
      <svg viewBox="0 0 400 160" className={className} fill="none" opacity={0.35}>
        {/* Body */}
        <path d="M45,120 L45,65 L85,65 L105,30 L295,30 L315,65 L355,65 L355,120" fill="white" opacity={0.15} />
        {/* Roof */}
        <path d="M105,30 L295,30 L315,65 L85,65 Z" fill="white" opacity={0.08} />
        {/* Windshield */}
        <path d="M110,33 L92,62 L145,62 L145,33 Z" fill="white" opacity={0.25} />
        {/* Rear windshield */}
        <path d="M260,33 L290,33 L310,62 L260,62 Z" fill="white" opacity={0.2} />
        {/* Side windows */}
        <path d="M150,33 L195,33 L195,62 L150,62 Z" fill="white" opacity={0.2} />
        <path d="M200,33 L255,33 L255,62 L200,62 Z" fill="white" opacity={0.18} />
        {/* Window pillar */}
        <line x1="197" y1="33" x2="197" y2="62" stroke="white" opacity={0.05} strokeWidth="4" />
        {/* Headlights */}
        <rect x="47" y="72" width="20" height="10" rx="5" fill="white" opacity={0.35} />
        {/* Taillights */}
        <rect x="340" y="72" width="14" height="12" rx="3" fill="white" opacity={0.3} />
        {/* Door handles */}
        <rect x="160" y="70" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
        <rect x="240" y="70" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
        {/* Body line */}
        <line x1="48" y1="85" x2="352" y2="85" stroke="white" opacity={0.1} strokeWidth="1" />
        {/* Roof rails */}
        <line x1="120" y1="28" x2="280" y2="28" stroke="white" opacity={0.15} strokeWidth="2" />
        {/* Wheel wells */}
        <path d="M70,120 C70,97 92,80 115,80 C138,80 160,97 160,120" fill="black" opacity={0.2} />
        <path d="M245,120 C245,97 267,80 290,80 C313,80 335,97 335,120" fill="black" opacity={0.2} />
        {/* Wheels */}
        <circle cx="115" cy="122" r="24" fill="white" opacity={0.08} />
        <circle cx="115" cy="122" r="19" stroke="white" opacity={0.25} strokeWidth="2.5" fill="none" />
        <circle cx="115" cy="122" r="8" fill="white" opacity={0.15} />
        <circle cx="290" cy="122" r="24" fill="white" opacity={0.08} />
        <circle cx="290" cy="122" r="19" stroke="white" opacity={0.25} strokeWidth="2.5" fill="none" />
        <circle cx="290" cy="122" r="8" fill="white" opacity={0.15} />
        {[0, 72, 144, 216, 288].map(angle => (
          <line key={`fl${angle}`} x1="115" y1="122" x2={115 + 15 * Math.cos(angle * Math.PI / 180)} y2={122 + 15 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        {[0, 72, 144, 216, 288].map(angle => (
          <line key={`rl${angle}`} x1="290" y1="122" x2={290 + 15 * Math.cos(angle * Math.PI / 180)} y2={122 + 15 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        {/* Ground shadow */}
        <ellipse cx="200" cy="148" rx="165" ry="6" fill="black" opacity={0.1} />
      </svg>
    );
  }

  if (t === 'wagon') {
    return (
      <svg viewBox="0 0 400 160" className={className} fill="none" opacity={0.35}>
        {/* Body */}
        <path d="M35,120 L35,70 L65,70 L95,32 L335,32 L350,70 L365,70 L365,120" fill="white" opacity={0.15} />
        {/* Roof line - elongated */}
        <path d="M95,32 L335,32 L350,70 L65,70 Z" fill="white" opacity={0.08} />
        {/* Windshield */}
        <path d="M100,35 L72,67 L140,67 L140,35 Z" fill="white" opacity={0.25} />
        {/* Rear window */}
        <path d="M295,35 L330,35 L345,67 L295,67 Z" fill="white" opacity={0.2} />
        {/* Side windows */}
        <path d="M145,35 L200,35 L200,67 L145,67 Z" fill="white" opacity={0.2} />
        <path d="M205,35 L290,35 L290,67 L205,67 Z" fill="white" opacity={0.18} />
        {/* Headlights */}
        <rect x="37" y="76" width="20" height="8" rx="4" fill="white" opacity={0.35} />
        {/* Taillights */}
        <rect x="352" y="74" width="12" height="14" rx="3" fill="white" opacity={0.3} />
        {/* Door handles */}
        <rect x="165" y="72" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
        <rect x="255" y="72" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
        {/* Body line */}
        <line x1="38" y1="88" x2="362" y2="88" stroke="white" opacity={0.1} strokeWidth="1" />
        {/* Wheel wells */}
        <path d="M62,120 C62,98 82,82 105,82 C128,82 148,98 148,120" fill="black" opacity={0.2} />
        <path d="M258,120 C258,98 278,82 300,82 C322,82 342,98 342,120" fill="black" opacity={0.2} />
        {/* Wheels */}
        <circle cx="105" cy="122" r="22" fill="white" opacity={0.08} />
        <circle cx="105" cy="122" r="17" stroke="white" opacity={0.25} strokeWidth="2" fill="none" />
        <circle cx="105" cy="122" r="7" fill="white" opacity={0.15} />
        <circle cx="300" cy="122" r="22" fill="white" opacity={0.08} />
        <circle cx="300" cy="122" r="17" stroke="white" opacity={0.25} strokeWidth="2" fill="none" />
        <circle cx="300" cy="122" r="7" fill="white" opacity={0.15} />
        {[0, 72, 144, 216, 288].map(angle => (
          <line key={`fl${angle}`} x1="105" y1="122" x2={105 + 13 * Math.cos(angle * Math.PI / 180)} y2={122 + 13 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        {[0, 72, 144, 216, 288].map(angle => (
          <line key={`rl${angle}`} x1="300" y1="122" x2={300 + 13 * Math.cos(angle * Math.PI / 180)} y2={122 + 13 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
        ))}
        <ellipse cx="200" cy="146" rx="170" ry="6" fill="black" opacity={0.1} />
      </svg>
    );
  }

  // Default: sedan
  return (
    <svg viewBox="0 0 400 160" className={className} fill="none" opacity={0.35}>
      {/* Body */}
      <path d="M30,120 L30,75 L70,75 L110,32 L270,32 L310,75 L370,75 L370,120" fill="white" opacity={0.15} />
      {/* Roof/cabin */}
      <path d="M110,32 L270,32 L310,75 L70,75 Z" fill="white" opacity={0.08} />
      {/* Windshield */}
      <path d="M115,35 L78,72 L155,72 L155,35 Z" fill="white" opacity={0.25} />
      {/* Rear window */}
      <path d="M230,35 L265,35 L302,72 L230,72 Z" fill="white" opacity={0.2} />
      {/* Side windows */}
      <path d="M160,35 L225,35 L225,72 L160,72 Z" fill="white" opacity={0.2} />
      {/* Window pillar */}
      <line x1="192" y1="35" x2="192" y2="72" stroke="white" opacity={0.05} strokeWidth="4" />
      {/* Headlights */}
      <path d="M32,78 L50,78 C54,78 56,82 56,86 L32,86 Z" fill="white" opacity={0.35} />
      {/* Taillights */}
      <rect x="356" y="78" width="13" height="12" rx="3" fill="white" opacity={0.3} />
      {/* Door handles */}
      <rect x="165" y="78" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
      <rect x="245" y="78" width="16" height="3" rx="1.5" fill="white" opacity={0.2} />
      {/* Body line */}
      <line x1="33" y1="92" x2="367" y2="92" stroke="white" opacity={0.1} strokeWidth="1" />
      {/* Front bumper accent */}
      <rect x="38" y="98" width="28" height="4" rx="2" fill="white" opacity={0.08} />
      {/* Wheel wells */}
      <path d="M60,120 C60,98 80,82 103,82 C126,82 146,98 146,120" fill="black" opacity={0.2} />
      <path d="M260,120 C260,98 280,82 303,82 C326,82 346,98 346,120" fill="black" opacity={0.2} />
      {/* Wheels */}
      <circle cx="103" cy="122" r="22" fill="white" opacity={0.08} />
      <circle cx="103" cy="122" r="17" stroke="white" opacity={0.25} strokeWidth="2.5" fill="none" />
      <circle cx="103" cy="122" r="7" fill="white" opacity={0.15} />
      <circle cx="303" cy="122" r="22" fill="white" opacity={0.08} />
      <circle cx="303" cy="122" r="17" stroke="white" opacity={0.25} strokeWidth="2.5" fill="none" />
      <circle cx="303" cy="122" r="7" fill="white" opacity={0.15} />
      {/* Wheel spokes */}
      {[0, 72, 144, 216, 288].map(angle => (
        <line key={`fl${angle}`} x1="103" y1="122" x2={103 + 13 * Math.cos(angle * Math.PI / 180)} y2={122 + 13 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
      ))}
      {[0, 72, 144, 216, 288].map(angle => (
        <line key={`rl${angle}`} x1="303" y1="122" x2={303 + 13 * Math.cos(angle * Math.PI / 180)} y2={122 + 13 * Math.sin(angle * Math.PI / 180)} stroke="white" opacity={0.12} strokeWidth="1.5" />
      ))}
      {/* Ground shadow */}
      <ellipse cx="200" cy="146" rx="165" ry="6" fill="black" opacity={0.1} />
    </svg>
  );
}
