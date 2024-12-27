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

## Branch Protection

This repository enforces branch protection rules:

- All changes must go through pull requests
- Pull requests require one approval
- Status checks (build and lint) must pass
- Branch must be up to date before merging

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Create a pull request to `develop`
4. Ensure all checks pass
5. Get code review approval
6. Merge your changes

## License

All rights reserved. © 2024 UrbanHerb
