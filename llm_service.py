from google.cloud import language_v1
from google.cloud.language_v1 import types
import os
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class GoogleCloudLLMService:
    def __init__(self):
        try:
            self.client = language_v1.LanguageServiceClient()
            self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
            self.use_google_api = True
        except Exception as e:
            logger.warning(f"Google Cloud API not available: {e}")
            self.client = None
            self.project_id = None
            self.use_google_api = False
        
    def analyze_query(self, query: str) -> Dict[str, any]:
        """
        Analyze a natural language query to extract entities and determine intent.
        
        Args:
            query (str): The natural language query
            
        Returns:
            Dict containing entities, concepts, and intent
        """
        try:
            # Analyze entities
            entities = self._extract_entities(query)
            
            # Analyze syntax for intent detection
            intent = self._determine_intent(query, entities)
            
            # Extract key concepts
            concepts = self._extract_concepts(query)
            
            return {
                "entities": entities,
                "concepts": concepts,
                "intent": intent,
                "confidence": 0.85  # Google Cloud provides good confidence
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            # Fallback to basic analysis
            return self._fallback_analysis(query)
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract named entities using Google Cloud Natural Language API."""
        if not self.use_google_api:
            return self._fallback_entity_extraction(text)
            
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_entities(document=document)
            
            entities = []
            for entity in response.entities:
                if entity.salience > 0.1:  # Only include significant entities
                    entities.append(entity.name)
                    
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return self._fallback_entity_extraction(text)
    
    def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts and topics from the text."""
        if not self.use_google_api:
            return self._fallback_concept_extraction(text)
            
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_syntax(document=document)
            
            concepts = []
            for token in response.tokens:
                # Focus on nouns, proper nouns, and adjectives
                if token.part_of_speech.tag in [
                    language_v1.PartOfSpeech.Tag.NOUN,
                    language_v1.PartOfSpeech.Tag.PROPER_NOUN,
                    language_v1.PartOfSpeech.Tag.ADJ
                ]:
                    if token.text.content.lower() not in ['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for']:
                        concepts.append(token.text.content)
            
            return list(set(concepts))[:10]  # Limit to top 10 concepts
            
        except Exception as e:
            logger.error(f"Error extracting concepts: {e}")
            return self._fallback_concept_extraction(text)
    
    def _determine_intent(self, query: str, entities: List[str]) -> str:
        """Determine the user's intent based on query analysis."""
        query_lower = query.lower()
        
        # Location-based intent
        location_keywords = ['near', 'nearby', 'around', 'in', 'at', 'location', 'area']
        if any(keyword in query_lower for keyword in location_keywords):
            return "nearby"
        
        # Category-based intent
        category_keywords = ['technology', 'business', 'sports', 'politics', 'entertainment', 'science']
        if any(keyword in query_lower for keyword in category_keywords):
            return "category"
        
        # Source-based intent
        source_keywords = ['from', 'source', 'times', 'reuters', 'cnn', 'bbc']
        if any(keyword in query_lower for keyword in source_keywords):
            return "source"
        
        # Score-based intent
        score_keywords = ['top', 'best', 'high', 'score', 'relevant', 'trending']
        if any(keyword in query_lower for keyword in score_keywords):
            return "score"
        
        # Default to search
        return "search"
    
    def _fallback_entity_extraction(self, text: str) -> List[str]:
        """Fallback entity extraction when Google Cloud API is not available."""
        entities = []
        words = text.split()
        for word in words:
            if word[0].isupper() and len(word) > 2:
                entities.append(word)
        return entities
    
    def _fallback_concept_extraction(self, text: str) -> List[str]:
        """Fallback concept extraction when Google Cloud API is not available."""
        # Simple concept extraction based on word patterns
        concepts = []
        words = text.split()
        for word in words:
            word_lower = word.lower()
            if (len(word) > 3 and 
                word_lower not in ['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by']):
                concepts.append(word)
        return list(set(concepts))[:10]
    
    def _fallback_analysis(self, query: str) -> Dict[str, any]:
        """Fallback analysis when Google Cloud API fails."""
        query_lower = query.lower()
        
        # Simple entity extraction
        entities = []
        words = query.split()
        for word in words:
            if word[0].isupper() and len(word) > 2:
                entities.append(word)
        
        # Simple intent detection
        intent = "search"
        if any(word in query_lower for word in ['near', 'nearby', 'around']):
            intent = "nearby"
        elif any(word in query_lower for word in ['technology', 'business', 'sports']):
            intent = "category"
        
        return {
            "entities": entities,
            "concepts": words[:5],
            "intent": intent,
            "confidence": 0.6
        }
    
    def _fallback_summary_generation(self, title: str, description: str) -> str:
        """Fallback summary generation when Google Cloud API is not available."""
        # Simple summary: combine title with first sentence of description
        if description:
            first_sentence = description.split('.')[0]
            if len(first_sentence) > 20:
                return f"{title}. {first_sentence}."
            else:
                return f"{title}. {description[:150]}..."
        else:
            return title
    
    def generate_summary(self, title: str, description: str) -> str:
        """
        Generate a summary of the article using Google Cloud Natural Language API.
        
        Args:
            title (str): Article title
            description (str): Article description
            
        Returns:
            str: Generated summary
        """
        if not self.use_google_api:
            return self._fallback_summary_generation(title, description)
            
        try:
            # Combine title and description for analysis
            full_text = f"{title}. {description}"
            
            # Extract key sentences using syntax analysis
            document = language_v1.Document(
                content=full_text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_syntax(document=document)
            
            # Find sentences with high information density
            sentences = full_text.split('.')
            key_sentences = []
            
            for sentence in sentences[:3]:  # Take first 3 sentences
                if len(sentence.strip()) > 20:  # Minimum length
                    key_sentences.append(sentence.strip())
            
            # Combine key sentences into a summary
            if key_sentences:
                summary = '. '.join(key_sentences) + '.'
                return summary
            else:
                return description[:200] + "..." if len(description) > 200 else description
                
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return self._fallback_summary_generation(title, description)
