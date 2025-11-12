# Private Chat App - Frontend

A beautiful, feature-rich React frontend for a private messaging application designed for couples. Built with React, Tailwind CSS, Framer Motion, and Socket.io.

## Features

### Core Messaging
- 💬 Real-time chat with Socket.io
- 📸 Photo, video, and voice message sharing
- ❤️ Message reactions
- 👀 Read receipts & typing indicators
- ⏰ Scheduled messages
- 🗑️ Disappearing messages (auto-delete after reading)

### Cute Love Features
- 💕 Love Meter (daily compatibility score)
- 🔥 Streak counter for consecutive days chatting
- 💖 Floating hearts animation on love keywords
- 🖼️ Shared photo album
- 💭 Daily question prompts
- 😊 Mood status with emojis
- 🎨 Multiple romantic themes (pink, purple, blue, dark)

### Privacy & Security
- 🔒 Passcode lock
- 👆 Biometric authentication support
- 🕵️ Incognito mode (calculator disguise)
- 🚪 Quick exit button
- 📸 Screenshot detection alerts
- ⏱️ Auto-logout on inactivity

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP requests
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Emoji Picker React** - Emoji selection
- **React Icons** - Icon library
- **date-fns** - Date formatting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will run on `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
│   ├── heart.svg       # App icon
│   └── manifest.json   # PWA manifest
├── src/
│   ├── components/     # Reusable components
│   │   ├── FloatingHearts.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── PasscodeLock.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/        # React contexts
│   │   ├── AuthContext.jsx
│   │   ├── SocketContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Key Components

### Auth Pages
- **Login** - User login with cute animations
- **Register** - New user registration

### Main Pages
- **Home** - User search and recent chats
- **Chat** - Real-time messaging interface
- **Profile** - Settings, themes, and privacy controls

### Special Features
- **FloatingHearts** - Animated hearts on love keywords
- **PasscodeLock** - Secure app entry
- **LoadingScreen** - Beautiful loading animation

## Contexts

### AuthContext
Manages user authentication state, login, register, and logout functions.

### SocketContext
Handles Socket.io connection and real-time events.

### ThemeContext
Manages app theme (pink, purple, blue, dark) and color schemes.

## Customization

### Themes
Edit `frontend/src/context/ThemeContext.jsx` to add or modify themes:

```javascript
const themes = {
  yourTheme: {
    primary: 'from-color-400 to-color-600',
    secondary: 'from-color-300 to-color-500',
    accent: 'bg-color-500',
    bg: 'from-color-50 via-color-100 to-color-200'
  }
};
```

### Colors
Modify `tailwind.config.js` to change the color palette.

### Animations
Adjust animation timings in `tailwind.config.js` under the `animation` and `keyframes` sections.

## PWA Support

This app is configured as a Progressive Web App (PWA) using Vite PWA plugin. Users can install it on their devices for a native app-like experience.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization with Sharp (backend)
- Lazy loading for heavy components
- Memoization for expensive computations
- Efficient WebSocket event handling

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Cloudflare Pages
Connect your GitHub repo and Cloudflare Pages will auto-deploy on push.

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

# US_frontend
