import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAnalysisHistory, RiskLevel } from './AnalysisHistoryContext';
import Reveal from './Reveal';
import { User, ShieldAlert, FileText, Clock, Trash2, LogIn, Save, Lock, AlertTriangle, UserX, AlertCircle } from 'lucide-react';

const MyPage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, changePassword, deleteAccount, isAuthLoading } = useAuth();
  const { records, clearRecordsForCurrentUser } = useAnalysisHistory();

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <section className="py-32 bg-[#FDFCF8] min-h-[70vh] flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <Reveal>
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">로그인이 필요합니다</h2>
              <p className="text-slate-600 mb-8">
                마이페이지는 로그인 후 이용하실 수 있습니다. <br />
                지금 바로 로그인하고 내 계약서 분석 이력을 확인해 보세요.
              </p>
              <button
                disabled
                className="px-8 py-3 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed"
              >
                상단 메뉴의 '로그인' 버튼을 이용해 주세요
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  const handleClearHistory = () => {
    if (window.confirm("정말로 모든 분석 이력을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) {
      clearRecordsForCurrentUser();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile({ name: profileName, email: profileEmail });
      setProfileMsg({ type: 'success', text: '회원정보가 저장되었습니다.' });
    } catch (error) {
      setProfileMsg({ type: 'error', text: '정보 수정 중 오류가 발생했습니다.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    try {
      await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg({ type: 'success', text: '비밀번호가 안전하게 변경되었습니다.' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (error: any) {
      setPwdMsg({ type: 'error', text: error.message || '비밀번호 변경 실패' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 이력이 삭제됩니다.")) {
      try {
        await deleteAccount();
        alert("탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
      } catch (error) {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">위험</span>;
      case 'medium':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">주의</span>;
      case 'low':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">양호</span>;
    }
  };

  return (
    <section className="py-24 bg-[#FDFCF8] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl space-y-10">

        <Reveal>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mt-16"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white shadow-md">
                {user.name.charAt(0)}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900 mb-1">
                    {user.name}님, 안녕하세요!
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{user.email}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="capitalize">{user.provider} 로그인</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">오늘 남은 점검 횟수</span>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${user.remainingChecksToday > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                        {user.remainingChecksToday} / 5
                      </span>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">매일 0시 초기화</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${user.remainingChecksToday > 0 ? 'bg-teal-500' : 'bg-red-400'}`}
                      style={{ width: `${(user.remainingChecksToday / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={50}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-teal-600" />
              계정 관리
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">프로필 수정</h4>
                {profileMsg && (
                  <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${
                    profileMsg.type === 'error'
                      ? 'bg-red-50 border border-red-100 text-red-600'
                      : 'bg-teal-50 border border-teal-100 text-teal-600'
                  }`}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{profileMsg.text}</span>
                  </div>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">이름</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder={user.name}
                      disabled={isAuthLoading}
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder={user.email}
                      disabled={isAuthLoading}
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    프로필 저장
                  </button>
                </form>
              </div>

              {user.provider === 'email' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">비밀번호 변경</h4>
                  {pwdMsg && (
                    <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${
                      pwdMsg.type === 'error'
                        ? 'bg-red-50 border border-red-100 text-red-600'
                        : 'bg-teal-50 border border-teal-100 text-teal-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{pwdMsg.text}</span>
                    </div>
                  )}
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">현재 비밀번호</label>
                      <input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="현재 비밀번호"
                        disabled={isAuthLoading}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">새 비밀번호</label>
                      <input
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="새 비밀번호"
                        disabled={isAuthLoading}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="새 비밀번호 확인"
                        disabled={isAuthLoading}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAuthLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      비밀번호 변경
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-900 mb-1">위험 구역</h4>
                    <p className="text-xs text-red-700 mb-4">
                      계정을 삭제하면 모든 분석 이력이 영구적으로 삭제되며 복구할 수 없습니다.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isAuthLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <UserX className="w-4 h-4" />
                      계정 영구 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  분석 이력
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  최근 분석한 계약서 목록입니다.
                </p>
              </div>
              {records.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  이력 모두 삭제
                </button>
              )}
            </div>

            <div className="p-0">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-400 mb-2">아직 분석한 계약서가 없습니다.</h4>
                  <p className="text-slate-400 text-sm mb-6">
                    사전 점검하기에서 계약서를 업로드하고 위험 조항을 찾아보세요.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                          record.riskLevel === 'high' ? 'bg-red-50 text-red-500' :
                          record.riskLevel === 'medium' ? 'bg-orange-50 text-orange-500' :
                          'bg-green-50 text-green-500'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                              {record.title}
                            </h4>
                            {getRiskBadge(record.riskLevel)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(record.createdAt).toLocaleString()}
                            </span>
                            {record.fileName && (
                              <>
                                <span className="w-0.5 h-0.5 bg-slate-400 rounded-full"></span>
                                <span className="truncate max-w-[150px]">{record.fileName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:border-teal-300 hover:text-teal-600 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                        상세 보기
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default MyPage;
