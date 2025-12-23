import { ConnectError } from '@connectrpc/connect';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme-color';
import { useLogin } from '@/lib/hooks/use-auth';

export default function LoginScreen() {
    const colors = useColors();
    const loginMutation = useLogin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter email and password');
            return;
        }

        loginMutation.mutate(
            { email: email.trim(), password },
            {
                onError: (err) => {
                    if (err instanceof ConnectError) {
                        setError(err.message);
                    } else if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An error occurred. Please try again.');
                    }
                },
            }
        );
    };

    const styles = createStyles(colors);
    const isLoading = loginMutation.isPending;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>Echo</Text>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={colors.mutedForeground}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={colors.mutedForeground}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.primaryForeground} />
                            ) : (
                                <Text style={styles.buttonText}>Sign in</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href={'/register' as any} asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Sign up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardView: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: Spacing.lg,
        },
        header: {
            alignItems: 'center',
            marginBottom: Spacing.xl,
        },
        logo: {
            fontSize: 32,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: Spacing.md,
        },
        title: {
            fontSize: 28,
            fontWeight: '600',
            color: colors.text,
            marginBottom: Spacing.xs,
        },
        subtitle: {
            fontSize: 16,
            color: colors.mutedForeground,
        },
        form: {
            gap: Spacing.md,
        },
        inputContainer: {
            gap: Spacing.xs,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
        },
        input: {
            height: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.md,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.card,
        },
        button: {
            height: 48,
            backgroundColor: colors.primary,
            borderRadius: Radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: Spacing.sm,
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.primaryForeground,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: Spacing.xl,
        },
        footerText: {
            fontSize: 14,
            color: colors.mutedForeground,
        },
        link: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.primary,
        },
        errorContainer: {
            backgroundColor: colors.destructive + '20',
            borderRadius: Radius.sm,
            padding: Spacing.md,
        },
        errorText: {
            color: colors.destructive,
            fontSize: 14,
            textAlign: 'center',
        },
    });
