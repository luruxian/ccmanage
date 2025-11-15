import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserStore } from '@/store/user';
import request from '@/utils/request';
import JSZip from 'jszip';
import GettingStarted from '@/components/dashboard/GettingStarted'

interface ApiKey {
  id?: string;
  user_key_id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  usage_count?: number;
  last_used_at?: string;
  created_at: string;
  package_name?: string;
  activation_date?: string;
  expire_date?: string;
  remaining_days?: number;
  status?: string;
  total_credits?: number;
  remaining_credits?: number;
}

interface PlanInfo {
  has_active_plan: boolean;
  plan_type: string;
  credits_remaining: number;
  total_credits: number;
  usage_percentage: number;
}

interface DashboardContext {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Utility functions
const maskApiKey = (apiKey: string) => {
  if (!apiKey) return '-';
  if (apiKey.length <= 8) return apiKey;
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
};

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'inactive':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'active':
      return '激活';
    case 'expired':
      return '过期';
    case 'inactive':
    default:
      return '未激活';
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage > 50) return 'bg-green-500';
  if (percentage > 20) return 'bg-yellow-500';
  return 'bg-red-500';
};

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const getRemainingDaysClass = (days?: number) => {
  if (days === undefined || days === null) return 'text-muted-foreground';
  if (days <= 3) {
    return 'text-red-600 font-bold';
  } else if (days <= 7) {
    return 'text-yellow-600 font-bold';
  }
  return 'text-green-600';
};

const getRemainingCreditsClass = (remainingCredits?: number, totalCredits?: number) => {
  if (remainingCredits === undefined || totalCredits === undefined) return 'text-muted-foreground';
  if (!totalCredits || totalCredits <= 0) {
    return 'text-muted-foreground';
  }

  const percentage = (remainingCredits / totalCredits) * 100;

  if (percentage <= 10) {
    return 'text-red-600 font-bold';
  } else if (percentage <= 30) {
    return 'text-yellow-600 font-bold';
  }
  return 'text-green-600';
};

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey);
    alert('API密钥已复制到剪贴板');
  } catch (error) {
    alert('复制失败，请手动复制');
  }
};

// 下载配置函数
const downloadConfig = async (key: any) => {
  try {
    // 检查key对象是否有有效的ID
    const keyId = key.id || key.user_key_id;
    if (!keyId) {
      alert('密钥ID无效，无法下载配置');
      return;
    }

    console.log('下载配置请求 - 密钥ID:', keyId);
    const response: any = await request.get(`/keys/${keyId}/download-config`);
    console.log('下载配置响应:', response);

    if (response.config && response.filename) {
      // 创建 settings.json
      const settingsBlob = new Blob([JSON.stringify(response.config, null, 2)], {
        type: 'application/json'
      });

      // 创建 config.json - 基于 settings_template.json 的结构
      const configData = {
        primaryApiKey: key.api_key
      };
      const configBlob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      });

      // 创建ZIP文件
      const zip = new JSZip();
      zip.file('settings.json', settingsBlob);
      zip.file('config.json', configBlob);

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({type: 'blob'});

      // 创建下载链接
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claude-code-config.zip';
      document.body.appendChild(a);
      a.click();

      // 清理
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('配置文件下载成功，包含 settings.json 和 config.json');
    } else {
      alert('下载失败：响应数据格式错误');
    }
  } catch (error: any) {
    console.error('下载配置失败:', error);

    // 改进错误处理
    let message = '下载设置文件失败';
    if (error?.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    alert(message);
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const { activeTab, setActiveTab } = useOutletContext<DashboardContext>();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keyStats, setKeyStats] = useState({ active: 0 });

  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [usageRecords, setUsageRecords] = useState<any[]>([]);
  const [loadingUsageRecords, setLoadingUsageRecords] = useState(false);

  // 重置积分相关状态
  const [resetCreditsDialogVisible, setResetCreditsDialogVisible] = useState(false);
  const [resettingCredits, setResettingCredits] = useState(false);
  const [resetCreditsKey, setResetCreditsKey] = useState<ApiKey | null>(null);

  console.log('Dashboard组件开始渲染', { user, isLoggedIn });

  // 检查用户认证状态
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 加载用户密钥
  const loadUserKeys = async () => {
    try {
      setLoadingKeys(true);
      const response: any = await request.get('/keys/');
      setApiKeys(response.keys || []);

      // 更新统计数据
      const activeCount = (response.keys || []).filter((k: ApiKey) => k.status === 'active').length;
      setKeyStats({ active: activeCount });
    } catch (error) {
      console.error('获取密钥列表失败:', error);
    } finally {
      setLoadingKeys(false);
    }
  };



  // 加载使用记录
  const loadUsageRecords = async () => {
    if (!selectedApiKey) return;

    try {
      setLoadingUsageRecords(true);
      console.log('正在加载使用记录，API Key:', selectedApiKey.api_key);

      // 使用正确的API路径和参数格式
      const response: any = await request.get('/usage/history', {
        params: {
          api_key: selectedApiKey.api_key,
          page: 1,
          page_size: 20
        }
      });

      setUsageRecords(response.records || []);
      console.log('使用记录加载完成:', response.records?.length || 0, '条记录');
    } catch (error) {
      console.error('获取使用记录失败:', error);
      setUsageRecords([]);
    } finally {
      setLoadingUsageRecords(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadUserKeys();
    }
  }, [isLoggedIn]);

  // 当切换到使用历史标签页时加载使用记录
  useEffect(() => {
    if (activeTab === 'usage-history' && selectedApiKey) {
      loadUsageRecords();
    }
  }, [activeTab, selectedApiKey]);

  // 重置积分相关函数
  const resetCredits = (key: any) => {
    setResetCreditsKey(key);
    setResetCreditsDialogVisible(true);
  };

  // 确认重置积分
  const confirmResetCredits = async () => {
    if (!resetCreditsKey) return;

    try {
      setResettingCredits(true);

      // 检查key对象是否有有效的ID
      const keyId = resetCreditsKey.id || resetCreditsKey.user_key_id;
      if (!keyId) {
        alert('密钥ID无效，无法重置积分');
        return;
      }

      console.log('重置积分请求 - 密钥ID:', keyId);
      const response = await request.put(`/keys/${keyId}/reset-credits`);
      console.log('重置积分响应:', response);

      // 重新加载密钥列表以更新显示
      await loadUserKeys();

      // 安全地访问响应数据
      const message = response?.data?.message || '积分重置成功';
      alert(message);

      // 关闭弹窗
      setResetCreditsDialogVisible(false);
      setResetCreditsKey(null);
    } catch (error: any) {
      console.error('重置积分失败:', error);

      // 改进错误处理
      let message = '重置失败';
      if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      alert(message);
    } finally {
      setResettingCredits(false);
    }
  };

  // 处理重置积分取消
  const handleResetCreditsCancel = () => {
    setResetCreditsKey(null);
    setResetCreditsDialogVisible(false);
  };

  const renderKeysTab = () => (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API密钥一览</h2>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/key-activation')}>
            激活新密钥
          </Button>
          <Button variant="outline" onClick={loadUserKeys} disabled={loadingKeys}>
            刷新
          </Button>
        </div>
      </div>

      {/* 密钥统计 */}
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
          <div className="text-blue-600">🔑</div>
          <div>
            <div className="text-lg font-bold">{keyStats.active}</div>
            <div className="text-sm text-muted-foreground">激活密钥</div>
          </div>
        </div>
      </div>

      {/* API密钥表格 */}
      <Card>
        <CardContent className="p-0">
          {loadingKeys ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无密钥</h3>
              <p className="text-sm text-muted-foreground mb-4">
                您还没有创建任何API密钥
              </p>
              <Button onClick={() => navigate('/packages')}>
                立即激活密钥
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">订阅名称</TableHead>
                    <TableHead className="w-[200px]">API密钥</TableHead>
                    <TableHead className="w-[100px]">状态</TableHead>
                    <TableHead className="w-[120px]">激活时间</TableHead>
                    <TableHead className="w-[120px]">过期时间</TableHead>
                    <TableHead className="w-[100px]">剩余天数</TableHead>
                    <TableHead className="w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <React.Fragment key={key.user_key_id}>
                      {/* 第一行：主要信息 */}
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">
                            {key.package_name || '未知订阅'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {maskApiKey(key.api_key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyApiKey(key.api_key)}
                            >
                              复制
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(key.status)}`}>
                            {getStatusText(key.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {key.activation_date ? formatDateShort(key.activation_date) : '未激活'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {key.expire_date ? formatDateShort(key.expire_date) : '永久'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${getRemainingDaysClass(key.remaining_days)}`}>
                            {key.remaining_days !== null ? `${key.remaining_days}天` : '永久'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => {
                                console.log('点击履历按钮，API Key:', key.api_key);
                                setSelectedApiKey(key);
                                setActiveTab('usage-history');
                              }}
                            >
                              履历
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetCredits(key)}
                            >
                              重置积分
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadConfig(key)}
                            >
                              下载配置
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* 第二行：积分信息 */}
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <div className="flex justify-between items-center py-2">
                            <div className="flex space-x-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">总积分：</span>
                                <span>
                                  {key.total_credits !== null ? key.total_credits : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">剩余积分：</span>
                                <span className={getRemainingCreditsClass(key.remaining_credits, key.total_credits)}>
                                  {key.remaining_credits !== null ? key.remaining_credits : '-'}
                                </span>
                              </div>
                            </div>
                            {key.total_credits && key.total_credits > 0 && (
                              <div className="w-48">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">剩余积分</span>
                                  <span>
                                    {Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(Math.round(((key.remaining_credits || 0) / key.total_credits) * 100))}`}
                                    style={{ width: `${Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGettingStartedTab = () => (
    <div className="space-y-6">
      <GettingStarted />
    </div>
  );

  const renderPackagesTab = () => (
    <div className="text-center py-8">
      <div className="text-muted-foreground mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">订阅管理</h3>
      <p className="text-sm text-muted-foreground mb-4">
        浏览和管理您的订阅套餐
      </p>
      <Button onClick={() => navigate('/packages')}>
        查看所有套餐
      </Button>
    </div>
  );

  const renderUsageHistoryTab = () => (
    <div className="space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setActiveTab('keys');
            setSelectedApiKey(null);
          }}
        >
          ← 返回API密钥管理
        </Button>
        <h2 className="text-2xl font-bold">使用历史</h2>
      </div>

      {/* API密钥基本信息 */}
      {selectedApiKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔑</span>
              <span>API密钥信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">订阅名称:</span>
                <div className="mt-1">{selectedApiKey.package_name || '未知订阅'}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">API密钥:</span>
                <div className="mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {maskApiKey(selectedApiKey.api_key)}
                  </code>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">状态:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedApiKey.status)}`}>
                    {getStatusText(selectedApiKey.status)}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">激活时间:</span>
                <div className="mt-1">
                  {selectedApiKey.activation_date ? new Date(selectedApiKey.activation_date).toLocaleString('zh-CN') : '未激活'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用记录表格 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>使用记录</span>
            </CardTitle>
            <Button
              variant="outline"
              onClick={loadUsageRecords}
              disabled={loadingUsageRecords}
            >
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsageRecords ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : usageRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无使用记录</h3>
              <p className="text-sm text-muted-foreground">
                该API密钥暂无使用记录
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">请求时间</TableHead>
                    <TableHead className="w-[100px]">积分消耗</TableHead>
                    <TableHead className="w-[120px]">剩余积分</TableHead>
                    <TableHead className="w-[100px]">响应状态</TableHead>
                    <TableHead className="w-[200px]">服务类型</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {record.request_timestamp ? new Date(record.request_timestamp).toLocaleString('zh-CN') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.credits_used || 0}
                      </TableCell>
                      <TableCell>
                        {record.remaining_credits !== null && record.remaining_credits !== undefined ? (
                          <span className={getRemainingCreditsClass(record.remaining_credits, selectedApiKey?.total_credits)}>
                            {record.remaining_credits}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.response_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.response_status === 'success' ? '成功' : '失败'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.service}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'keys':
        return renderKeysTab();
      case 'getting-started':
        return renderGettingStartedTab();
      case 'packages':
        return renderPackagesTab();
      case 'usage-history':
        return renderUsageHistoryTab();
      default:
        return renderKeysTab();
    }
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
        <p className="text-muted-foreground">
          欢迎回来，{user?.name || '用户'}！管理您的API密钥和订阅
        </p>
      </div>

      {/* 标签页内容 */}
      <div>
        {renderTabContent()}
      </div>

      {/* 重置积分确认对话框 */}
      <Dialog open={resetCreditsDialogVisible} onOpenChange={setResetCreditsDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认重置积分</DialogTitle>
            <DialogDescription>
              您确定要重置此API密钥的积分吗？此操作将把积分恢复为初始值，无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {resetCreditsKey && (
              <div className="text-sm text-muted-foreground">
                <p><strong>订阅名称:</strong> {resetCreditsKey.package_name || '未知订阅'}</p>
                <p><strong>API密钥:</strong> {maskApiKey(resetCreditsKey.api_key)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleResetCreditsCancel}
              disabled={resettingCredits}
            >
              取消
            </Button>
            <Button
              onClick={confirmResetCredits}
              disabled={resettingCredits}
            >
              {resettingCredits ? '重置中...' : '确认重置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;