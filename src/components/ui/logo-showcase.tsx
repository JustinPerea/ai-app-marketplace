'use client';

import { MissionControlLogo } from './mission-control-logo';
import { NavigatorLogo } from './navigator-logo';

interface LogoShowcaseProps {
  showTitles?: boolean;
}

export function LogoShowcase({ showTitles = true }: LogoShowcaseProps) {
  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {showTitles && (
        <h2 className="text-2xl font-bold text-center text-text-primary mb-4">
          Cosmara Professional Logo Icons
        </h2>
      )}
      
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Mission Control Logo */}
        <div className="text-center space-y-4">
          <div className="glass-card p-6 inline-block rounded-xl">
            <MissionControlLogo size={96} animated={true} />
          </div>
          {showTitles && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Mission Control</h3>
              <p className="text-sm text-text-secondary">Command tower with cosmic signal waves</p>
            </div>
          )}
        </div>

        {/* Navigator Logo */}
        <div className="text-center space-y-4">
          <div className="glass-card p-6 inline-block rounded-xl">
            <NavigatorLogo size={96} animated={true} />
          </div>
          {showTitles && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Navigator Mode</h3>
              <p className="text-sm text-text-secondary">Cosmic compass with constellation navigation</p>
            </div>
          )}
        </div>
      </div>

      {/* Size Variations */}
      {showTitles && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-text-primary mb-6 text-center">
            Size Variations
          </h3>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <MissionControlLogo size={32} animated={false} />
              <p className="text-xs text-text-muted mt-2">32px</p>
            </div>
            <div className="text-center">
              <MissionControlLogo size={48} animated={false} />
              <p className="text-xs text-text-muted mt-2">48px</p>
            </div>
            <div className="text-center">
              <MissionControlLogo size={64} animated={false} />
              <p className="text-xs text-text-muted mt-2">64px</p>
            </div>
            <div className="text-center">
              <NavigatorLogo size={32} animated={false} />
              <p className="text-xs text-text-muted mt-2">32px</p>
            </div>
            <div className="text-center">
              <NavigatorLogo size={48} animated={false} />
              <p className="text-xs text-text-muted mt-2">48px</p>
            </div>
            <div className="text-center">
              <NavigatorLogo size={64} animated={false} />
              <p className="text-xs text-text-muted mt-2">64px</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}