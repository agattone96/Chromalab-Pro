import React, { useState, useEffect, useRef } from 'react';
import type { ColorPlan, HairAnalysis, ChatMessage } from '../../types';
import Tooltip from '../common/Tooltip';
import { SparklesIcon, BookOpenIcon } from '../icons';

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  colorPlan: ColorPlan | null;
  hairAnalysis: HairAnalysis | null;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ isOpen, onClose, colorPlan, hairAnalysis }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [teachMeWhy, setTeachMeWhy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'model', text: "Hello! I'm your Chromalab Assistant. How can I help you with this color plan?" }
      ]);
    }
  }, [isOpen, colorPlan]);


  const handleSend = () => {
    if (userInput.trim() === '') return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    // TODO: Integrate with assistantService.askAssistant
  };

  const handleQuickAction = (action: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: action }];
    setMessages(newMessages);
    // TODO: Integrate with assistantService for quick actions
  };

  if (!isOpen) return null;

  const panelContent = (
    <>
      <div className="p-4 border-b border-[--color-border] flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-[--color-accent-violet]" />
          Chromalab Assistant
        </h3>
        <div className="flex items-center">
           <Tooltip text="Toggle Educational Explanations">
              <label htmlFor="teach-toggle" className="flex items-center cursor-pointer mr-4">
                <BookOpenIcon className="w-5 h-5 mr-2 text-[--color-text-secondary]"/>
                <div className="relative">
                  <input type="checkbox" id="teach-toggle" className="sr-only" checked={teachMeWhy} onChange={() => setTeachMeWhy(!teachMeWhy)} />
                  <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${teachMeWhy ? 'transform translate-x-full bg-[--color-accent-violet]' : ''}`}></div>
                </div>
              </label>
            </Tooltip>
            <button onClick={() => setIsCollapsed(true)} className="text-[--color-text-secondary] hover:text-[--color-text-primary]">&mdash;</button>
            <button onClick={onClose} className="ml-2 text-[--color-text-secondary] hover:text-[--color-text-primary]">&times;</button>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto h-64">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.role === 'user' ? 'bg-[--color-accent-violet] text-white' : 'bg-[--color-surface-light]'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[--color-border]">
        <div className="grid grid-cols-3 gap-2 mb-3">
            <button onClick={() => handleQuickAction('Adjust Developer')} className="quick-action-btn">Adjust Developer</button>
            <button onClick={() => handleQuickAction('Swap Toner')} className="quick-action-btn">Swap Toner</button>
            <button onClick={() => handleQuickAction('Suggest Aftercare')} className="quick-action-btn">Suggest Aftercare</button>
        </div>
        <div className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-grow bg-[--color-base] border border-[--color-border] rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-[--color-accent-violet]"
          />
          <button onClick={handleSend} className="bg-[--color-accent-violet] text-white px-4 rounded-r-md hover:opacity-90">Send</button>
        </div>
      </div>
    </>
  );

  const collapsedButton = (
     <button onClick={() => setIsCollapsed(false)} className="w-16 h-16 bg-gradient-to-br from-[--color-accent-violet] to-[--color-accent-pink] rounded-full flex items-center justify-center shadow-lg hover:scale-110 cursor-pointer transition-all duration-300 animate-pulse">
        <SparklesIcon className="w-8 h-8 text-white"/>
     </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
       <div className={`transition-all duration-300 ${isCollapsed ? 'w-16 h-16' : 'w-96 bg-[--color-surface] shadow-2xl rounded-2xl border border-[--color-border] flex flex-col'}`}>
        {isCollapsed ? collapsedButton : panelContent}
       </div>
    </div>
  );
};

export default AssistantPanel;

// Add some styles to index.css or a global stylesheet if you have one.
// For now, let's assume you have a way to inject this CSS. A real app would use a CSS-in-JS solution or a global stylesheet.
const styles = `
  .quick-action-btn {
    background-color: var(--color-surface-light);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    padding: 8px;
    border-radius: 6px;
    font-size: 12px;
    transition: all 0.2s ease-in-out;
  }
  .quick-action-btn:hover {
    background-color: var(--color-accent-violet);
    color: white;
    border-color: var(--color-accent-violet);
  }
`;

// This is a hack for demonstration. In a real project, this would be in a CSS file.
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
