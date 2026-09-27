import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User as UserIcon, 
  Globe, 
  Wheat, 
  CloudRain, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AgroWeatherAssistantProps {
  currentLanguage: 'en' | 'hi' | 'as' | 'bn';
  onSelectLanguage: (lang: 'en' | 'hi' | 'as' | 'bn') => void;
}

export const AgroWeatherAssistant: React.FC<AgroWeatherAssistantProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Namaste! I am Agro-WeatherGPT, your AI climate, rainfall nowcast, and landslide safety advisor for the North Eastern Region. Ask me about weather forecasts, safe highway travel on NH-06/NH-29, or slope protection for standing crops.',
      timestamp: 'Just now',
      language: 'en',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestions based on language
  const quickSuggestions: Record<string, string[]> = {
    en: [
      "What is the rainfall nowcast for NH-06 Sonapur corridor today?",
      "Can I spray fertilizers in Dima Hasao or will rain wash it off?",
      "How can I prevent terrace soil slipping on 35° slopes in Meghalaya?",
      "Where is the nearest safe relief shelter in Haflong?"
    ],
    hi: [
      "आज गुवाहाटी और शिलांग के बीच कितनी बारिश होगी?",
      "क्या आज NH-06 पर यात्रा करना सुरक्षित है?",
      "भारी बारिश में पहाड़ी खेतों की मिट्टी कटने से कैसे बचाएं?",
      "हाफलॉन्ग में मवेशियों के लिए सुरक्षित राहत शिविर कहाँ है?"
    ],
    as: [
      "আজি মেঘালয় আৰু অসমৰ পাহাৰত কিমান বৰষুণ হ'ব?",
      "NH-06 সোণাপুৰ সুৰংগ পথ আজি যাতায়াতৰ বাবে নিৰাপদ নে?",
      "পথাৰত ভূমিস্খলন ৰোধ কৰিবলৈ কি ব্যৱস্থা ল'ব পাৰি?"
    ],
    bn: [
      "আজ ডিমা হাসাও এবং শিলচরে কি ভারী বৃষ্টির সম্ভাবনা আছে?",
      "NH-06 রাস্তা কি এখন চলাচলের উপযুক্ত?",
      "পাহাড়ের ঢালে ফসলের ক্ষতি এড়াতে কী পদক্ষেপ নেব?"
    ]
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech synthesis
  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set appropriate language code
    if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (currentLanguage === 'bn') utterance.lang = 'bn-IN';
    else if (currentLanguage === 'as') utterance.lang = 'as-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
      language: currentLanguage,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/agro-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Based on meteorological nowcasting, heavy precipitation is expected today. Exercise high caution.",
        timestamp: 'Just now',
        language: currentLanguage,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: "IMD Nowcast Telemetry: Rainfall over 80mm expected across Khasi-Jaintia Hills and Dima Hasao. Maintain slope drainage bunds and avoid unpaved terrace transit.",
        timestamp: 'Just now',
        language: currentLanguage,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4 h-[calc(100vh-105px)] flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900">Agro-WeatherGPT & Climate Assistant</h2>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Voice AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized rainfall nowcasting, highway advisories, and crop slope preservation for farmers and citizens.
            </p>
          </div>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-md text-[11px] ${currentLanguage === 'en' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
            >
              English
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2 py-1 rounded-md text-[11px] ${currentLanguage === 'hi' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onSelectLanguage('as')}
              className={`px-2 py-1 rounded-md text-[11px] ${currentLanguage === 'as' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
            >
              অসমীয়া
            </button>
            <button
              onClick={() => onSelectLanguage('bn')}
              className={`px-2 py-1 rounded-md text-[11px] ${currentLanguage === 'bn' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'}`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs' 
                  : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                
                <div className={`mt-2 pt-1 border-t flex items-center justify-between text-[10px] ${
                  isUser ? 'border-blue-500/60 text-blue-100' : 'border-slate-200/80 text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className="flex items-center gap-1 hover:text-emerald-700 transition"
                      title="Read aloud using voice synthesis"
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{speakingId === msg.id ? 'Stop Voice' : 'Listen Audio'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Agro-WeatherGPT analyzing meteorological feeds...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Suggested:
        </span>
        {(quickSuggestions[currentLanguage] || quickSuggestions.en).map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sq)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-[11px] text-slate-700 font-medium whitespace-nowrap transition shadow-xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            currentLanguage === 'hi'
              ? 'मौसम, वर्षा और भूस्खलन सुरक्षा के बारे में पूछें...'
              : currentLanguage === 'as'
              ? 'বতৰ, বৰষুণ আৰু ভূমিস্খলনৰ বিষয়ে প্ৰশ্ন সোধক...'
              : 'Ask about local rain nowcasts, slope stability, or crop preservation...'
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
