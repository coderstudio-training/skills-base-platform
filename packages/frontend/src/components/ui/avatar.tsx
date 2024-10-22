import React from 'react';
import Image from 'next/image';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const Avatar = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`w-10 h-10 rounded-full overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const AvatarImage = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: AvatarImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={typeof width === 'string' ? Number(width) : width} // Ensure width is a number
    height={typeof height === 'string' ? Number(height) : height} // Ensure height is a number
    className={`object-cover ${className || ''}`}
    {...props}
  />
);

export const AvatarFallback = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 ${className}`}
    {...props}
  >
    {children}
  </div>
);
