import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

export default function MarketingPageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0B0F] overflow-hidden">
      <MarketingNav />
      <div className="pt-24">
        <div className="absolute inset-0 animated-gradient opacity-15 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0B0F_70%)] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
      <MarketingFooter />
    </div>
  );
}
