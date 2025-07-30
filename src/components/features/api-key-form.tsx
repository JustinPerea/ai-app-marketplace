'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Shield, Key, AlertTriangle, CheckCircle } from 'lucide-react';

// Form validation schema
const apiKeySchema = z.object({
  provider: z.string().min(1, 'Please select a provider'),
  name: z.string().min(1, 'Key name is required').max(50, 'Name must be less than 50 characters'),
  apiKey: z.string()
    .min(10, 'API key must be at least 10 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'API key contains invalid characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

const providers = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
    keyFormat: 'sk-...', 
    keyLength: 51 
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude 3, Claude 2',
    keyFormat: 'sk-ant-...', 
    keyLength: 108 
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    description: 'Gemini Pro, Gemini Vision',
    keyFormat: 'AIza...', 
    keyLength: 39 
  },
  { 
    id: 'cohere', 
    name: 'Cohere', 
    description: 'Command, Embed, Rerank',
    keyFormat: 'co-...', 
    keyLength: 40 
  },
];

interface ApiKeyFormProps {
  onSubmit?: (data: ApiKeyFormData) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ApiKeyForm({ onSubmit, trigger }: ApiKeyFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const form = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      provider: '',
      name: '',
      apiKey: '',
      description: '',
    },
  });

  const handleSubmit = async (data: ApiKeyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(data);
      form.reset();
      setSelectedProvider('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Add New API Key
          </DialogTitle>
          <DialogDescription>
            Add an encrypted API key for secure access to AI providers. Your key will be encrypted using envelope encryption.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Provider Selection */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded-md bg-background"
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedProvider(e.target.value);
                      }}
                    >
                      <option value="">Select a provider</option>
                      {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                  {selectedProviderInfo && (
                    <FormDescription>
                      {selectedProviderInfo.description}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* Key Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="e.g., Production GPT-4, Development Claude"
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name to help you identify this key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Key */}
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="password"
                      placeholder={selectedProviderInfo ? `${selectedProviderInfo.keyFormat}` : "Paste your API key here"}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your key will be encrypted and stored securely using envelope encryption</span>
                  </FormDescription>
                  {selectedProviderInfo && (
                    <div className="text-sm text-muted-foreground">
                      Expected format: <code>{selectedProviderInfo.keyFormat}</code> ({selectedProviderInfo.keyLength} characters)
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (Optional) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Additional notes about this key"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900">Security Features:</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Envelope encryption using Google Cloud KMS</li>
                      <li>• Keys are never stored in plaintext</li>
                      <li>• Automatic key rotation reminders</li>
                      <li>• Usage monitoring and anomaly detection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add API Key'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Success/Error notification components
export function ApiKeySuccess({ keyName }: { keyName: string }) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">API Key Added Successfully</p>
            <p className="text-sm text-green-800">
              "{keyName}" has been encrypted and added to your account
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApiKeyError({ error }: { error: string }) {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Failed to Add API Key</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}