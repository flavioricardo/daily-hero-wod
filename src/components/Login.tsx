import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import React from "react";

// Official multicolor Google "G" (Sign-In branding guidelines require it
// unmodified on sign-in buttons, so it is not taken from an icon library).
const GoogleIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export default function Login() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      alert("Google login failed: " + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="30vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          textAlign: "center",
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Welcome, {user.email}!
        </Typography>
        <Button variant="contained" color="secondary" onClick={logout}>
          Sign Out
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Sign In
      </Typography>
      <TextField
        fullWidth
        label="Email"
        type="email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Box mt={2}>
        <Button variant="contained" color="primary" fullWidth onClick={login}>
          Sign In
        </Button>
      </Box>
      <Box mt={2}>
        <Button
          startIcon={<GoogleIcon />}
          variant="outlined"
          color="primary"
          fullWidth
          onClick={loginWithGoogle}
        >
          Sign in with Google
        </Button>
      </Box>
    </Paper>
  );
}
