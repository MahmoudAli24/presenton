'use client';

import { useEffect, useState } from 'react';
import { setCanChangeKeys, setLLMConfig } from '@/store/slices/userConfig';
import { hasValidLLMConfig } from '@/utils/storeHelpers';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { checkIfSelectedOllamaModelIsPulled } from '@/utils/providerUtils';
import { LLMConfig } from '@/types/llm_config';

export function ConfigurationInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const route = usePathname();

  // Fetch user config state
  useEffect(() => {
    fetchUserConfigState();
  }, []);

  const setLoadingToFalseAfterNavigatingTo = (pathname: string) => {
    const interval = setInterval(() => {
      if (window.location.pathname === pathname) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 500);
  }

  const fetchUserConfigState = async () => {
    setIsLoading(true);
    const response = await fetch('/api/can-change-keys');
    const canChangeKeys = (await response.json()).canChange;
    dispatch(setCanChangeKeys(canChangeKeys));

    if (canChangeKeys) {
      const response = await fetch('/api/user-config');
      const llmConfig = await response.json();
      if (!llmConfig.LLM) {
        llmConfig.LLM = 'openai';
      }
      dispatch(setLLMConfig(llmConfig));
      const isValid = hasValidLLMConfig(llmConfig);
      if (isValid) {
        // Check if the selected Ollama model is pulled
        if (llmConfig.LLM === 'ollama') {
          const isPulled = await checkIfSelectedOllamaModelIsPulled(llmConfig.OLLAMA_MODEL);
          if (!isPulled) {
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (llmConfig.LLM === 'custom') {
          const isAvailable = await checkIfSelectedCustomModelIsAvailable(llmConfig);
          if (!isAvailable) {
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (route === '/') {
          router.push('/upload');
          setLoadingToFalseAfterNavigatingTo('/upload');
        } else {
          setIsLoading(false);
        }
      } else if (route !== '/') {
        router.push('/');
        setLoadingToFalseAfterNavigatingTo('/');
      } else {
        setIsLoading(false);
      }
    } else {
      if (route === '/') {
        router.push('/upload');
        setLoadingToFalseAfterNavigatingTo('/upload');
      } else {
        setIsLoading(false);
      }
    }
  }


  const checkIfSelectedCustomModelIsAvailable = async (llmConfig: LLMConfig) => {
    try {
      const response = await fetch('/api/v1/ppt/openai/models/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: llmConfig.CUSTOM_LLM_URL,
          api_key: llmConfig.CUSTOM_LLM_API_KEY,
        }),
      });
      const data = await response.json();
      return data.includes(llmConfig.CUSTOM_MODEL);
    } catch (error) {
      console.error('Error fetching custom models:', error);
      return false;
    }
  }


  // Check if we're in embed mode (loaded inside an iframe)
  const isEmbed = typeof window !== 'undefined' && window.self !== window.top;

  if (isEmbed && isLoading) {
    // Skip splash screen in embed mode — show nothing while loading
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F5F4FF] to-[#FFE8FF] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            {/* Logo/Branding */}
            <div className="mb-6">
              <img
                src="/Logo.png"
                alt="Ahlan"
                className="h-12 mx-auto mb-4 opacity-90"
              />
              <div className="w-16 h-1 bg-gradient-to-r from-[#0066ff] to-[#8b00ff] mx-auto rounded-full"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 font-inter">
                Initializing Application
              </h3>
              <p className="text-sm text-gray-600 font-inter">
                Loading configuration and checking model availability...
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-[#0066ff] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#8b00ff] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#ff00ff] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
