'use client';

import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Bot, Plus } from 'lucide-react';

export default function ChatPanel() {
  const { state, dispatch, getActiveAgent, sendMessage, createAgentFromPrompt } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeAgent = getActiveAgent();
  const isInitialState = !activeAgent && state.messages.length === 0;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading || isTyping) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    // If there's an active agent, continue conversation with it
    if (activeAgent) {
      sendMessage(message);
    } else {
      // If no active agent, create new agents from prompt
      createAgentFromPrompt(message);
    }
    
    // Reset typing indicator after a short delay
    setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };



  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        {activeAgent ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{activeAgent.avatar}</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{activeAgent.name}</h2>
                <p className="text-sm text-gray-500">{activeAgent.capabilities.join(', ')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Clear active agent to start new chat
                dispatch({ type: 'SET_ACTIVE_AGENT', payload: null });
                dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
                dispatch({ type: 'SET_MESSAGES', payload: [] });
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        ) : isInitialState ? (
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Describe your task and I&apos;ll create the right agents for you</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select an Agent</h2>
              <p className="text-sm text-gray-500">Choose an agent from the left panel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeAgent ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Agent System</h3>
              <p className="text-gray-500 mb-4">
                Describe what you want to accomplish and I&apos;ll automatically create the right AI agents with the necessary tools and permissions to help you.
              </p>
              <div className="text-sm text-gray-400">
                <p>Example: &quot;I need to analyze sales data and create a report&quot;</p>
              </div>
            </div>
          </div>
        ) : state.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">{activeAgent.avatar}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation with {activeAgent.name}</h3>
              <p className="text-gray-500">Ask me anything about {activeAgent.capabilities.join(', ').toLowerCase()}</p>
            </div>
          </div>
        ) : (
          state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={!activeAgent ? "Describe your task..." : `Message ${activeAgent?.name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={state.isLoading || isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || state.isLoading || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
