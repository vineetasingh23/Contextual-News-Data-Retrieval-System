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
            concepts = self._extract_concepts(query)
            intent = self._determine_intent(query, entities)
            
            return {
                "entities": entities,
                "intent": intent,
                "concepts": concepts,
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query with Google Cloud: {e}")
            # Return minimal fallback for critical errors
            return {
                "entities": [],
                "intent": "search",
                "concepts": [],
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
                try:
                    # Handle different versions of the API
                    salience = getattr(entity, 'salience', 0.0)
                    name = getattr(entity, 'name', None)
                    
                    if name and salience > 0.1:
                        entities.append(name)
                except Exception as e:
                    logger.debug(f"Error processing entity: {e}")
                    continue
                    
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
                try:
                    # Handle different versions of the API
                    pos_tag = getattr(token.part_of_speech, 'tag', None)
                    if pos_tag is None:
                        pos_tag = getattr(token.part_of_speech, 'Tag', None)
                    
                    if pos_tag in [
                        language_v1.PartOfSpeech.Tag.NOUN,
                        language_v1.PartOfSpeech.Tag.PROPER_NOUN,
                        language_v1.PartOfSpeech.Tag.ADJ
                    ]:
                        # Handle different versions of the text attribute
                        text_content = getattr(token.text, 'content', None)
                        if text_content is None:
                            text_content = str(token.text)
                        
                        if text_content.lower() not in ['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for']:
                            concepts.append(text_content)
                except Exception as e:
                    logger.debug(f"Error processing token: {e}")
                    continue
            
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
            # Simple fallback for critical errors
            if description:
                first_sentence = description.split('.')[0]
                if len(first_sentence) > 20:
                    return f"{title}. {first_sentence}."
                else:
                    return f"{title}. {description[:150]}..."
            else:
                return title
    

