"use client";

import React from 'react';

interface BlockRendererProps {
  data: string;
  className?: string;
}

/**
 * BlockRenderer - jednoducho renderuje HTML obsah
 * Používa sa pre zobrazenie articles/news na frontende
 */
const BlockRenderer: React.FC<BlockRendererProps> = ({ data, className = "" }) => {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: data }} 
    />
  );
};

export default BlockRenderer;