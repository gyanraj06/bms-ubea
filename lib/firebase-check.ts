/**
 * Firebase Configuration Check Utility
 * Run this to diagnose Firebase Phone Auth issues
 */

export function checkFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for missing values
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      if (key !== 'measurementId') { // measurementId is optional
        issues.push(`Missing ${key}`);
      } else {
        warnings.push(`Optional ${key} not set (Analytics won't work)`);
      }
    }
  });

  // Check auth domain format
  if (config.authDomain && !config.authDomain.includes('.firebaseapp.com')) {
    warnings.push('authDomain should end with .firebaseapp.com');
  }

  // Check if running on localhost
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    warnings.push('Running on localhost - ensure "localhost" is added to Firebase Authorized Domains');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    config: {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'MISSING',
      appId: config.appId ? `${config.appId.substring(0, 15)}...` : 'MISSING',
    },
    environment: {
      isLocalhost,
      origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    }
  };
}

export function logFirebaseCheck() {
  const check = checkFirebaseConfig();

  console.group('🔥 Firebase Configuration Check');

  if (check.isValid) {
    console.log('%c✅ Configuration Valid', 'color: green; font-weight: bold');
  } else {
    console.log('%c❌ Configuration Issues Found', 'color: red; font-weight: bold');
  }

  if (check.issues.length > 0) {
    console.group('🚨 Issues (Must Fix)');
    check.issues.forEach(issue => console.error(`- ${issue}`));
    console.groupEnd();
  }

  if (check.warnings.length > 0) {
    console.group('⚠️ Warnings (Check These)');
    check.warnings.forEach(warning => console.warn(`- ${warning}`));
    console.groupEnd();
  }

  console.group('📋 Configuration');
  console.table(check.config);
  console.groupEnd();

  console.group('🌍 Environment');
  console.table(check.environment);
  console.groupEnd();

  console.log(`
📚 Next Steps:
${check.issues.length > 0 ? `
1. Fix missing configuration in .env.local
2. Restart development server
` : ''}
${check.warnings.some(w => w.includes('localhost')) ? `
3. Add 'localhost' to Firebase Console > Authentication > Settings > Authorized Domains
4. Go to: https://console.firebase.google.com/project/${check.config.projectId || 'YOUR_PROJECT'}/authentication/settings
` : ''}
5. Enable Phone Authentication in Firebase Console
6. Configure reCAPTCHA (see FIREBASE_PHONE_AUTH_SETUP.md)
  `);

  console.groupEnd();

  return check;
}
