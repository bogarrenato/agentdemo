'use client';

import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Bot, Plus } from 'lucide-react';
import { ChatSection } from '@llamaindex/chat-ui';

export default function ChatPanel() {
  const { state, dispatch, getActiveAgent, sendMessage, createAgentFromPrompt } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeAgent = getActiveAgent();
  const isInitialState = !activeAgent && state.messages.length === 0;

  // Chat handler for LlamaIndex ChatSection
  const chatHandler = {
    messages: state.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.timestamp,
      parts: [{ type: 'text', text: msg.content }],
    })),
    input: inputValue,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    handleSubmit: async (e: React.FormEvent) => {
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
    },
    isLoading: state.isLoading || isTyping,
    error: null,
    status: (state.isLoading || isTyping ? 'streaming' : 'ready') as 'streaming' | 'ready' | 'submitted' | 'error',
    sendMessage: async (msg: unknown) => {
      const message = typeof msg === 'string' ? msg : 
        (msg as { content?: string; parts?: { text?: string }[] })?.content || 
        (msg as { content?: string; parts?: { text?: string }[] })?.parts?.[0]?.text || '';
      if (activeAgent) {
        sendMessage(message);
      } else {
        createAgentFromPrompt(message);
      }
    },
    reload: () => {
      // Mock implementation
    },
    stop: async () => {
      // Mock implementation
    },
    append: () => {
      // Mock implementation
    },
    setMessages: () => {
      // Mock implementation
    },
    setInput: (value: string) => {
      setInputValue(value);
    },
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
      <div className="flex-1 overflow-y-auto">
        {!activeAgent ? (
          <div className="h-full flex flex-col">
            {/* Welcome message */}
            <div className="flex-1 flex items-center justify-center p-4">
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
            {/* Chat input for new chat */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <ChatSection handler={chatHandler} />
            </div>
          </div>
        ) : (
          <div className="h-full">
            <ChatSection handler={chatHandler} />
          </div>
        )}
      </div>
    </div>
  );
}
