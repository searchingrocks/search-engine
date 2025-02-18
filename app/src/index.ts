import { runMigrations } from './models/usersDB';
import app from './app';

(async () => {
  try {
    await runMigrations();
    // Now start the server after migrations are done
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
})();
