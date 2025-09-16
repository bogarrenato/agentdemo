'use client';

import React, { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Plus, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { Agent, Conversation } from '../contexts/ChatContext';

export default function ConversationsPanel() {
  const { state, dispatch, getSubAgents, createNewConversation } = useChat();

  // Initialize with sample data
  useEffect(() => {
    const sampleAgents = [
      {
        id: 'agent_1',
        name: 'Data Analyst Agent',
        avatar: '🤖',
        type: 'primary' as const,
        capabilities: ['Data Analysis', 'Excel Processing', 'Report Generation'],
        resources: [
          {
            id: 'excel_1',
            name: 'Sales Data Q4.xlsx',
            type: 'excel' as const,
            icon: '📊',
            description: 'Quarterly sales data',
            permissions: ['read', 'write'],
          },
          {
            id: 'db_1',
            name: 'Analytics Database',
            type: 'database' as const,
            icon: '🗄️',
            description: 'Main analytics database',
            permissions: ['read'],
          },
        ],
        isActive: true,
      },
      {
        id: 'agent_2',
        name: 'Customer Support Agent',
        avatar: '🎧',
        type: 'primary' as const,
        capabilities: ['Customer Service', 'Ticket Management', 'Knowledge Base'],
        resources: [
          {
            id: 'kb_1',
            name: 'Knowledge Base',
            type: 'database' as const,
            icon: '📚',
            description: 'Customer support knowledge base',
            permissions: ['read'],
          },
          {
            id: 'api_1',
            name: 'CRM API',
            type: 'api' as const,
            icon: '🔗',
            description: 'Customer relationship management API',
            permissions: ['read', 'write'],
          },
        ],
        isActive: false,
      },
      {
        id: 'agent_3',
        name: 'Excel Processor',
        avatar: '📊',
        type: 'sub-agent' as const,
        parentId: 'agent_1',
        capabilities: ['Excel Processing', 'Data Validation'],
        resources: [
          {
            id: 'excel_2',
            name: 'Template Library',
            type: 'file' as const,
            icon: '📁',
            description: 'Excel templates and macros',
            permissions: ['read'],
          },
        ],
        isActive: false,
      },
      {
        id: 'agent_4',
        name: 'Report Generator',
        avatar: '📈',
        type: 'sub-agent' as const,
        parentId: 'agent_1',
        capabilities: ['Report Generation', 'Visualization'],
        resources: [
          {
            id: 'tool_1',
            name: 'Charting Tools',
            type: 'api' as const,
            icon: '📊',
            description: 'Chart and visualization tools',
            permissions: ['read', 'write'],
          },
        ],
        isActive: false,
      },
    ];

    const sampleConversations = [
      {
        id: 'conv_1',
        agentId: 'agent_1',
        title: 'Q4 Sales Analysis',
        lastMessage: 'Can you analyze the sales trends?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        messageCount: 15,
      },
      {
        id: 'conv_2',
        agentId: 'agent_2',
        title: 'Customer Issue #1234',
        lastMessage: 'The customer is asking about refund policy',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        messageCount: 8,
      },
    ];

    dispatch({ type: 'SET_AGENTS', payload: sampleAgents });
    dispatch({ type: 'SET_CONVERSATIONS', payload: sampleConversations });
  }, [dispatch]);

  const handleAgentClick = (agentId: string) => {
    dispatch({ type: 'SET_ACTIVE_AGENT', payload: agentId });
  };

  const handleNewConversation = (agentId: string) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (agent) {
      createNewConversation(agentId, `New chat with ${agent.name}`);
    }
  };

  const handleStartNewChat = () => {
    // Clear active agent and messages to start fresh
    dispatch({ type: 'SET_ACTIVE_AGENT', payload: null });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
  };

  const primaryAgents = state.agents.filter(agent => agent.type === 'primary');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 h-[81px]" > 
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Agents & Conversations</h2>
          <button 
            onClick={handleStartNewChat}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Start New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Agents and Conversations */}
      <div className="flex-1 overflow-y-auto">
        {primaryAgents.map(agent => (
          <AgentSection
            key={agent.id}
            agent={agent}
            subAgents={getSubAgents(agent.id)}
            conversations={state.conversations
              .filter(conv => conv.agentId === agent.id)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            }
            isActive={state.activeAgentId === agent.id}
            onAgentClick={handleAgentClick}
            onNewConversation={handleNewConversation}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentSectionProps {
  agent: Agent;
  subAgents: Agent[];
  conversations: Conversation[];
  isActive: boolean;
  onAgentClick: (agentId: string) => void;
  onNewConversation: (agentId: string) => void;
}

function AgentSection({ agent, subAgents, conversations, isActive, onAgentClick, onNewConversation }: AgentSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="border-b border-gray-100">
      {/* Primary Agent */}
      <div
        className={`p-3 cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
        onClick={() => onAgentClick(agent.id)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{agent.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
              {subAgents.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">{agent.capabilities.join(', ')}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNewConversation(agent.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Agents */}
      {isExpanded && subAgents.length > 0 && (
        <div className="ml-6 border-l border-gray-200 pl-3">
          {subAgents.map(subAgent => (
            <div
              key={subAgent.id}
              className={`p-2 cursor-pointer hover:bg-gray-50 rounded ${isActive ? 'bg-blue-50' : ''}`}
              onClick={() => onAgentClick(subAgent.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="text-lg">{subAgent.avatar}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-gray-700 truncate">{subAgent.name}</h4>
                  <p className="text-xs text-gray-500">{subAgent.capabilities.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversations */}
      {conversations.length > 0 && (
        <div className="ml-6 border-l border-gray-200 pl-3 pb-2">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className="p-2 cursor-pointer hover:bg-gray-50 rounded flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-700 truncate">{conversation.title}</h4>
                <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                <p className="text-xs text-gray-400">
                  {conversation.timestamp.toLocaleTimeString()} • {conversation.messageCount} messages
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
