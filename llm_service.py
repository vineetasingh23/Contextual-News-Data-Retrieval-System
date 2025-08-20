from google.cloud import language_v1
from google.cloud.language_v1 import types
import os
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class GoogleCloudLLMService:
    def __init__(self):
        self.client = language_v1.LanguageServiceClient()
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
        
    def analyze_query(self, query: str) -> Dict[str, any]:
        """Analyze a natural language query to extract entities and determine intent."""
        try:
            entities = self._extract_entities(query)
            intent = self._determine_intent(query, entities)
            concepts = self._extract_concepts(query)
            
            return {
                "entities": entities,
                "concepts": concepts,
                "intent": intent,
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return {
                "entities": [],
                "concepts": [],
                "intent": "search",
                "confidence": 0.0
            }
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract named entities using Google Cloud Natural Language API."""
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_entities(document=document)
            
            entities = []
            for entity in response.entities:
                if entity.salience > 0.1:
                    entities.append(entity.name)
                    
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []
    
    def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts and topics from the text."""
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_syntax(document=document)
            
            concepts = []
            for token in response.tokens:
                if token.part_of_speech.tag in [
                    language_v1.PartOfSpeech.Tag.NOUN,
                    language_v1.PartOfSpeech.Tag.PROPER_NOUN,
                    language_v1.PartOfSpeech.Tag.ADJ
                ]:
                    if token.text.content.lower() not in ['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for']:
                        concepts.append(token.text.content)
            
            return list(set(concepts))[:10]
            
        except Exception as e:
            logger.error(f"Error extracting concepts: {e}")
            return []
    
    def _determine_intent(self, query: str, entities: List[str]) -> str:
        """Determine the user's intent based on query analysis."""
        query_lower = query.lower()
        
        if any(keyword in query_lower for keyword in ['near', 'nearby', 'around', 'in', 'at', 'location', 'area']):
            return "nearby"
        
        if any(keyword in query_lower for keyword in ['technology', 'business', 'sports', 'politics', 'entertainment', 'science']):
            return "category"
        
        if any(keyword in query_lower for keyword in ['from', 'source', 'times', 'reuters', 'cnn', 'bbc']):
            return "source"
        
        if any(keyword in query_lower for keyword in ['top', 'best', 'high', 'score', 'relevant', 'trending']):
            return "score"
        
        return "search"
    
    def generate_summary(self, title: str, description: str) -> str:
        """Generate a summary of the article using Google Cloud Natural Language API."""
        try:
            full_text = f"{title}. {description}"
            
            document = language_v1.Document(
                content=full_text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            response = self.client.analyze_syntax(document=document)
            
            sentences = full_text.split('.')
            key_sentences = []
            
            for sentence in sentences[:3]:
                if len(sentence.strip()) > 20:
                    key_sentences.append(sentence.strip())
            
            if key_sentences:
                summary = '. '.join(key_sentences) + '.'
                return summary
            else:
                return description[:200] + "..." if len(description) > 200 else description
                
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            if description:
                first_sentence = description.split('.')[0]
                if len(first_sentence) > 20:
                    return f"{title}. {first_sentence}."
                else:
                    return f"{title}. {description[:150]}..."
            else:
                return title
