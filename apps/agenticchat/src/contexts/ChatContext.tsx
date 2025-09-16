'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  type: 'primary' | 'sub-agent';
  parentId?: string;
  capabilities: string[];
  resources: Resource[];
  isActive: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: 'excel' | 'database' | 'api' | 'file' | 'permission';
  icon: string;
  description: string;
  permissions: string[];
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentId: string;
}

interface ChatState {
  agents: Agent[];
  conversations: Conversation[];
  activeConversationId: string | null;
  activeAgentId: string | null;
  messages: Message[];
  isLoading: boolean;
}

type ChatAction =
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_ACTIVE_AGENT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation };

const initialState: ChatState = {
  agents: [],
  conversations: [],
  activeConversationId: null,
  activeAgentId: null,
  messages: [],
  isLoading: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    
    case 'SET_ACTIVE_AGENT':
      return { ...state, activeAgentId: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id,
      };
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        ),
      };
    
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  getActiveAgent: () => Agent | null;
  getActiveConversation: () => Conversation | null;
  getSubAgents: (parentId: string) => Agent[];
  getAgentResources: (agentId: string) => Resource[];
  createNewConversation: (agentId: string, title: string) => void;
  sendMessage: (content: string) => void;
  createAgentFromPrompt: (prompt: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const getActiveAgent = (): Agent | null => {
    if (!state.activeAgentId) return null;
    return state.agents.find(agent => agent.id === state.activeAgentId) || null;
  };

  const getActiveConversation = (): Conversation | null => {
    if (!state.activeConversationId) return null;
    return state.conversations.find(conv => conv.id === state.activeConversationId) || null;
  };

  const getSubAgents = (parentId: string): Agent[] => {
    return state.agents.filter(agent => agent.parentId === parentId);
  };

  const getAgentResources = (agentId: string): Resource[] => {
    const agent = state.agents.find(a => a.id === agentId);
    return agent?.resources || [];
  };

  const createNewConversation = (agentId: string, title: string) => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      agentId: agentId,
      title: title,
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0,
    };
    
    dispatch({ type: 'CREATE_CONVERSATION', payload: newConversation });
    dispatch({ type: 'SET_ACTIVE_AGENT', payload: agentId });
  };

  const createAgentFromPrompt = (prompt: string) => {
    // Add user message first
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: prompt,
      role: 'user',
      timestamp: new Date(),
      agentId: 'system',
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate AI analysis and agent creation
    setTimeout(() => {
      // Create a unique timestamp for this agent group
      const timestamp = Date.now();
      
      // Create a main task agent based on the prompt
      const mainAgent: Agent = {
        id: `agent_${timestamp}`,
        name: `Task Coordinator ${Math.floor(timestamp / 1000) % 100}`,
        avatar: '🎯',
        type: 'primary',
        capabilities: ['Task Coordination', 'Agent Management', 'Workflow Planning'],
        resources: [
          {
            id: `coord_${timestamp}`,
            name: 'Task Management System',
            type: 'api',
            icon: '⚙️',
            description: 'Central task coordination system',
            permissions: ['read', 'write'],
          },
        ],
        isActive: true,
      };

      // Create sub-agents based on prompt analysis
      const subAgents: Agent[] = [];

      // Always create at least one sub-agent for testing
      subAgents.push({
        id: `agent_${timestamp + 1}`,
        name: 'Data Analyst',
        avatar: '📊',
        type: 'sub-agent',
        parentId: mainAgent.id,
        capabilities: ['Data Analysis', 'Statistical Modeling', 'Data Visualization'],
        resources: [
          {
            id: `data_${timestamp}_1`,
            name: 'Analytics Database',
            type: 'database',
            icon: '🗄️',
            description: 'Main analytics database',
            permissions: ['read'],
          },
          {
            id: `data_${timestamp}_2`,
            name: 'Python Analysis Tools',
            type: 'api',
            icon: '🐍',
            description: 'Python-based analysis libraries',
            permissions: ['read', 'write'],
          },
        ],
        isActive: false,
      });

      // Analyze prompt and create appropriate agents
      if (prompt.toLowerCase().includes('data') || prompt.toLowerCase().includes('analyze')) {
        // Data Analyst already created above
      }

      // Always create a second sub-agent for testing
      subAgents.push({
        id: `agent_${timestamp + 2}`,
        name: 'Report Generator',
        avatar: '📈',
        type: 'sub-agent',
        parentId: mainAgent.id,
        capabilities: ['Report Generation', 'Document Creation', 'Visualization'],
        resources: [
          {
            id: `report_${timestamp}_1`,
            name: 'Report Templates',
            type: 'file',
            icon: '📄',
            description: 'Pre-built report templates',
            permissions: ['read'],
          },
          {
            id: `report_${timestamp}_2`,
            name: 'Charting Tools',
            type: 'api',
            icon: '📊',
            description: 'Advanced charting and visualization tools',
            permissions: ['read', 'write'],
          },
        ],
        isActive: false,
      });

      if (prompt.toLowerCase().includes('report') || prompt.toLowerCase().includes('create')) {
        // Report Generator already created above
      }

      if (prompt.toLowerCase().includes('excel') || prompt.toLowerCase().includes('spreadsheet')) {
        subAgents.push({
          id: `agent_${timestamp + 3}`,
          name: 'Excel Processor',
          avatar: '📋',
          type: 'sub-agent',
          parentId: mainAgent.id,
          capabilities: ['Excel Processing', 'Data Manipulation', 'Formula Generation'],
          resources: [
            {
              id: `excel_${timestamp}_1`,
              name: 'Excel Files',
              type: 'excel',
              icon: '📊',
              description: 'Excel spreadsheet files',
              permissions: ['read', 'write'],
            },
          ],
          isActive: false,
        });
      }

      // Add more agent types based on different keywords
      if (prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('communication')) {
        subAgents.push({
          id: `agent_${timestamp + 4}`,
          name: 'Communication Manager',
          avatar: '📧',
          type: 'sub-agent',
          parentId: mainAgent.id,
          capabilities: ['Email Management', 'Communication', 'Notification System'],
          resources: [
            {
              id: `comm_${timestamp}_1`,
              name: 'Email System',
              type: 'api',
              icon: '📧',
              description: 'Email sending and management system',
              permissions: ['read', 'write'],
            },
            {
              id: `comm_${timestamp}_2`,
              name: 'Notification Center',
              type: 'api',
              icon: '🔔',
              description: 'Push notification system',
              permissions: ['read', 'write'],
            },
          ],
          isActive: false,
        });
      }

      if (prompt.toLowerCase().includes('web') || prompt.toLowerCase().includes('website') || prompt.toLowerCase().includes('frontend')) {
        subAgents.push({
          id: `agent_${timestamp + 5}`,
          name: 'Web Developer',
          avatar: '🌐',
          type: 'sub-agent',
          parentId: mainAgent.id,
          capabilities: ['Web Development', 'Frontend', 'UI/UX'],
          resources: [
            {
              id: `web_${timestamp}_1`,
              name: 'React Framework',
              type: 'api',
              icon: '⚛️',
              description: 'React development framework',
              permissions: ['read', 'write'],
            },
            {
              id: `web_${timestamp}_2`,
              name: 'CSS Framework',
              type: 'file',
              icon: '🎨',
              description: 'Tailwind CSS framework',
              permissions: ['read', 'write'],
            },
          ],
          isActive: false,
        });
      }

      // Add all agents to the state
      const allAgents = [mainAgent, ...subAgents];
      dispatch({ type: 'SET_AGENTS', payload: [...state.agents, ...allAgents] });
      dispatch({ type: 'SET_ACTIVE_AGENT', payload: mainAgent.id });

      // Create initial conversation and add user message first
      const userMessage: Message = {
        id: `msg_${timestamp}`,
        content: prompt,
        role: 'user',
        timestamp: new Date(),
        agentId: mainAgent.id,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      const newConversation: Conversation = {
        id: `conv_${timestamp}`,
        agentId: mainAgent.id,
        title: `Task: ${prompt.substring(0, 30)}...`,
        lastMessage: prompt,
        timestamp: new Date(),
        messageCount: 1,
      };
      dispatch({ type: 'CREATE_CONVERSATION', payload: newConversation });

      // Add AI response
      const aiMessage: Message = {
        id: `msg_${timestamp + 10}`,
        content: `I've analyzed your request and created a team of specialized agents to help you accomplish this task:

**Main Agent: ${mainAgent.name}** 🎯
- Coordinates the overall workflow
- Manages task distribution
- Monitors progress

**Specialized Agents Created:**
${subAgents.map(agent => `- **${agent.name}** ${agent.avatar}: ${agent.capabilities.join(', ')}`).join('\n')}

**Resources & Permissions Assigned:**
${subAgents.map(agent => 
  `- **${agent.name}**: ${agent.resources.map(r => `${r.name} (${r.permissions.join(', ')})`).join(', ')}`
).join('\n')}

Each agent has been equipped with the necessary tools and permissions. You can now interact with any of these agents to get started with your task.`,
        role: 'assistant',
        timestamp: new Date(),
        agentId: mainAgent.id,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 2000);
  };

  const sendMessage = (content: string) => {
    if (!state.activeAgentId) return;

    // Create conversation if none exists
    if (!state.activeConversationId) {
      const agent = state.agents.find(a => a.id === state.activeAgentId);
      if (agent) {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          agentId: state.activeAgentId,
          title: `Chat with ${agent.name}`,
          lastMessage: '',
          timestamp: new Date(),
          messageCount: 0,
        };
        dispatch({ type: 'CREATE_CONVERSATION', payload: newConversation });
      }
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      agentId: state.activeAgentId,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: `I received your message: "${content}". This is a simulated response from the AI agent.`,
        role: 'assistant',
        timestamp: new Date(),
        agentId: state.activeAgentId || '',
      };

      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      dispatch({ type: 'SET_LOADING', payload: false });

      // Update conversation
      const activeConv = getActiveConversation();
      if (activeConv) {
        const updatedConv: Conversation = {
          ...activeConv,
          lastMessage: content,
          timestamp: new Date(),
          messageCount: activeConv.messageCount + 1,
        };
        dispatch({ type: 'UPDATE_CONVERSATION', payload: updatedConv });
      }
    }, 1000);
  };

  const value: ChatContextType = {
    state,
    dispatch,
    getActiveAgent,
    getActiveConversation,
    getSubAgents,
    getAgentResources,
    createNewConversation,
    sendMessage,
    createAgentFromPrompt,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
