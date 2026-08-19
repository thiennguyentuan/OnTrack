import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { confirmPasswordReset } from '@/features/auth/api';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!token) return setMessage('The password reset link is invalid.');
    if (password.length < 8) return setMessage('Password must contain at least 8 characters.');
    if (password !== confirmation) return setMessage('Passwords do not match.');
    setLoading(true); setMessage('');
    try { await confirmPasswordReset(token, password); setMessage('Password updated. You can now sign in.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to reset password.'); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Choose a new password</Text><Text style={styles.subtitle}>Use at least 8 characters.</Text>
    <Input label="NEW PASSWORD" placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} />
    <Input label="CONFIRM PASSWORD" placeholder="Confirm password" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
    <Button title="Update Password" onPress={submit} loading={loading} style={styles.button} />
    <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} style={styles.button} />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container:{flex:1,backgroundColor:'#F9F9F9'}, content:{padding:24,gap:16}, title:{fontSize:28,fontWeight:'bold',color:colors.text,marginTop:32}, subtitle:{color:colors.muted,marginBottom:16}, message:{color:colors.text,textAlign:'center'}, button:{marginTop:8} });
