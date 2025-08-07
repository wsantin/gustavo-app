import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Alert, 
  Card, 
  CardContent, 
  Typography,
  CircularProgress
} from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

function FirebaseTest() {
  const [email, setEmail] = useState('gustavo@sullana.pe');
  const [password, setPassword] = useState('Gustavo25$26');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      console.log('🔥 Intentando login con:', { email, password: '***' });
      console.log('🔥 Auth object:', auth);
      console.log('🔥 DB object:', db);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login exitoso:', user);
      setResult(`✅ Login exitoso! Usuario: ${user.email} (${user.uid})`);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(`❌ Error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    if (!auth.currentUser) {
      setError('❌ Necesitas hacer login primero');
      return;
    }

    setLoading(true);
    try {
      const testCollection = collection(db, 'test');
      const docRef = await addDoc(testCollection, {
        message: 'Test desde React',
        timestamp: new Date(),
        user: auth.currentUser.uid
      });
      
      setResult(`✅ Firestore test exitoso! Doc ID: ${docRef.id}`);
    } catch (error) {
      console.error('❌ Error en Firestore:', error);
      setError(`❌ Firestore error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showConfig = () => {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '✅ OK' : '❌ Missing',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '❌ Missing',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '❌ Missing',
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '❌ Missing',
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '❌ Missing',
      appId: process.env.REACT_APP_FIREBASE_APP_ID ? '✅ OK' : '❌ Missing'
    };
    
    console.log('🔧 Firebase Config:', config);
    setResult(`🔧 Config: ${JSON.stringify(config, null, 2)}`);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔥 Firebase Test Console
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={testLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Test Login'}
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={testFirestore}
            disabled={loading}
          >
            Test Firestore
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={showConfig}
          >
            Show Config
          </Button>
        </Box>

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{result}</pre>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{error}</pre>
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary">
          Usuario actual: {auth.currentUser ? `${auth.currentUser.email} (${auth.currentUser.uid})` : 'No logueado'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FirebaseTest;