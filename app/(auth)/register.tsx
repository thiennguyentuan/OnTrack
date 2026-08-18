import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/features/auth/authService';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useRouter as useExpoRouter } from 'expo-router';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Email is invalid'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useExpoRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const session = await authService.signUp(data.email, data.password, data.name);
      setSession(session);
      router.replace('/(tabs)/today');
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Unable to register');
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
        {/* Welcome Message */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.title}>Join us</Text>
          <Text style={styles.subtitle}>Your journey to academic clarity starts here. Create your account.</Text>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          <View style={styles.inputGap}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="FULL NAME"
                  placeholder="Enter your full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          <View style={styles.inputGap}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="STUDENT EMAIL"
                  placeholder="example@university.edu"
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

          <View style={styles.inputGap}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PASSWORD"
                  placeholder="Min. 8 characters"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <View style={styles.inputGap}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="CONFIRM PASSWORD"
                  placeholder="Re-enter password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          <Button
            title="Register"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
            icon={<MaterialIcons name="arrow-forward" size={20} color={colors.surface} />}
            iconPosition="right"
          />
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
            <Text style={styles.backBtnText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR REGISTER WITH</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <AntDesign name="google" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="school" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Academic Quote Decoration */}
        <View style={styles.decoration}>
          <Text style={styles.quoteText}>"The secret of getting ahead is getting started."</Text>
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
  welcomeHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 0,
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGap: {
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  secondaryActions: {
    alignItems: 'center',
    marginTop: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.sizes.base,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.muted,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decoration: {
    marginTop: 32,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontStyle: 'italic',
  },
});
