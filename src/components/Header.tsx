import { Box, Button, IconButton, Typography } from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";

import React from "react";
import { User } from "firebase/auth";

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  toggleTheme,
  user,
  onLogout,
  onLogin,
}) => {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h1">
        Daily Hero - CrossFit Hero WODs, PR & Hyrox
      </Typography>
      <Box>
        <IconButton onClick={toggleTheme} color="inherit">
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        {user ? (
          <>
            <Typography variant="body2" sx={{ mx: 2, display: "inline" }}>
              {user.email}
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={onLogin}>
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Header;
