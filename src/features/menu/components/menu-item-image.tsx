'use client';
import Image from 'next/image';
import { useState } from 'react';
export function MenuItemImage({ src, alt }: { src: string; alt: string }) {
  return <Photo key={src} src={src} alt={alt} />;
}
function Photo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? null : (
    <Image
      src={src}
      alt={alt}
      width={80}
      height={80}
      unoptimized
      onError={() => setFailed(true)}
      className="mb-2 rounded object-cover"
    />
  );
}
