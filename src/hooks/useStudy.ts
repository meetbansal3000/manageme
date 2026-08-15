import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';

export interface StudyDocument {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  dateCreated: string;
}

export interface Flashcard {
  id: string;
  documentId?: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'new' | 'learning' | 'mastered';
  dateCreated?: string;
}

const DOCS_STORAGE_KEY = 'manageme_study_documents';
const CARDS_STORAGE_KEY = 'manageme_flashcards';

export function useStudy() {
  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    try {
      const saved = localStorage.getItem(DOCS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load study docs from localStorage:', e);
    }
    return [];
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(CARDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load flashcards from localStorage:', e);
    }
    return [];
  });

  const [loading, setLoading] = useState(true);

  // Load from Supabase if authenticated, else fallback to localStorage
  const loadStudyData = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        // Fetch study_documents
        const { data: docsData, error: docsErr } = await supabase
          .from('study_documents')
          .select('*')
          .order('id', { ascending: false });

        if (!docsErr && docsData && docsData.length > 0) {
          const mappedDocs: StudyDocument[] = docsData.map(d => ({
            id: String(d.id),
            title: d.title || 'Untitled Doc',
            content: d.content || '',
            summary: d.summary || '',
            category: d.category || 'General',
            dateCreated: d.created_at || d.dateCreated || new Date().toISOString(),
          }));
          setDocuments(mappedDocs);
          localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(mappedDocs));
        }

        // Fetch flashcards
        const { data: cardsData, error: cardsErr } = await supabase
          .from('flashcards')
          .select('*')
          .order('id', { ascending: false });

        if (!cardsErr && cardsData && cardsData.length > 0) {
          const mappedCards: Flashcard[] = cardsData.map(c => ({
            id: String(c.id),
            documentId: c.document_id || c.documentId || undefined,
            front: c.front || c.question || '',
            back: c.back || c.answer || '',
            difficulty: c.difficulty || 'medium',
            status: c.status || 'new',
            dateCreated: c.created_at || c.dateCreated || new Date().toISOString(),
          }));
          setFlashcards(mappedCards);
          localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(mappedCards));
        }
      }
    } catch (err) {
      console.warn('Supabase study data load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyData();
  }, [loadStudyData]);

  // Persist Document
  const addDocument = async (docData: Omit<StudyDocument, 'id'> & { id?: string }) => {
    const docId = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullDoc: StudyDocument = {
      ...docData,
      id: docId,
      dateCreated: docData.dateCreated || new Date().toISOString(),
    };

    const updated = [fullDoc, ...documents.filter(d => d.id !== docId)];
    setDocuments(updated);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('study_documents').upsert({
          id: fullDoc.id,
          user_id: userId,
          title: fullDoc.title,
          content: fullDoc.content,
          summary: fullDoc.summary || null,
          category: fullDoc.category || 'General',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist study document to Supabase:', err);
    }
  };

  const updateDocument = async (id: string, fields: Partial<StudyDocument>) => {
    let updatedDoc: StudyDocument | undefined;
    const updated = documents.map(d => {
      if (d.id === id) {
        updatedDoc = { ...d, ...fields };
        return updatedDoc;
      }
      return d;
    });

    setDocuments(updated);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedDoc) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('study_documents').upsert({
            id: updatedDoc.id,
            user_id: userId,
            title: updatedDoc.title,
            content: updatedDoc.content,
            summary: updatedDoc.summary || null,
            category: updatedDoc.category || 'General',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync updated study document to Supabase:', err);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('study_documents').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to delete study document from Supabase:', err);
    }
  };

  // Persist Flashcard
  const addFlashcard = async (cardData: Omit<Flashcard, 'id'> & { id?: string }) => {
    const cardId = cardData.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullCard: Flashcard = {
      ...cardData,
      id: cardId,
      dateCreated: cardData.dateCreated || new Date().toISOString(),
    };

    const updated = [fullCard, ...flashcards.filter(c => c.id !== cardId)];
    setFlashcards(updated);
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('flashcards').upsert({
          id: fullCard.id,
          user_id: userId,
          document_id: fullCard.documentId || null,
          front: fullCard.front,
          back: fullCard.back,
          difficulty: fullCard.difficulty || 'medium',
          status: fullCard.status || 'new',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist flashcard to Supabase:', err);
    }
  };

  const updateFlashcard = async (id: string, fields: Partial<Flashcard>) => {
    let updatedCard: Flashcard | undefined;
    const updated = flashcards.map(c => {
      if (c.id === id) {
        updatedCard = { ...c, ...fields };
        return updatedCard;
      }
      return c;
    });

    setFlashcards(updated);
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedCard) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('flashcards').upsert({
            id: updatedCard.id,
            user_id: userId,
            document_id: updatedCard.documentId || null,
            front: updatedCard.front,
            back: updatedCard.back,
            difficulty: updatedCard.difficulty || 'medium',
            status: updatedCard.status || 'new',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync updated flashcard to Supabase:', err);
      }
    }
  };

  const deleteFlashcard = async (id: string) => {
    const updated = flashcards.filter(c => c.id !== id);
    setFlashcards(updated);
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('flashcards').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to delete flashcard from Supabase:', err);
    }
  };

  return {
    documents,
    flashcards,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    refreshStudyData: loadStudyData,
  };
}
