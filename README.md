# majro-project

Leaflens is now converted to a React website powered by Vite.

## Run Locally

```bash
npm install
npm run dev
```

## Build For Production

```bash
npm run build
npm run preview
```

## Live Website

- URL: `https://kushagra22singh.github.io/majro-project/`
- Deployment: automatic via GitHub Actions on every push to `main`

## Live ML Integration (Backend + Frontend)

GitHub Pages is static hosting, so your Flask ML API must be hosted separately.

1. Deploy backend (`api.py`) on a Python host (Render is pre-configured with `render.yaml`).
2. Ensure backend has the model file: `plant-disease-model-complete (1).pth`.
3. Set GitHub repository variable: `VITE_API_BASE_URL=https://<your-backend-domain>`.
4. Push to `main` so Pages rebuilds with the live API URL.

After this, disease prediction and soil analysis both call the live backend.

## Backend Endpoints Used by Frontend

- `POST /predict` for disease detection from uploaded image
- `POST /analyze-soil` for soil insights
- `GET /health` for API health check

## Project Structure

- `index.html` - React mount point
- `src/main.jsx` - app bootstrap
- `src/App.jsx` - main UI and interactions
- `styles.css` - global styling
