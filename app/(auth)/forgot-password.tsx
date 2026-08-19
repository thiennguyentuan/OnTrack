import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter as useExpoRouter } from 'expo-router';
import { useState } from 'react';
import { requestPasswordReset } from '@/features/auth/api';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useExpoRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setRequestError('');
    try {
      await requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to request a password reset.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="track-changes" size={28} color={colors.primary} />
          <Text style={styles.logoText}>OnTrack</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtnHeader} onPress={() => router.back()}>
           <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {isSuccess ? (
            <View style={styles.successContainer}>
               <MaterialIcons name="check-circle" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
               <Text style={styles.successText}>Reset link sent to your email!</Text>
               <Button
                  title="Back to Login"
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.submitBtn}
                />
            </View>
          ) : (
            <>
              <View style={styles.inputGap}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="EMAIL ADDRESS"
                      placeholder="name@university.edu"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.email?.message}
                    />
                  )}
                />
              </View>

              <Button
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.submitBtn}
                icon={<MaterialIcons name="mail-outline" size={20} color={colors.surface} />}
                iconPosition="right"
              />
              {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  backBtnHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  welcomeHeader: {
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGap: {
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  successText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#BA1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
});
