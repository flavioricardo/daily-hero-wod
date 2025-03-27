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
import { Google as GoogleIcon } from "@mui/icons-material";
import React from "react";

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
