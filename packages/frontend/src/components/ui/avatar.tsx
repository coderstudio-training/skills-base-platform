import React from 'react';

export const Avatar = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`w-10 h-10 rounded-full overflow-hidden ${className}`} {...props}>{children}</div>
);

export const AvatarImage = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} {...props} />
);

export const AvatarFallback = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 ${className}`} {...props}>
    {children}
  </div>
);
