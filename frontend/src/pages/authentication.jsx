import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {

    

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {

                let result = await handleLogin(username, password)


            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                {/* Background Image */}
                <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(/4.jpg)', // Ensure 4.jpg is inside public folder
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                    t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                />

                {/* Auth Box */}
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={10} square>
                <Box
                    sx={{
                    my: 8,
                    mx: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LockOutlinedIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {formState === 0 ? 'Sign In to Your Account' : 'Create a New Account'}
                    </Typography>

                    {/* Toggle Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                        variant={formState === 0 ? 'contained' : 'outlined'}
                        onClick={() => setFormState(0)}
                        sx={{ textTransform: 'none' }}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant={formState === 1 ? 'contained' : 'outlined'}
                        onClick={() => setFormState(1)}
                        sx={{ textTransform: 'none' }}
                    >
                        Sign Up
                    </Button>
                    </Box>

                    {/* Auth Form */}
                    <Box component="form" noValidate sx={{ mt: 1, width: '100%', maxWidth: 400 }}>
                    {formState === 1 && (
                        <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Full Name"
                        value={name}
                        autoFocus
                        onChange={(e) => setName(e.target.value)}
                        />
                    )}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        autoFocus={!formState}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                        </Typography>
                    )}

                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                        onClick={handleAuth}
                    >
                        {formState === 0 ? 'Login' : 'Register'}
                    </Button>
                    </Box>
                </Box>
                </Grid>
            </Grid>

            {/* Snackbar */}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </ThemeProvider>

    );
}