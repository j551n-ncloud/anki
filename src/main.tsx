import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Outlet, RouterProvider, createBrowserRouter, Link } from 'react-router-dom';
import Settings from './Settings.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppBar, Toolbar, Typography, Container, createTheme, ThemeProvider, IconButton, Avatar } from '@mui/material';
import OpenAIKeyContextProvider from './OpenAIKeyContext';
import Home from './Home.tsx';

// Create a custom theme with lighter black (dark grey) as the primary color
const theme = createTheme({
    palette: {
        primary: {
            main: '#333333', // Lighter black color (dark grey)
        },
    },
});

function Root() {
    return (
        <OpenAIKeyContextProvider>
            <ThemeProvider theme={theme}>
                <AppBar position="static">
                    <Toolbar>
                        {/* Clickable icon to navigate to Home */}
                        <IconButton component={Link} to="/" color="inherit">
                            <Avatar src="https://j551n.com/favicon.png?v=2" alt="App Icon" />
                        </IconButton>
                        <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
                            Anki Card Creator
                        </Typography>
                        <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component={Link} to="/settings" color="inherit">
                            Settings
                        </Typography>
                        {/* Link to j551n.com as "Homepage" */}
                        <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component="a" href="https://j551n.com" target="_blank" rel="noopener noreferrer" color="inherit">
                            My Homepage
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Container>
                    <Outlet />
                </Container>
            </ThemeProvider>
        </OpenAIKeyContextProvider>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "suggest",
                element: <App />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
);
