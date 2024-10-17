import React from 'react';

export const Progress = ({ value, className, ...props }: React.ProgressHTMLAttributes<HTMLProgressElement>) => (
  <progress value={value} max="100" className={`w-full ${className}`} {...props} />
);
