import React from "react";
import nmlLogo from "../../Nml_logo.png";
import infLogo from "../../inf.png";

export default function Header() {
  return (
    <header className="bg-[#141414] border-b-4 border-black shrink-0 relative py-3">
      {/* Subtle top trim highlighting */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-805"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-center sm:justify-between">
        
        {/* Dynamic Joint Logo Section - Brand symmetry center-aligned of transparent logo graphics */}
        <div className="flex items-center gap-4 select-none">
          <img 
            src={nmlLogo} 
            alt="NML Logo" 
            className="h-9 w-auto object-contain smooth-image"
            referrerPolicy="no-referrer"
          />
          
          {/* Symmetrical divider */}
          <span className="font-pixel text-[12px] text-[#ffaa00] mc-shadow-text">×</span>

          <img 
            src={infLogo} 
            alt="Infinity NP Logo" 
            className="h-9 w-auto object-contain smooth-image"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Brand championship caption on desktop to establish visual rhythm */}
        <div className="hidden sm:block font-pixel text-[8px] text-[#ffaa00] mc-shadow-text uppercase tracking-wider">
          CHAMPIONSHIP STANDINGS
        </div>

      </div>
    </header>
  );
}
