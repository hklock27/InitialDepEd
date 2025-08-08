const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const auth = require('../middleware/auth');

// This is like Door #1: "Hey, I have a question!"
router.post('/query', auth, async (req, res) => {
  try {
    console.log('🔔 Someone asked a question!');
    
    // Get the question from the user
    const { query } = req.body;
    
    // Check if they actually sent a question
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question!'
      });
    }

    console.log(`❓ Question: "${query}"`);
    
    // Ask our chatService to handle the question
    const response = await chatService.handleQuery(query);
    
    // Send back the answer
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error processing question:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oops! Something went wrong while processing your question.'
    });
  }
});

// This is like Door #2: "Give me some suggestions!"
router.get('/suggestions', auth, async (req, res) => {
  try {
    console.log('💡 Someone wants question suggestions!');
    
    // Provide some example questions users can ask
    const suggestions = [
      "What are the latest DepEd policies?",
      "Tell me about enrollment procedures",
      "What are the graduation requirements?",
      "How do I apply for teacher positions?",
      "What are the school calendar guidelines?",
      "Show me information about student assessment",
      "What are the curriculum standards?",
      "Tell me about special education programs"
    ];

    res.json({
      success: true,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error getting suggestions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not get suggestions right now.'
    });
  }
});

// This is like Door #3: "Show me chat history!" (not implemented yet)
router.get('/history', auth, async (req, res) => {
  try {
    console.log('📜 Someone wants their chat history!');
    
    // For now, we'll just return empty history
    // Later you could store chat history in database
    res.json({
      success: true,
      history: [],
      message: 'Chat history feature coming soon! 🚧'
    });

  } catch (error) {
    console.error('💥 Error getting history:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not get chat history right now.'
    });
  }
});

// This is like Door #4: "Reload documents!" (Admin only)
router.post('/reload-documents', auth, async (req, res) => {
  try {
    console.log('🔄 Admin wants to reload documents!');
    
    // Check if the person is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reload documents!'
      });
    }

    // Ask chatService to reload all documents
    const success = await chatService.loadDocuments();
    
    if (success) {
      res.json({
        success: true,
        message: 'Documents reloaded successfully! 🎉'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to reload documents 😞'
      });
    }

  } catch (error) {
    console.error('💥 Error reloading documents:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not reload documents right now.'
    });
  }
});

// Export the router so other files can use it
module.exports = router;