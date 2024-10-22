import React from 'react';

export const Badge = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={`px-2 py-1 bg-gray-200 rounded-full text-sm ${className}`}
    {...props}
  >
    {children}
  </span>
);
