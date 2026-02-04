// index.js
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in the 'public' folder
app.use(express.static(path.join(process.cwd(), 'public')));

// For single-page app routing (optional, useful if you have multiple pages or JS routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
