import { Card, CardActionArea, CardContent, Typography, Link, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Bookmarklet = () => {
  return (
    <Box sx={{ marginTop: 5 }}>
      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
        Bookmarklet
      </Typography>
      <Typography variant="body1" align="center" sx={{ marginTop: 2 }}>
        We offer a bookmarklet so you can quickly highlight some text in your browser and go directly to suggesting cards.
        Drag the following link to your bookmarks:
      </Typography>

      {/* Fixing the Link tag */}
      <Box sx={{ textAlign: 'center', marginTop: 2 }}>
        <Link
          href="javascript:window.location='https://anki.j551n.com/suggest?text='+window.getSelection().toString();"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 'bold' }}
        >
        </Link>
      </Box>

      {/* Add a "Get Started" button for consistency */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
      <Button
  variant="contained"
  sx={{ backgroundColor: 'white', color: 'black', borderRadius: 2 }}
  onClick={() => window.open('https://anki.j551n.com/suggest', '_blank')}
>
  Bookmark :D
</Button>
      </Box>
    </Box>
  );
};

function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" align="center" sx={{ marginTop: 5, fontWeight: 'bold' }}>
        Anki Card Creator is a tool that helps you create Anki cards quickly and easily using AI.
      </Typography>

      <Card sx={{ maxWidth: 345, borderRadius: 2, margin: 'auto', marginTop: 5, boxShadow: 3 }}>
        <CardActionArea onClick={() => navigate('/suggest')}>
          <CardContent>
            <Typography variant="h6" component="div" align="center">
              Suggest cards with AI
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Box sx={{ marginTop: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Installation Steps:
        </Typography>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body1">1. Have Anki installed on your local machine</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            2. Have the{' '}
            <Link href="https://ankiweb.net/shared/info/2055492159" target="_blank" rel="noopener noreferrer">
              AnkiConnect
            </Link>{' '}
            plugin installed in your local Anki
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            3. Set up Anki Connect to have CORS enabled for the route. Go to Tools → Add-ons → Select AnkiConnect → Click Config → Add
            "anki.j551n.com" to your webCorsOriginList
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            4. Create and add an API key to the Settings page
          </Typography>
        </Box>
      </Box>

      <Bookmarklet />

      <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
        Created By <strong>Johannes Nguyen</strong>
      </Typography>
    </Box>
  );
}

export default Home;
