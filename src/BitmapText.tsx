import React, { useMemo } from 'react';
import { CustomFontAsset } from './App';

type BitmapTextProps = {
  text: string;
  fontAsset: CustomFontAsset;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  assetUrl?: string; // the base64 or url for the tileset
};

export const BitmapText: React.FC<BitmapTextProps> = ({ text, fontAsset, color, className, style, assetUrl }) => {
  if (fontAsset.type !== 'tileset' || !assetUrl) {
    return <span className={className} style={{ color, ...style }}>{text}</span>;
  }

  const {
    charWidth = 16,
    charHeight = 16,
    charsPerRow = 16,
    asciiOffset = 32
  } = fontAsset;

  const chars = text.split('');

  return (
    <div className={`flex flex-wrap ${className || ''}`} style={{ ...style, display: 'inline-flex' }}>
      {chars.map((char, index) => {
        const ascii = char.charCodeAt(0);
        const indexInTileset = ascii - asciiOffset;

        if (indexInTileset < 0) {
          // If char not in tileset (e.g. space when offset > 32 or unsupported char)
          return <div key={`${index}-${char}`} style={{ width: charWidth, height: charHeight }} />;
        }

        const row = Math.floor(indexInTileset / charsPerRow);
        const col = indexInTileset % charsPerRow;

        const bgPosX = -(col * charWidth);
        const bgPosY = -(row * charHeight);

        return (
          <div
            key={`${index}-${char}`}
            style={{
              width: charWidth,
              height: charHeight,
              backgroundImage: `url(${assetUrl})`,
              backgroundPosition: `${bgPosX}px ${bgPosY}px`,
              backgroundRepeat: 'no-repeat',
              // optionally use a CSS mask or mix-blend-mode to colorize it?
              // Standard tilesets usually provide their own colors, but if we want `color` support:
              // we can use mask-image instead of background-image for single-color tilesets:
              ...(color ? {
                backgroundImage: 'none',
                backgroundColor: color,
                WebkitMaskImage: `url(${assetUrl})`,
                WebkitMaskPosition: `${bgPosX}px ${bgPosY}px`,
                WebkitMaskRepeat: 'no-repeat',
                maskImage: `url(${assetUrl})`,
                maskPosition: `${bgPosX}px ${bgPosY}px`,
                maskRepeat: 'no-repeat',
              } : {}),
            }}
          />
        );
      })}
    </div>
  );
};
