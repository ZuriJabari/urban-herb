# UrbanHerb

A modern e-commerce platform for herbal and CBD products.

## Project Structure

- `UrbanHerbWeb/` - Frontend React + TypeScript application
- `urbanherbapi/` - Backend Django REST Framework API
- `UrbanHerbApp/` - Mobile application

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd urbanherbapi
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd UrbanHerbWeb
npm install
npm run dev
```

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Development integration branch
- Feature branches: Created for new features/fixes

### Development Process
1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your feature branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request to `develop`
   - Ensure CI checks pass (build and lint)
   - Merge when ready

5. For releases:
   - Create a PR from `develop` to `main`
   - Ensure CI checks pass
   - Merge to deploy to production

### Quality Checks
All branches require:
- Successful build
- Passing lint checks
- Up-to-date with target branch

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure all CI checks pass
4. Create a pull request
5. Merge after CI passes

## License

All rights reserved. 2024 UrbanHerb
