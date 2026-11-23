import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Linking } from 'react-native';
import { ChevronRight, ChevronDown, Mail, Phone, MessageCircle, CircleHelp as HelpCircle, Shield, Wallet, Bell, Bug, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatBot } from '../components/help/chatbot';
import { BugReport } from '../components/help/BugReport';

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

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);

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
      answer: "To reset your PIN, go to Settings > Security > Reset PIN. You'll need to verify your identity through your registered email address."
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
      icon: <Shield size={18} color="#FFD700" />,
      description: 'PIN reset, security settings, and account protection'
    },
    {
      id: '2',
      title: 'Payments & Transfers',
      icon: <Wallet size={18} color="#4D9FFF" />,
      description: 'Transaction issues, payment methods, and limits'
    },
    {
      id: '3',
      title: 'Notifications',
      icon: <Bell size={18} color="#10B981" />,
      description: 'Push notifications, email alerts, and preferences'
    }
  ];

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@deltacoin.edu.bd');
  };

  const handlePhoneSupport = () => {
    Linking.openURL('tel:+880123456789');
  };

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Help & Support" />

      <View style={styles.contactSection}>
        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handleEmailSupport}
        >
          <Mail size={18} color="#FFD700" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={handlePhoneSupport}
        >
          <Phone size={18} color="#4D9FFF" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={() => setShowChat(true)}
        >
          <MessageCircle size={18} color="#10B981" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactButton, isDark && styles.contactButtonDark]}
          onPress={() => setShowBugReport(true)}
        >
          <Bug size={18} color="#FF4D4F" />
          <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Report</Text>
        </TouchableOpacity>
      </View>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
      {showBugReport && <BugReport onClose={() => setShowBugReport(false)} />}

      

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Frequently Asked Questions
        </Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <Animated.View
              key={faq.id}
              entering={FadeInDown.duration(200)}
            >
              <TouchableOpacity
                style={[styles.faqItem, isDark && styles.faqItemDark]}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandedFaq === faq.id }}
                onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <View style={styles.faqHeader}>
                  <HelpCircle size={16} color="#FFD700" />
                  <Text style={[styles.faqQuestion, isDark && styles.faqQuestionDark]}>
                    {faq.question}
                  </Text>
                  <ChevronDown size={16} color={isDark ? '#AAAAAA' : '#606875'} style={{ transform: [{ rotate: expandedFaq === faq.id ? '180deg' : '0deg' }] }} />
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
  contactSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 22,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 58,
    paddingVertical: 10,
    paddingHorizontal: 3,
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
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  contactTextDark: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
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
    padding: 13,
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
    fontSize: 14,
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
    padding: 13,
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
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2C2C2C',
  },
  faqQuestionDark: {
    color: '#FFFFFF',
  },
  faqAnswer: {
    marginTop: 12,
    marginLeft: 28,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B6B6B',
    lineHeight: 20,
  },
  faqAnswerDark: {
    color: '#A6A6A6',
  },
});