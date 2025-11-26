import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalysisRecord {
  id: string;
  title: string;
  createdAt: string;
  riskLevel: RiskLevel;
  fileName?: string;
  provider?: string;
}

interface AnalysisHistoryContextValue {
  records: AnalysisRecord[];
  isLoading: boolean;
  addRecord: (record: Omit<AnalysisRecord, 'id' | 'createdAt'> & {
    createdAt?: string;
  }) => void;
  deleteRecord: (id: string) => Promise<void>;
  clearRecordsForCurrentUser: () => void;
  refreshRecords: () => Promise<void>;
}

const AnalysisHistoryContext = createContext<AnalysisHistoryContextValue | undefined>(undefined);

export const AnalysisHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshRecords = async () => {
    if (!user) {
      setRecords([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await api.get('/analysis', {
        params: { limit: 50, offset: 0 },
      });

      const fetchedRecords: AnalysisRecord[] = data.data.analyses.map((analysis: any) => ({
        id: analysis.id,
        title: analysis.title,
        createdAt: analysis.created_at,
        riskLevel: analysis.risk_level,
        fileName: analysis.file_name,
      }));

      setRecords(fetchedRecords);
    } catch (error) {
      console.error('분석 이력 조회 실패:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshRecords();
    } else {
      setRecords([]);
    }
  }, [user]);

  const addRecord = (record: Omit<AnalysisRecord, 'id' | 'createdAt'> & { createdAt?: string }) => {
    if (!user) return;

    refreshRecords();
  };

  const deleteRecord = async (id: string) => {
    try {
      await api.delete(`/analysis/${id}`);
      await refreshRecords();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '삭제에 실패했습니다');
    }
  };

  const clearRecordsForCurrentUser = () => {
    setRecords([]);
  };

  return (
    <AnalysisHistoryContext.Provider
      value={{
        records,
        isLoading,
        addRecord,
        deleteRecord,
        clearRecordsForCurrentUser,
        refreshRecords,
      }}
    >
      {children}
    </AnalysisHistoryContext.Provider>
  );
};

export const useAnalysisHistory = () => {
  const context = useContext(AnalysisHistoryContext);
  if (context === undefined) {
    throw new Error('useAnalysisHistory must be used within an AnalysisHistoryProvider');
  }
  return context;
};
