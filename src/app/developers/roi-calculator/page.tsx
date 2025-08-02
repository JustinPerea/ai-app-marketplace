import { MainLayout } from '@/components/layouts/main-layout';
import { DeveloperROICalculator } from '@/components/calculators/developer-roi-calculator';
import { SimpleStars } from '@/components/ui/simple-stars';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer ROI Calculator | COSMARA AI Marketplace',
  description: 'Calculate your potential revenue from building apps on COSMARA. See how much you could earn with our 0% commission platform and growing user base.',
  keywords: ['developer revenue', 'ROI calculator', 'AI app monetization', 'COSMARA marketplace', 'developer earnings'],
};

export default function DeveloperROICalculatorPage() {
  return (
    <MainLayout>
      <SimpleStars starCount={100} parallaxSpeed={0.2} />
      <DeveloperROICalculator />
    </MainLayout>
  );
}