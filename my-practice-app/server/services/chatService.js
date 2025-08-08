
const Document = require('../models/Document');

class ChatService {
  constructor() {
    this.documents = [];
    this.documentsLoaded = false;
  }

  // Load all documents from database
  async loadDocuments() {
    try {
      console.log('📚 Loading documents for search...');
      
      // Get all active documents from database
      const documents = await Document.find({ status: 'active' });
      
      this.documents = documents;
      this.documentsLoaded = true;
      
      console.log(`✅ Loaded ${documents.length} documents successfully!`);
      return true;
      
    } catch (error) {
      console.error('❌ Error loading documents:', error.message);
      return false;
    }
  }

  // Search documents for relevant information
  async searchDocuments(userQuery) {
    try {
      if (!this.documentsLoaded) {
        console.log('📖 Documents not loaded, loading now...');
        await this.loadDocuments();
      }

      const searchQuery = userQuery.toLowerCase();
      const results = [];

      // Simple search through each document
      for (let i = 0; i < this.documents.length; i++) {
        const doc = this.documents[i];
        
        // Create searchable text (title + content + tags)
        const searchableText = `${doc.title} ${doc.extractedText} ${doc.tags.join(' ')}`.toLowerCase();
        
        // Check if our query words appear in this document
        const queryWords = searchQuery.split(' ');
        let matchCount = 0;
        
        for (let word of queryWords) {
          if (word.length > 2 && searchableText.includes(word)) {
            matchCount++;
          }
        }
        
        // If we found matches, add to results
        if (matchCount > 0) {
          const relevance = matchCount / queryWords.length;
          
          results.push({
            document: doc,
            relevance: relevance,
            title: doc.title,
            documentType: doc.documentType,
            excerpt: this.extractExcerpt(doc.extractedText, searchQuery),
            tags: doc.tags,
            uploadDate: doc.uploadDate
          });
        }
      }

      // Sort by relevance (best matches first)
      results.sort((a, b) => b.relevance - a.relevance);
      
      console.log(`🔍 Found ${results.length} relevant documents`);
      return results.slice(0, 5); // Return top 5 results
      
    } catch (error) {
      console.error('❌ Search error:', error.message);
      return [];
    }
  }

  // Extract a relevant snippet from the document
  extractExcerpt(text, query, maxLength = 200) {
    if (!text) return 'No content available';
    
    const queryWords = query.toLowerCase().split(' ');
    const sentences = text.split('.');
    
    // Find the sentence that contains most query words
    let bestSentence = sentences[0] || 'No content available';
    let maxMatches = 0;
    
    for (let sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      let matches = 0;
      
      for (let word of queryWords) {
        if (word.length > 2 && lowerSentence.includes(word)) {
          matches++;
        }
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence;
      }
    }
    
    // Trim to max length
    if (bestSentence.length > maxLength) {
      return bestSentence.substring(0, maxLength).trim() + '...';
    }
    
    return bestSentence.trim();
  }

  // Handle a user query and generate response
  async handleQuery(userQuery) {
    try {
      console.log(`💭 Processing query: "${userQuery}"`);
      
      // Check if query is too short
      if (userQuery.length < 3) {
        return {
          type: 'invalid',
          message: 'Please ask a more specific question (at least 3 characters).',
          suggestions: ['Try asking about DepEd policies', 'Ask about procedures']
        };
      }

      // Search for relevant documents
      const searchResults = await this.searchDocuments(userQuery);
      
      // Generate response based on results
      if (searchResults.length === 0) {
        return {
          type: 'no_results',
          message: "I couldn't find information about that in the DepEd documents. Try using different keywords or ask about policies, procedures, or guidelines.",
          suggestions: [
            'Try different keywords',
            'Ask about DepEd policies',
            'Ask about school procedures'
          ]
        };
      }

      // Create response with found information
      const topResult = searchResults[0];
      let response = `Based on the DepEd document "${topResult.title}", here's what I found:\n\n`;
      response += `${topResult.excerpt}\n\n`;
      
      if (searchResults.length > 1) {
        response += `I also found relevant information in ${searchResults.length - 1} other document(s):\n`;
        for (let i = 1; i < Math.min(searchResults.length, 3); i++) {
          response += `• ${searchResults[i].title}\n`;
        }
      }

      return {
        type: 'success',
        message: response,
        sources: searchResults,
        followUp: [
          'Can you tell me more about this?',
          'Are there any related policies?',
          'What are the requirements?'
        ]
      };
      
    } catch (error) {
      console.error('❌ Error handling query:', error.message);
      return {
        type: 'error',
        message: 'Something went wrong while processing your question. Please try again.',
        sources: []
      };
    }
  }
}

// Export a single instance
module.exports = new ChatService();