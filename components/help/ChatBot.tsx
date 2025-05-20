import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useColorScheme } from 'react-native';
import { Send } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBotProps {
  onClose: () => void;
}

export function ChatBot({ onClose }: ChatBotProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I'm your DeltaCoin assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(chatInput),
        sender: 'ai',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    // Simple response generation logic - can be enhanced with more sophisticated patterns
    const input = userInput.toLowerCase();
    
    if (input.includes('payment') || input.includes('transaction')) {
      return 'For payment related issues, please check your transaction history in the Transactions tab. If you need more help, you can contact our support team.';
    }
    
    if (input.includes('account') || input.includes('login')) {
      return 'For account related queries, please visit the Security section in Settings. You can manage your login credentials and security preferences there.';
    }
    
    if (input.includes('balance') || input.includes('money')) {
      return 'You can check your balance in the Home tab. For adding funds, use the Top-Up option in the Transactions section.';
    }

    return `I understand you're asking about "${userInput}". Let me help you with that. Please provide more details about your query.`;
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>AI Support Chat</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messages}>
        {chatMessages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessage : styles.aiMessage,
              isDark && (message.sender === 'user' ? styles.userMessageDark : styles.aiMessageDark)
            ]}
          >
            <Text style={[
              styles.messageText,
              isDark && styles.messageTextDark
            ]}>
              {message.text}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !chatInput.trim() && styles.sendButtonDisabled]} 
          onPress={handleSendMessage}
          disabled={!chatInput.trim()}
        >
          <Send size={20} color={chatInput.trim() ? '#FFFFFF' : '#A6A6A6'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    height: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    color: '#4D9FFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#4D9FFF',
    alignSelf: 'flex-end',
  },
  userMessageDark: {
    backgroundColor: '#82B1FF',
  },
  aiMessage: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  aiMessageDark: {
    backgroundColor: '#2E2E2E',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  messageTextDark: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  inputContainerDark: {
    borderTopColor: '#2E2E2E',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  inputDark: {
    backgroundColor: '#2E2E2E',
    color: '#FFFFFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4D9FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});