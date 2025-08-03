# Gemini AI Chat WebApp v2.0

A modern, feature-rich web application that integrates Google's Gemini AI for interactive chat conversations. Built with Node.js, Express, and vanilla JavaScript with a beautiful, responsive design.

## ✨ Features

### 🎨 **User Experience**
- **Dark Mode Toggle**: Switch between light and dark themes with smooth transitions
- **Message Actions**: Copy, regenerate, and manage AI responses
- **Conversation Export**: Export conversations as JSON files
- **Toast Notifications**: Beautiful feedback for user actions
- **Message Timestamps**: Track when messages were sent
- **Keyboard Shortcuts**: Power user shortcuts for efficiency
- **Mobile Responsive**: Optimized for all screen sizes

### 🤖 **AI Features**
- **Real-time AI Chat**: Interact with Google Gemini AI in real-time
- **Image Analysis**: Upload and analyze images with Gemini Pro Vision
- **Conversation History**: Maintains context across messages
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **Smart Formatting**: Markdown-like formatting support

### 🔧 **Advanced Features**
- **File Upload**: Drag & drop image upload with preview
- **Error Handling**: Graceful error handling and user feedback
- **Loading States**: Visual feedback during AI processing
- **Character Counter**: Track message length with visual feedback
- **Auto-resize Input**: Dynamic textarea that grows with content

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- A Google Gemini API key

### Setup Instructions

1. **Clone or download this project**
   ```bash
   cd gemini-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **Get your Gemini API key**
   
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key and paste it in your `.env` file

5. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🛠️ Project Structure

```
gemini-test/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file with new UI elements
│   ├── styles.css         # CSS with dark mode and responsive design
│   └── script.js          # Enhanced JavaScript with new features
├── server.js              # Express server with image analysis
├── package.json           # Updated dependencies and metadata
├── env.example            # Environment variables template
└── README.md             # This file
```

## 🎯 New Features in v2.0

### 🌙 **Dark Mode**
- Toggle between light and dark themes
- Persistent theme preference
- Smooth transitions and animations
- Optimized color schemes for both modes

### 📸 **Image Analysis**
- Upload images directly in the chat
- Analyze images with Gemini Pro Vision
- Support for multiple image formats
- Image preview and removal

### 💬 **Enhanced Chat Experience**
- Message actions (copy, regenerate)
- Conversation export functionality
- Message timestamps
- Better error handling and feedback

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + K`: Focus input
- `Ctrl/Cmd + L`: Toggle theme
- `Ctrl/Cmd + E`: Export conversation
- `Enter`: Send message
- `Shift + Enter`: New line

### 📱 **Mobile Optimizations**
- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized layout for mobile devices
- Better touch interactions

## 🔧 How It Works

### Backend (server.js)

The Express server handles:

- **Static file serving**: Serves the frontend files
- **API endpoints**: 
  - `/api/chat` - Handles text and image chat with Gemini
  - `/api/health` - Server health check with feature list
  - `/api/models` - Available AI models
- **Image Analysis**: Uses Gemini Pro Vision for image processing
- **Error handling**: Comprehensive error handling with user-friendly messages
- **CORS**: Cross-origin resource sharing enabled

### Frontend (public/)

The frontend provides:

- **Modern UI**: Clean, responsive design with dark mode
- **Real-time chat interface**: Enhanced chat UI with message actions
- **File upload**: Drag & drop image upload with preview
- **Toast notifications**: User feedback system
- **Keyboard shortcuts**: Power user features
- **Responsive design**: Works on all screen sizes

## 🎯 Key Integration Points

### 1. Gemini API Setup

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

### 2. Image Analysis

```javascript
const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      data: imageData,
      mimeType: image.type
    }
  }
]);
```

### 3. Dark Mode Implementation

```javascript
function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  // Apply theme-specific styles
}
```

## 🎨 Customization

### Styling

The app uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}
```

### Adding New Features

1. **Streaming Responses**: Implement real-time streaming of AI responses
2. **Voice Input**: Add speech-to-text capabilities
3. **Conversation Management**: Save/load conversations from local storage
4. **Advanced Export**: Export as PDF, Markdown, or other formats
5. **User Preferences**: Settings panel for customization

## 🔒 Security Considerations

- **API Key Protection**: Never commit your `.env` file to version control
- **Input Validation**: All user inputs are validated on both frontend and backend
- **XSS Prevention**: HTML content is properly escaped
- **File Upload Security**: Image files are validated and size-limited
- **Rate Limiting**: Consider adding rate limiting for production use

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
```env
GEMINI_API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
```

## 📚 Learning Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/generative-ai)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:

- Add support for voice input/output
- Implement streaming responses
- Add conversation folders and organization
- Create different AI personas
- Add collaborative features

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Make sure your `.env` file exists and contains `GEMINI_API_KEY`
   - Verify the API key is correct and active

2. **"Failed to get response from Gemini"**
   - Check your internet connection
   - Verify your API key has sufficient quota
   - Check the Google AI Studio console for any errors

3. **Image analysis not working**
   - Ensure you're using a valid image format (JPEG, PNG, etc.)
   - Check that the image size is under 10MB
   - Verify your API key supports image analysis

4. **Dark mode not working**
   - Clear browser cache and reload
   - Check browser console for JavaScript errors
   - Ensure localStorage is enabled

5. **Port already in use**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill`

### Getting Help

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the server console for Node.js errors
3. Verify your API key is working in the Google AI Studio
4. Ensure all dependencies are installed: `npm install`
5. Try clearing browser cache and reloading

## 🎉 What's New in v2.0

- ✨ **Dark Mode**: Complete theme system with smooth transitions
- 📸 **Image Analysis**: Upload and analyze images with AI
- 💬 **Message Actions**: Copy, regenerate, and manage responses
- 📤 **Export Conversations**: Save your chats as JSON files
- ⌨️ **Keyboard Shortcuts**: Power user efficiency features
- 📱 **Mobile Optimized**: Better touch interactions and responsive design
- 🔔 **Toast Notifications**: Beautiful user feedback system
- ⏰ **Message Timestamps**: Track when messages were sent
- 🎨 **Enhanced UI**: Modern design with better visual hierarchy

---

**Happy coding with Gemini AI! 🚀** 