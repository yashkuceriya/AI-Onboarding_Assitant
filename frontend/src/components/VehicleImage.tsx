import { useState, useRef } from 'react';
import CarSilhouette from './CarSilhouette';

// Fallback image mapping by make
const CAR_IMAGES: Record<string, string> = {
  'toyota rav4': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
  'honda civic': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  'tesla model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  'kia telluride': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
  'mazda cx-5': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
  'ford maverick': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80',
  'hyundai ioniq 5': 'https://images.unsplash.com/photo-1680024315041-764e1850a69d?auto=format&fit=crop&w=800&q=80',
  'subaru outback': 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=800&q=80',
  'bmw 330i': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  'chevrolet bolt': 'https://images.unsplash.com/photo-1651608790173-f3819e3ba43a?auto=format&fit=crop&w=800&q=80',
  'toyota camry': 'https://images.unsplash.com/photo-1621993202323-eb4e81f5a0a7?auto=format&fit=crop&w=800&q=80',
  'jeep wrangler': 'https://images.unsplash.com/photo-1533591380348-14193f1de18f?auto=format&fit=crop&w=800&q=80',
  'volkswagen id.4': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'honda cr-v': 'https://images.unsplash.com/photo-1568844293986-8d0400f4745b?auto=format&fit=crop&w=800&q=80',
  'porsche macan': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  'toyota tacoma': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
  'audi q5': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
  'rivian r1s': 'https://images.unsplash.com/photo-1617886903355-9354cfafbc44?auto=format&fit=crop&w=800&q=80',
  'mazda mazda3': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  'ford mustang mach-e': 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=800&q=80',
  'lexus rx': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
  'honda accord': 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80',
  'gmc sierra': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
  'hyundai tucson': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80',
};

function getImageUrl(imageUrl?: string, make?: string, model?: string): string | null {
  if (imageUrl) return imageUrl;
  if (!make || !model) return null;

  const fullKey = `${make} ${model}`.toLowerCase();

  // Exact match first
  for (const [k, v] of Object.entries(CAR_IMAGES)) {
    if (fullKey === k || fullKey.startsWith(k)) return v;
  }

  // Partial match: check if the make+first-word-of-model matches
  const makeModel = `${make} ${model.split(' ')[0]}`.toLowerCase();
  for (const [k, v] of Object.entries(CAR_IMAGES)) {
    if (k.startsWith(makeModel) || makeModel === k) return v;
  }

  return null;
}

interface VehicleImageProps {
  imageUrl?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  gradient?: [string, string];
  className?: string;  // for the container
  silhouetteSize?: string; // tailwind class like "w-40"
  children?: React.ReactNode; // for overlay content (badges etc)
}

export default function VehicleImage({
  imageUrl,
  make,
  model,
  bodyType = 'sedan',
  gradient = ['#64748b', '#475569'],
  className = '',
  silhouetteSize = 'w-40',
  children,
}: VehicleImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const resolvedUrl = getImageUrl(imageUrl, make, model);

  // Reset states when vehicle changes
  const prevUrl = useRef(resolvedUrl);
  if (prevUrl.current !== resolvedUrl) {
    prevUrl.current = resolvedUrl;
    if (loaded) setLoaded(false);
    if (errored) setErrored(false);
  }

  const showImage = resolvedUrl && !errored;
  const [g1, g2] = gradient;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
    >
      {showImage && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-shimmer" />
          )}
          <img
            src={resolvedUrl}
            alt={make && model ? `${make} ${model}` : 'Vehicle'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            loading="lazy"
          />
          {/* Subtle gradient overlay to keep text readable */}
          {loaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          )}
        </>
      )}
      {!showImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CarSilhouette type={bodyType} className={`${silhouetteSize} text-white`} />
        </div>
      )}
      {/* Children rendered on top (badges, buttons etc) */}
      {children}
    </div>
  );
}
