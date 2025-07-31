/**
 * Trademark Footer Component
 * 
 * Displays required legal disclaimers for third-party trademarks
 * in compliance with nominative fair use doctrine.
 */

export function TrademarkFooter() {
  return (
    <div className="text-xs text-gray-500 text-center py-4 border-t border-gray-200/20 mt-8">
      <p className="max-w-4xl mx-auto">
        Third-party logos and product names are trademarks of their respective owners. 
        OpenAI®, ChatGPT®, Anthropic®, Claude®, Google®, Gemini®, Cohere®, and Hugging Face® 
        are trademarks of their respective companies. This platform is not affiliated with, 
        endorsed by, or sponsored by these companies. The display of third-party logos 
        indicates available integrations only.
      </p>
    </div>
  );
}