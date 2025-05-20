import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, TextInput, Linking } from 'react-native';
import { ChevronRight, Mail, Phone, MessageCircle, CircleHelp as HelpCircle, Shield, Wallet, Bell, Settings, Bug, Send } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface SupportCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I'm your DeltaCoin assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add money to my account?',
      answer: 'You can add money to your account through the Top-Up section in Transactions. We support bank transfers, credit/debit cards, and mobile banking options.'
    },
    {
      id: '2',
      question: 'What should I do if a payment fails?',
      answer: 'If a payment fails, first check your balance and internet connection. If the issue persists, you can find the failed transaction in your history and try again or contact support.'
    },
    {
      id: '3',
      question: 'How do I reset my PIN?',
      answer: 'To reset your PIN, go to Settings > Security > Reset PIN. You'll need to verify your identity through your registered email address.'
    },
    {
      id: '4',
      question: 'Is my money safe?',
      answer: 'Yes! We use industry-standard encryption and security measures to protect your money and personal information. All transactions are secured and monitored 24/7.'
    }
  ];

  const categories: SupportCategory[] = [
    {
      id: '1',
      title: 'Account Security',
      icon: <Shield size={24} color="#FFD700" />,
      description: 'PIN reset, security settings, and account protection'
    },
    {
      id: '2',
      title: 'Payments & Transfers',
      icon: <Wallet size={24} color="#4D9FFF" />,
      description: 'Transaction issues, payment methods, and limits'
    },
    {
      id: '3',
      title: 'Notifications',
      icon: <Bell size={24} color="#10B981" />,
      description: 'Push notifications, email alerts, and preferences'
    },
    {
      id: '4',
      title: 'App Settings',
      icon: <Settings size={24} color="#A78BFA" />,
      description: 'App configuration, display, and accessibility'
    }
  ];

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@deltacoin.edu.bd');
  };

  const handlePhoneSupport = () => {
    Linking.openURL('tel:+880123456789');
  };

  const handleChatSupport = () => {
    setShowChat(true);
    setShowBugReport(false);
  };

  const handleBugReport = () => {
    setShowBugReport(true);
    setShowChat(false);
  };

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
        text: `I understand you're asking about "${chatInput}". Let me help you with that. [AI response simulation]`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSubmitBugReport = () => {
    if (!bugDescription.trim()) return;
    // Here you would typically send the bug report to your backend
    alert('Thank you for reporting this issue. Our team will investigate it.');
    setBugDescription('');
    setShowBugReport(false);
  };

  const renderChat = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      style={[styles.chatContainer, isDark && styles.chatContainerDark]}
    >
      <View style={styles.chatHeader}>
        <Text style={[styles.chatTitle, isDark && styles.chatTitleDark]}>AI Support Chat</Text>
        <TouchableOpacity onPress={() => setShowChat(false)}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatMessages}>
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

  const renderBugReport = () => (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      style={[styles.bugReportContainer, isDark && styles.bugReportContainerDark]}
    >
      <View style={styles.bugReportHeader}>
        <Text style={[styles.bugReportTitle, isDark && styles.bugReportTitleDark]}>Report an Issue</Text>
        <TouchableOpacity onPress={() => setShowBugReport(false)}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.bugReportInput, isDark && styles.bugReportInputDark]}
        value={bugDescription}
        onChangeText={setBugDescription}
        placeholder="Describe the issue you're experiencing..."
        placeholderTextColor={isDark ? '#A6A6A6' : '#6B6B6B'}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, !bugDescription.trim() && styles.submitButtonDisabled]}
        onPress={handleSubmitBugReport}
        disabled={!bugDescription.trim()}
      >
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Help & Support</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          How can we help you today?
        </Text>
      </View>

      <View style={styles.contactSection}>
        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handleEmailSupport}
        >
          <Mail size={24} color="#FFD700" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handlePhoneSupport}
        >
          <Phone size={24} color="#4D9FFF" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handleChatSupport}
        >
          <MessageCircle size={24} color="#10B981" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handleBugReport}
        >
          <Bug size={24} color="#FF4D4F" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Report</Text>
        </TouchableOpacity>
      </View>

      {showChat && renderChat()}
      {showBugReport && renderBugReport()}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Support Categories
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
              style={[styles.categoryCard, isDark && styles.categoryCardDark]}
            >
              {category.icon}
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryTitle, isDark && styles.categoryTitleDark]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryDescription, isDark && styles.categoryDescriptionDark]}>
                  {category.description}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#A6A6A6' : '#6B6B6B'} />
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Frequently Asked Questions
        </Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <Animated.View
              key={faq.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
            >
              <TouchableOpacity
                style={[styles.faqItem, isDark && styles.faqItemDark]}
                onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <View style={styles.faqHeader}>
                  <HelpCircle size={20} color="#FFD700" />
                  <Text style={[styles.faqQuestion, isDark && styles.faqQuestionDark]}>
                    {faq.question}
                  </Text>
                </View>
                {expandedFaq === faq.id && (
                  <Text style={[styles.faqAnswer, isDark && styles.faqAnswerDark]}>
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  subtitleDark: {
    color: '#A6A6A6',
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  contactText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  contactTextDark: {
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardDark: {
    backgroundColor: '#1E1E1E',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  categoryTitleDark: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
  },
  categoryDescriptionDark: {
    color: '#A6A6A6',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItemDark: {
    backgroundColor: '#1E1E1E',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  faqQuestionDark: {
    color: '#FFFFFF',
  },
  faqAnswer: {
    marginTop: 12,
    marginLeft: 32,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    lineHeight: 20,
  },
  faqAnswerDark: {
    color: '#A6A6A6',
  },
  chatContainer: {
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
  chatContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  chatTitleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    color: '#4D9FFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  chatMessages: {
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
  bugReportContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bugReportContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  bugReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bugReportTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  bugReportTitleDark: {
    color: '#FFFFFF',
  },
  bugReportInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  bugReportInputDark: {
    backgroundColor: '#2E2E2E',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4D9FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});