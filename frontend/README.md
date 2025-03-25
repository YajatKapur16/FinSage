# FinSage Frontend

This is the frontend for FinSage, a comprehensive financial management application that helps users track expenses, view analytics, and engage with a financial community.

## Features

- **User Authentication:** Secure login and registration with JWT
- **Dashboard:** Overview of financial statistics and trends
- **Expense Tracking:** Track, categorize, and analyze your expenses
- **Community Forum:** Connect with others, share financial tips and advice
- **Responsive Design:** Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running (see main project README)

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/FinSage.git
   cd FinSage/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment (optional):
   Create a `.env` file in the frontend directory with the following:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to access the application

## Connecting to the Backend

Ensure the backend server is running on http://localhost:8000 (default) or update the API_BASE_URL in `src/services/apiService.js` if your backend is running on a different URL.

## Available Routes

- `/` - Landing page
- `/auth` or `/login` - Login/Registration page
- `/dashboard` - User dashboard (protected route)
- `/expenses` - Expense tracker (protected route)
- `/forum` - Community forum (protected route)
- `/profile` - User profile (protected route)

## Tech Stack

- React
- Material UI
- React Router
- Axios for API calls
- Chart.js for data visualization
- Framer Motion for animations

## Build for Production

```
npm run build
```

This will create a production-ready build in the `build` folder.

## Troubleshooting

If you encounter any issues:

1. Ensure the backend API is running
2. Check your browser console for errors
3. Verify API URL in `src/services/apiService.js`
4. Clear browser cache and localStorage

## License

[Your License Information]

## Contact

[Your Contact Information]
