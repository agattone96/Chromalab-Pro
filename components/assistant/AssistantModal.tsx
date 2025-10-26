import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { getAssistantResponse } from '../../services/assistantService';
import type { ColorPlan, HairAnalysis, ChatMessage } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorPlan: ColorPlan;
  hairAnalysis: HairAnalysis | null;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, colorPlan, hairAnalysis }) => {
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setConversation([
        { role: 'model', text: `Hello! I'm your AI Assistant. I'm ready to guide you through this color plan. Your first step is: **"${colorPlan.steps[0]}"**. What would you like to know?` }
      ]);
    }
  }, [isOpen, colorPlan]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const newConversation: ChatMessage[] = [...conversation, { role: 'user', text: userInput }];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);

    try {
      const assistantReply = await getAssistantResponse(newConversation, colorPlan, hairAnalysis);
      setConversation([...newConversation, { role: 'model', text: assistantReply }]);
    } catch (error) {
      console.error('Assistant error:', error);
      setConversation([...newConversation, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Color Plan Assistant">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--color-accent-violet] to-[--color-accent-pink] flex items-center justify-center flex-shrink-0">🤖</div>}
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[--color-border] rounded-br-none' : 'bg-black/20 rounded-bl-none'}`}
              >
                <p className="text-sm prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
              </div>
            </div>
          ))}
           {isLoading && (
            <div className="flex gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--color-accent-violet] to-[--color-accent-pink] flex items-center justify-center flex-shrink-0"><Spinner /></div>
               <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-black/20 rounded-bl-none">
                 <p className="text-sm text-[--color-text-secondary] italic">Thinking...</p>
               </div>
            </div>
           )}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-4 pt-4 border-t border-[--color-border]">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g., What developer should I use for the roots?"
              className="w-full bg-black/20 border border-[--color-border] rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !userInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white"><path d="M3.105 3.105a.75.75 0 011.06 0L10 8.94l5.835-5.836a.75.75 0 111.06 1.06L11.06 10l5.835 5.835a.75.75 0 11-1.06 1.06L10 11.06l-5.835 5.835a.75.75 0 01-1.06-1.06L8.94 10 3.105 4.165a.75.75 0 010-1.06z" clipRule="evenodd" transform="rotate(45 10 10) scale(0.8)"/><path d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssistantModal;
