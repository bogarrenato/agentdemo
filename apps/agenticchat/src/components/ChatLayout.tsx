'use client';

import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import ConversationsPanel from './ConversationsPanel';
import ChatPanel from './ChatPanel';
import ResourcesPanel from './ResourcesPanel';

export default function ChatLayout() {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Left Panel - Conversations */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h">
          <ConversationsPanel />
        </div>

        {/* Center Panel - Chat */}
        <div className="flex-1 flex flex-col">
          <ChatPanel />
        </div>

        {/* Right Panel - Resources */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <ResourcesPanel />
        </div>
      </div>
    </ChatProvider>
  );
}
