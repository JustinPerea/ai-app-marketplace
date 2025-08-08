"use client";

import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ProviderLogo } from '@/components/ui/provider-logo';

interface ProviderRequiredNoticeProps {
  providerIds: string[];
  message?: string;
  className?: string;
}

export function ProviderRequiredNotice({ providerIds, message, className }: ProviderRequiredNoticeProps) {
  return (
    <Alert className={className ?? ''}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message ?? 'This feature requires one or more AI providers to be connected.'}
        {providerIds?.length ? (
          <span className="inline-flex items-center gap-2 ml-2">
            {providerIds.map((id) => (
              <ProviderLogo key={id} provider={id} size={16} />
            ))}
          </span>
        ) : null}
        <span className="ml-2">
          <Link href="/setup" className="text-blue-600 hover:underline">Go to Setup</Link>
        </span>
      </AlertDescription>
    </Alert>
  );
}



